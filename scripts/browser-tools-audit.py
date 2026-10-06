"""Restored tools: injected-DOM UI/interaction audit in managed Chromium.
No navigation policy changes. HTTP endpoints are separately tested by urllib.
External requests blocked. Browser storage is a clearly identified test double.
This does NOT certify the real browser FFmpeg/WASM export engine.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import os, re, json, time, base64, mimetypes, subprocess, urllib.request, zipfile
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
checks=[];errors=[];blocked=set();pages=[]
def ck(name,ok,detail=None):
    checks.append({'name':name,'ok':bool(ok),**({'detail':detail} if detail is not None else {})})
def inline_html(rel):
    file=ROOT/'dist'/rel.strip('/')/'index.html'
    soup=BeautifulSoup(file.read_text(),'html.parser')
    scripts=[]
    for link in soup.select('link[rel=stylesheet]'):
        style=soup.new_tag('style');style.string=(ROOT/'dist'/link['href'].lstrip('/')).read_text();link.replace_with(style)
    for img in soup.select('img[src]'):
        if img['src'].startswith('/'):
            f=ROOT/'dist'/img['src'].lstrip('/')
            img['src']='data:'+str(mimetypes.guess_type(f)[0])+';base64,'+base64.b64encode(f.read_bytes()).decode()
    for tag in soup.select('script[src]'):
        src=tag['src']
        if src.startswith('/'):scripts.append((ROOT/'dist'/src.lstrip('/')).read_text())
        tag.decompose()
    return str(soup),scripts
server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'8766'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for i in range(30):
        try:urllib.request.urlopen('http://127.0.0.1:8766/en/',timeout=1);break
        except Exception:time.sleep(.2)
    video=OUT/'tool-synthetic-video.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc=size=480x270:rate=24','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','4','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',str(video)],check=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
        ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True,reduced_motion='reduce')
        def net(route):
            if route.request.url.startswith(('blob:','data:')):route.continue_()
            else:blocked.add(route.request.url);route.abort()
        ctx.route('**/*',net)
        def load(rel,width=1440,stored=None,editor_mock=None):
            html,scripts=inline_html(rel)
            response=urllib.request.urlopen('http://127.0.0.1:8766'+rel,timeout=3);ck('HTTP '+rel,response.status==200)
            page=ctx.new_page();pages.append(page);page.set_viewport_size({'width':width,'height':1000 if width>500 else 844});page.on('pageerror',lambda e:errors.append(str(e)))
            page.set_content(html,wait_until='domcontentloaded')
            page.evaluate("""(stored)=>{window.__store=stored||{};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(window.__store,k)?window.__store[k]:null,setItem:(k,v)=>window.__store[k]=String(v),removeItem:k=>delete window.__store[k]}});} """,stored or {})
            if editor_mock:
                page.add_script_tag(content=editor_mock)
            for js in scripts:
                if editor_mock and 'window.CLIP_LITE_CONFIG' in js:
                    js=js.replace("await import('/assets/tools/ffmpeg-engine.js')","window.__mockEngine")
                page.add_script_tag(content=js)
            page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
            page.wait_for_timeout(70);page.evaluate('window.scrollTo(0,0)')
            return page
        # Geometry checks at four widths and both languages. No external image assertions.
        for width in [1440,1024,768,390,360]:
            for rel in ['/en/','/ko/dupr-self-check/','/en/clip-lite/','/ko/downloads/','/en/vision-rating/','/en/tour/schedule/']:
                p=load(rel,width)
                size=p.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})');ck(f'No overflow {width} {rel}',size['s']<=size['w']+1,size)
                ck(f'Tool labels never undefined {width} {rel}','undefined' not in p.locator('main').inner_text())
                if '/clip-lite/' in rel:
                    boxes=p.evaluate("""()=>{const a=document.querySelector('#videoShell').getBoundingClientRect(),b=document.querySelector('.transport').getBoundingClientRect();return {bottom:a.bottom,top:b.top}}""")
                    ck(f'Video and transport separate {width}',boxes['top']>=boxes['bottom']-1,boxes)
                if '/schedule/' in rel:
                    boxes=p.evaluate("""()=>{const a=document.querySelector('.schedule-hero-grid').getBoundingClientRect(),b=document.querySelector('.schedule-stats').getBoundingClientRect();return {bottom:a.bottom,top:b.top}}""")
                    ck(f'Schedule stats below hero {width}',boxes['top']>=boxes['bottom']-1,boxes)
                p.close()
        p=load('/ko/dupr-self-check/',390)
        ck('3D is default',p.locator('[data-court-toggle]').get_attribute('aria-pressed')=='true')
        ck('Cannot answer power before shot',p.locator('[data-opts=power] button').first.is_disabled())
        p.locator('[data-court-toggle]').click();ck('2D toggle',p.locator('[data-court-toggle]').get_attribute('aria-pressed')=='false')
        p.wait_for_timeout(350);p.locator('[data-court-toggle]').focus();p.keyboard.press('Enter');ck('Keyboard toggles once',p.locator('[data-court-toggle]').get_attribute('aria-pressed')=='true')
        p.wait_for_timeout(350);p.locator('[data-court-toggle]').dispatch_event('touchend');p.locator('[data-court-toggle]').dispatch_event('click');ck('Touch does not double-toggle',p.locator('[data-court-toggle]').get_attribute('aria-pressed')=='false')
        p.screenshot(path=str(OUT/'self-check-mobile.png'),full_page=True,animations='disabled');p.close()
        q=json.loads((ROOT/'data/self-check-en.json').read_text());byid={s['id']:s for s in q['scenarios']}
        def answer(page,perfect=True):
            id=page.locator('[data-dupr-quiz]').get_attribute('data-question-id');s=byid[id]
            def choose(group,scoring):
                buttons=page.locator('[data-opts="'+group+'"] button').all()
                values=[b.get_attribute('data-val') for b in buttons]
                value=(max if perfect else min)(values,key=lambda x:scoring.get(x,0))
                page.locator('[data-opts="'+group+'"] [data-val="'+value+'"]').click()
            if s['player']:choose('player',s['player'])
            choose('shot',s['shot']);choose('power',s['power']);choose('target',s['zone'])
            assert page.locator('[data-q-next]').is_enabled(),id
            page.locator('[data-q-next]').click()
            return id
        p=load('/en/dupr-self-check/')
        first=p.locator('[data-dupr-quiz]').get_attribute('data-question-id');answer(p)
        p.locator('[data-q-back]').click();ck('Back retains question and choice',p.locator('[data-dupr-quiz]').get_attribute('data-question-id')==first and p.locator('[data-q-next]').is_enabled());p.locator('[data-q-next]').click()
        ids=[first]
        for i in range(9):ids.append(answer(p))
        ck('Ten-question choice screen',p.locator('[data-q-choice]').is_visible());ck('No repeated questions in first ten',len(set(ids))==10)
        p.locator('[data-q-see]').click();ck('Result shows all ten reviews',p.locator('.qr').count()==10)
        score=float(p.locator('.dupr-result-card__score').inner_text());ck('Estimate is rounded and bounded',2<=score<=5.5 and re.fullmatch(r'\d\.\d',p.locator('.dupr-result-card__score').inner_text()) is not None)
        ck('History opt-in respected',p.evaluate("localStorage.getItem('picklary.dupr.history')") is None)
        p.locator('[data-reveal]').first.click();ck('Review explanation can be opened',p.locator('.qr__answer').first.is_visible())
        with p.expect_download() as dl:p.locator('[data-export-assessment]').click()
        f=OUT/'quiz-result-test.json';dl.value.save_as(f);r=json.loads(f.read_text());ck('JSON export has independent estimate and ten question answers',r['officialDupr'] is False and len(r['questions'])==10)
        p.evaluate('document.activeElement?.blur();window.scrollTo(0,0)');p.wait_for_timeout(80);p.screenshot(path=str(OUT/'self-check-result.png'),full_page=True,animations='disabled')
        p.locator('[data-q-retake]').click();p.locator('[data-save-assessment]').check()
        ids=[answer(p,False) for _ in range(10)];p.locator('[data-q-more]').click();ids.extend(answer(p,False) for _ in range(10))
        ck('Extended attempt uses twenty unique scenarios',len(set(ids))==20)
        ck('Extended result renders twenty reviews',p.locator('.qr').count()==20)
        stored=p.evaluate("JSON.parse(localStorage.getItem('picklary.dupr.history'))");ck('Opt-in stores completed attempt only',len(stored)==1 and stored[0]['m']>0)
        ck('Low-score attempt lower than perfect attempt',float(p.locator('.dupr-result-card__score').inner_text())<score)
        p.on('dialog',lambda d:d.accept());p.locator('[data-hist-clear]').click();ck('Clear history removes saved attempts',p.evaluate("localStorage.getItem('picklary.dupr.history')") is None)
        p.close()
        p=load('/en/dupr-self-check/',stored={'picklary.dupr.history':'not valid JSON'});ck('Invalid saved history does not break quiz',p.locator('[data-dupr-quiz]').is_visible());p.close()
        p=load('/en/clip-lite/')
        ck('Empty editor cannot export',p.locator('#exportBtn').is_disabled())
        p.locator('#videoInput').set_input_files(video)
        p.wait_for_function("Number.isFinite(document.querySelector('#video').duration)")
        ck('Local H264/AAC video metadata decoded',p.locator('#video').evaluate('(v)=>v.duration')>3.9)
        ck('Local video uses blob, not upload URL',p.locator('#video').get_attribute('src').startswith('blob:'))
        p.locator('#inInput').fill('0.2');p.locator('#outInput').fill('1.2');p.locator('#addDirect').click()
        ck('Direct IN/OUT adds one cut',p.locator('#cutCount').inner_text()=='1')
        p.locator('#outInput').fill('0.1');p.locator('#addDirect').click();ck('Reversed range rejected',p.locator('#cutCount').inner_text()=='1')
        p.locator('#outInput').fill('400');p.locator('#addDirect').click();ck('Outside duration rejected',p.locator('#cutCount').inner_text()=='1')
        p.locator('#video').evaluate('(v)=>v.currentTime=1.7');p.locator('#markIn').click();p.locator('#video').evaluate('(v)=>v.currentTime=2.8');p.locator('#markOut').click()
        ck('I/O controls add second cut',p.locator('#cutCount').inner_text()=='2')
        p.locator('[data-delete]').first.click();ck('Delete leaves playhead unchanged',p.locator('#cutCount').inner_text()=='1' and abs(p.locator('#video').evaluate('(v)=>v.currentTime')-2.8)<.1)
        with p.expect_download() as dl:p.locator('#exportCuts').click()
        f=OUT/'cuts-result-test.json';dl.value.save_as(f);r=json.loads(f.read_text());ck('Cut list export contains selected boundaries',r['schema']=='picklary.cuts.v1' and len(r['cuts'])==1 and abs(r['cuts'][0]['start']-1.7)<.1)
        ck('Export enabled after valid cuts',p.locator('#exportBtn').is_enabled())
        p.evaluate('document.activeElement?.blur();window.scrollTo(0,0)');p.wait_for_timeout(80);p.screenshot(path=str(OUT/'clip-editor-loaded.png'),full_page=True,animations='disabled');p.close()
        # Explicit adapter test double only: exercises cancellation and error reporting, not encoding.
        mock="""window.__mockEngine={fetchFile:async f=>new Uint8Array(await f.arrayBuffer()),FFmpeg:class{on(){}load(){return new Promise((res,rej)=>{this.reject=rej;window.__engine=this;});}terminate(){this.reject?.(new DOMException('Cancelled','AbortError'));}}};"""
        p=load('/en/clip-lite/',editor_mock=mock);p.locator('#videoInput').set_input_files(video);p.wait_for_function("Number.isFinite(document.querySelector('#video').duration)");p.locator('#inInput').fill('0');p.locator('#outInput').fill('1');p.locator('#addDirect').click();p.locator('#exportBtn').click();p.wait_for_function('!!window.__engine')
        ck('Export locks mutation controls',p.locator('#chooseBtn').is_disabled() and p.locator('#addDirect').is_disabled())
        p.keyboard.press('Escape');p.wait_for_function("!document.querySelector('#chooseBtn').disabled")
        ck('Cancel unlocks only after job exits',p.locator('#exportBtn').is_enabled() and 'cancel' in p.locator('#statusText').inner_text().lower());p.close()
        mock="""window.__mockEngine={FFmpeg:class{on(){}async load(){throw Error('intentional engine error');}terminate(){}}};"""
        p=load('/en/clip-lite/',editor_mock=mock);p.locator('#videoInput').set_input_files(video);p.wait_for_function("Number.isFinite(document.querySelector('#video').duration)");p.locator('#inInput').fill('0');p.locator('#outInput').fill('1');p.locator('#addDirect').click();p.locator('#exportBtn').click();p.wait_for_function("document.querySelector('#statusText').textContent.includes('Export failed')")
        ck('Failed export never claims original is finished edit','not been uploaded or returned' in p.locator('#statusText').inner_text() and p.locator('#exportBtn').is_enabled());p.close()
        for name,rel,width in [('self-check-desktop','/en/dupr-self-check/',1440),('downloads-desktop','/ko/downloads/',1440),('vision-desktop','/ko/vision-rating/',1440),('home-restored','/en/',1440),('clip-editor-mobile','/ko/clip-lite/',390)]:
            p=load(rel,width);p.screenshot(path=str(OUT/(name+'.png')),full_page=True,animations='disabled');p.close()
        ck('No uncaught JavaScript exceptions',len(errors)==0,errors)
        browser.close()
except Exception as e:
    ck('Browser run completed',False,str(e))
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
    report={'status':'PASS' if all(c['ok'] for c in checks) else 'FAIL','checks':checks,'renderMode':'injected local HTML/CSS/JS (no navigation policy change)','storage':'explicit in-memory test double','browserEncoder':'NOT TESTED: adapter double used ONLY for failure/cancellation; no actual WASM execution','videoPreview':'real local synthetic H264/AAC via Blob URL','remoteRequestsBlocked':len(blocked),'jsErrors':errors}
    (OUT/'browser-tools-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
    print(json.dumps({'status':report['status'],'checks':len(checks),'failures':[c for c in checks if not c['ok']]},indent=2,ensure_ascii=False))
    if report['status']!='PASS':raise SystemExit(1)
