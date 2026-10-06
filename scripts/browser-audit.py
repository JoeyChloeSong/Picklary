"""Optional visual/interaction regression tests.
Requires Python + playwright and a Chromium executable. Standard CI uses Node tests.
Remote requests are deliberately blocked: this exercises failure handling, NOT
remote image availability. Run check-live.mjs --images separately after deployment.
"""
from pathlib import Path
import json, os, subprocess, sys, time, urllib.request
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'test-results'
OUT.mkdir(exist_ok=True)
server=subprocess.Popen(['node',str(ROOT/'scripts/serve.mjs')],cwd=ROOT,
    env={**os.environ,'PORT':'8765'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
checks=[];js_errors=[];blocked=set()
OFFLINE='--offline-render' in sys.argv
STORAGE={}

def check(name,value,detail=None):
    checks.append({'name':name,'ok':bool(value),**({'detail':detail} if detail is not None else {})})
def goto(page,rel):
    if OFFLINE:
        # Managed Chromium disallows URL navigation. Render our local build
        # in about:blank without changing policy. HTTP is checked separately.
        import re, base64, mimetypes
        from bs4 import BeautifulSoup
        try:
            response=urllib.request.urlopen('http://127.0.0.1:8765'+rel,timeout=3)
            check('HTTP '+rel,response.status==200,response.status)
        except Exception as e:check('HTTP '+rel,False,str(e))
        file=ROOT/'dist'/rel.strip('/')/'index.html'
        soup=BeautifulSoup(file.read_text(),'html.parser')
        for link in soup.select('link[rel=stylesheet]'):
            style=soup.new_tag('style')
            style.string=(ROOT/'dist'/link['href'].lstrip('/')).read_text()
            link.replace_with(style)
        for img in soup.select('img[src]'):
            src=img['src']
            if src.startswith('/'):
                f=ROOT/'dist'/src.lstrip('/')
                img['src']='data:'+str(mimetypes.guess_type(f)[0])+';base64,'+base64.b64encode(f.read_bytes()).decode()
        for script in soup.select('script[src]'):script.decompose()
        page.set_content(str(soup),wait_until='domcontentloaded')
        # Explicit test double only: opaque about:blank cannot access real localStorage.
        page.evaluate("""() => {
            window.__storage = window.__storage || {};
            Object.defineProperty(window,'localStorage',{configurable:true,value:{
              getItem(k){return Object.hasOwn(window.__storage,k)?window.__storage[k]:null},
              setItem(k,v){window.__storage[k]=String(v)},
              removeItem(k){delete window.__storage[k]}
            }});
        }""")
        js=next((ROOT/'dist/assets/js').glob('site.*.js')).read_text()
        page.add_script_tag(content=js)
        page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
        page.evaluate("document.activeElement?.blur(); window.scrollTo(0,0)")
        page.wait_for_timeout(100)
        return None
    r=page.goto('http://127.0.0.1:8765'+rel,wait_until='domcontentloaded',timeout=12000)
    page.evaluate("document.activeElement?.blur(); window.scrollTo(0,0)")
    page.wait_for_timeout(100)
    check('HTTP '+rel,r.status==200,r.status)
    return r
try:
    for _ in range(40):
        try:urllib.request.urlopen('http://127.0.0.1:8765/en/',timeout=1);break
        except Exception:time.sleep(.2)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),
            headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
        context=browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1,accept_downloads=True)
        def network(route):
            u=route.request.url
            if u.startswith('http://127.0.0.1:8765') or u.startswith(('blob:','data:')):
                route.continue_()
            else:
                blocked.add(u);route.abort()
        context.route('**/*',network)
        page=context.new_page()
        page.on('pageerror',lambda e:js_errors.append(str(e)))
        routes=['/en/','/ko/','/en/gear/','/ko/gear/paddles/','/en/gear/apparel/',
            '/en/tour/players/','/en/tour/schedule/','/ko/tour/schedule/','/en/tour/rankings/',
            '/en/tour/results/arizona-2026/','/en/learn/third-shot-drive-or-drop/','/ko/tools/review/']
        for width in [1440,768,390,360]:
            page.set_viewport_size({'width':width,'height':960})
            for rel in routes:
                goto(page,rel)
                dimensions=page.evaluate('({scroll:document.documentElement.scrollWidth,width:innerWidth})')
                check(f'No horizontal overflow {width} {rel}',dimensions['scroll']<=width+1,dimensions)
                headerbox=page.locator('.site-header').bounding_box()
                check(f'Header remains at top {width} {rel}',headerbox and headerbox['y']<60,headerbox)
                clashes=page.evaluate("""()=>Array.from(document.querySelectorAll('.product-card')).flatMap(card=>{
                    const image=card.querySelector('.media'),body=card.querySelector('.product-body');
                    if(!image||!body)return [];
                    const i=image.getBoundingClientRect(),b=body.getBoundingClientRect();
                    return b.top<i.bottom-1?[{imageBottom:i.bottom,textTop:b.top}]:[];
                })""")
                check(f'No product text/image overlap {width} {rel}',len(clashes)==0,clashes)

                if 'schedule/' in rel:
                    boxes=page.evaluate("""()=>{
                      const a=document.querySelector('.schedule-stats'),b=document.querySelector('.schedule-hero-grid');
                      return a&&b?{stats:a.getBoundingClientRect().top,hero:b.getBoundingClientRect().bottom}:null;
                    }""")
                    if boxes:check(f'Schedule stats below hero {width} {rel}',boxes['stats']>=boxes['hero'],boxes)
        page.set_viewport_size({'width':390,'height':844});goto(page,'/ko/')
        page.locator('.menu-toggle').click()
        check('Mobile menu opens',page.locator('.menu-toggle').get_attribute('aria-expanded')=='true')
        page.keyboard.press('Escape')
        check('Escape closes mobile menu',page.locator('.menu-toggle').get_attribute('aria-expanded')=='false')
        page.set_viewport_size({'width':1440,'height':1000});goto(page,'/en/gear/paddles/')
        total=page.locator('[data-product]:visible').count()
        page.locator('[data-product-search]').fill('no-such-product-qz')
        check('Empty search is explained',page.locator('[data-product-empty]').is_visible())
        page.locator('[data-reset-filter]').click()
        check('Filter reset restores all cards',page.locator('[data-product]:visible').count()==total)
        page.locator('[data-brand-filter]').select_option(label='Franklin')
        check('Brand filter works',page.locator('[data-product]:visible').count()==1)
        page.locator('[data-reset-filter]').click()
        for cb in page.locator('[data-compare]').all()[:3]:cb.check()
        check('Three-product comparison opens',page.locator('[data-compare-panel]').is_visible())
        check('Three columns in comparison',page.locator('[data-compare-content] article').count()==3)
        page.on('dialog',lambda d:d.accept())
        page.locator('[data-compare]').nth(3).click()
        check('Comparison capped at three',page.locator('[data-compare]:checked').count()==3)

        goto(page,'/en/tools/self-check/')
        groups=page.locator('#self-check fieldset')
        # Actual selectors are asserted below; errors should fail, not be hidden.
        for group in groups.all():group.locator('input[type=radio]').first.check()
        if groups.count():
            page.locator('#self-check button[type=submit]').click()
            check('Practice assessment produces result',page.locator('#self-check-output').is_visible())
        else:check('Six assessment question groups',False,'Selector not found')

        goto(page,'/en/tools/review/')
        page.locator('#review-time').fill('12.5')
        page.locator('#review-note').fill('<img src=x onerror=alert(1)>')
        page.locator('#review-change').fill('=1+1')
        page.locator('#review-form button[type=submit]').click()
        check('Worksheet row created',page.locator('#rally-count').inner_text()=='1')
        check('Notes rendered as text, not HTML',page.locator('#rally-list img').count()==0 and '<img' in page.locator('#rally-list').inner_text())
        page.locator('#save-notes').click()
        stored=page.evaluate("JSON.parse(localStorage.getItem('picklary-review-v1'))")
        check('Explicit browser save stores note only',stored and len(stored['rows'])==1)
        with page.expect_download() as download:
            page.locator('#export-csv').click()
        dest=OUT/'worksheet-test.csv';download.value.save_as(dest)
        csv=dest.read_text(encoding='utf-8-sig')
        check('CSV formula injection protected',"'=1+1" in csv and '12.5' in csv)
        with page.expect_download() as download:
            page.locator('#export-json').click()
        destjson=OUT/'worksheet-test.json';download.value.save_as(destjson)
        loaded=json.loads(destjson.read_text())
        check('JSON note export valid',len(loaded['rows'])==1 and loaded['version']==1)
        goto(page,'/en/tools/review/')
        check('Notes do not auto-load silently',page.locator('#rally-count').inner_text()=='0')
        page.locator('#load-notes').click()
        check('Explicit load restores note',page.locator('#rally-count').inner_text()=='1')
        page.locator('#clear-notes').click()
        check('Delete clears storage and current list',page.locator('#rally-count').inner_text()=='0' and
              page.evaluate("localStorage.getItem('picklary-review-v1')")==None)
        video=OUT/'sample-video.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i',
            'testsrc=size=320x180:rate=15','-t','4','-c:v','libx264','-pix_fmt','yuv420p',str(video)],check=True)
        page.locator('#review-file').set_input_files(video)
        page.wait_for_function("Number.isFinite(document.querySelector('#review-video').duration)")
        check('Local video metadata decoded',page.locator('#review-video').evaluate('(v)=>v.duration')>=3.9)
        page.locator('#review-video').evaluate('(v)=>v.currentTime=2.5')
        page.locator('#capture-time').click()
        check('Capture current video time',page.locator('#review-time').input_value()=='2.5')
        check('Local video uses blob URL',page.locator('#review-video').get_attribute('src').startswith('blob:'))
        # Screenshots of important desktop/mobile surfaces.
        for width,slug,rel in [
            (1440,'home-desktop','/en/'),(390,'home-mobile','/ko/'),
            (1440,'gear-desktop','/en/gear/'),(390,'paddles-mobile','/ko/gear/paddles/'),
            (1440,'schedule-desktop','/en/tour/schedule/'),(390,'schedule-mobile','/ko/tour/schedule/'),
            (1440,'results-desktop','/en/tour/results/arizona-2026/'),
            (1440,'guide-desktop','/en/learn/third-shot-drive-or-drop/'),
            (1440,'players-desktop','/en/tour/players/')]:
            page.close()
            page=context.new_page()
            page.on('pageerror',lambda e:js_errors.append(str(e)))
            page.set_viewport_size({'width':width,'height':1000 if width>500 else 844})
            goto(page,rel)
            page.screenshot(path=str(OUT/(slug+'.png')),full_page=True,animations='disabled')
        check('No uncaught JavaScript exceptions',len(js_errors)==0,js_errors)
        browser.close()
except Exception as e:
    check('Browser run completed',False,str(e))
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
    report={'status':'PASS' if all(x['ok'] for x in checks) else 'FAIL','checks':checks,
        'blockedRemoteRequests':len(blocked),'remoteImageAvailability':'NOT TESTED (external requests blocked)',
        'renderMode':'injected local HTML' if OFFLINE else 'local HTTP',
        'storageMode':'explicit test double (opaque about:blank)' if OFFLINE else 'native localStorage',
        'jsErrors':js_errors}
    (OUT/'browser-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
    print(json.dumps({'status':report['status'],'checks':len(checks),'failures':[x for x in checks if not x['ok']],
        'remoteImageAvailability':report['remoteImageAvailability']},indent=2))
    if report['status']!='PASS':sys.exit(1)
