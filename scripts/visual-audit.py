"""Visual UX regression tests for v1.2.
Runs against local HTML; all external requests blocked. Stored images embedded unchanged.
Does not test remote CDN uptime, Windows apps, official ratings or WASM encoding.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json, os, base64, mimetypes, hashlib
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'test-results'
OUT.mkdir(exist_ok=True)
checks=[]; errors=[]; blocked=set()
def ck(name,ok,detail=None):
    checks.append({'name':name,'ok':bool(ok),**({'detail':detail} if detail is not None else {})})
def local_document(rel):
    soup=BeautifulSoup((ROOT/'dist'/rel.strip('/')/'index.html').read_text(),'html.parser')
    scripts=[]
    for tag in soup.select('link[rel=stylesheet]'):
        style=soup.new_tag('style')
        style.string=(ROOT/'dist'/tag['href'].lstrip('/')).read_text()
        tag.replace_with(style)
    for im in soup.select('img[src]'):
        if im['src'].startswith('/'):
            path=ROOT/'dist'/im['src'].lstrip('/')
            im['src']='data:'+str(mimetypes.guess_type(path)[0])+';base64,'+base64.b64encode(path.read_bytes()).decode()
            im['loading']='eager'
    for script in soup.select('script[src]'):
        scripts.append((ROOT/'dist'/script['src'].lstrip('/')).read_text());script.decompose()
    return str(soup),scripts
try:
 with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
    context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',accept_downloads=True)
    def net(route):
        u=route.request.url
        if u.startswith(('data:','blob:')):route.continue_()
        else:blocked.add(u);route.abort()
    context.route('**/*',net)
    def load(rel,width=1440,height=1000):
        html,scripts=local_document(rel)
        page=context.new_page();page.set_default_timeout(12000)
        page.set_viewport_size({'width':width,'height':height})
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='domcontentloaded')
        page.evaluate("""()=>{window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__store[k]??null,setItem:(k,v)=>window.__store[k]=String(v),removeItem:k=>delete window.__store[k]}})}""")
        for script in scripts:page.add_script_tag(content=script)
        page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
        page.wait_for_timeout(80)
        return page
    for width in [1440,1024,768,390,360]:
      for l in ['en','ko']:
       for rel in ['','gear/','gear/paddles/','gear/apparel/','tour/','tour/schedule/','level-check/','video-tools/','learn/']:
        p=load('/'+l+'/'+rel,width)
        dim=p.evaluate('({w:innerWidth,sw:document.documentElement.scrollWidth})')
        ck(f'Viewport overflow {width} {l}/{rel}',dim['sw']<=dim['w']+1,dim)
        clashes=p.evaluate("""()=>Array.from(document.querySelectorAll('.ux-feature,.ux-guide,.product-card')).flatMap(c=>{
          const a=c.querySelector('.ux-feature-visual,.ux-guide-art,.product-photo'),b=c.querySelector('.ux-feature-body,.ux-guide-copy,.product-body');
          if(!a||!b)return [];const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return y.top<x.bottom-1?[{x:x.bottom,y:y.top}]:[];
        })""")
        ck(f'Visual/text boxes separate {width} {l}/{rel}',not clashes,clashes)
        image_spills=p.evaluate('''()=>Array.from(document.querySelectorAll('.ux-category-img .media-stage,.ux-mini-product-photo .media-stage,.product-photo .media-stage')).flatMap(stage=>{
          const im=stage.querySelector('img');if(!im)return [];const a=stage.getBoundingClientRect(),b=im.getBoundingClientRect();
          return b.top<a.top-1||b.bottom>a.bottom+1||b.left<a.left-1||b.right>a.right+1?[{stage:a.height,image:b.height}]:[];
        })''')
        ck(f'Images fit their viewports {width} {l}/{rel}',not image_spills,image_spills)
        if rel=='':
            ck(f'Six visible feature cards {width} {l}',p.locator('.ux-feature').count()==6)
            links=p.locator('.ux-feature-link').evaluate_all('(a)=>a.map(x=>x.getAttribute("href"))')
            ck(f'Original tools reachable {width} {l}',all('/'+l+'/'+r in links for r in ['dupr-self-check/','vision-rating/','clip-lite/']))
        if rel=='tour/schedule/':
            bounds=p.evaluate("()=>{let a=document.querySelector('.schedule-hero-grid').getBoundingClientRect(),b=document.querySelector('.schedule-stats').getBoundingClientRect();return [a.bottom,b.top]}")
            ck(f'Schedule stats follow hero {width} {l}',bounds[1]>=bounds[0]-1,bounds)
        p.close()
    # Real DOM switching and input controls, not just source-string checks.
    events=json.loads((ROOT/'data/results.json').read_text())
    for l in ['en','ko']:
      p=load('/'+l+'/tour/',390,844)
      for event in events:
        card=p.locator('[data-result-card]').filter(has=p.locator('#card-'+event['slug']+'-tab-0'))
        for i,row in enumerate(event['rows']):
            tab=p.locator('#card-'+event['slug']+'-tab-'+str(i));tab.click()
            ck(f'Single selected tab {l} {event["slug"]}/{i}',card.locator('[role=tab][aria-selected=true]').count()==1)
            panel=card.locator('[role=tabpanel]:visible')
            ck(f'Single matching panel {l} {event["slug"]}/{i}',panel.count()==1 and panel.get_attribute('data-result-panel')==str(i))
            txt=panel.inner_text()
            ck(f'Source result preserved {l} {event["slug"]}/{i}',all(name in txt for name in row['winner']+row['runnerUp']))
            for game in row['games']:
                ck(f'Game score unchanged {l} {event["slug"]}/{i}/{game}',('–'.join(map(str,game))) in txt)
            if not row['winner']:
                ck(f'Pending score never invented {l} {event["slug"]}/{i}',panel.locator('.ux-final-empty').count()==1 and '0–0' not in txt)
        first=p.locator('#card-'+event['slug']+'-tab-0')
        first.focus();p.keyboard.press('ArrowRight')
        idx=1 if len(event['rows'])>1 else 0
        ck(f'Keyboard right {l} {event["slug"]}',p.locator('#card-'+event['slug']+'-tab-'+str(idx)).get_attribute('aria-selected')=='true')
        p.keyboard.press('End')
        ck(f'Keyboard end {l} {event["slug"]}',p.locator('#card-'+event['slug']+'-tab-'+str(len(event['rows'])-1)).get_attribute('aria-selected')=='true')
      p.close()
    p=load('/ko/gear/paddles/',390,844)
    count=p.locator('[data-product]:visible').count()
    p.locator('[data-brand-chip="Franklin"]').click()
    ck('Brand chip filters actual cards',p.locator('[data-product]:visible').count()==1 and p.locator('[data-brand-filter]').input_value()=='Franklin')
    ck('Only one brand chip selected',p.locator('[data-brand-chip][aria-pressed=true]').count()==1)
    p.locator('[data-brand-filter]').select_option(label='Six Zero')
    ck('Dropdown updates chip',p.locator('[data-brand-chip="Six Zero"]').get_attribute('aria-pressed')=='true' and p.locator('[data-product]:visible').count()==2)
    p.locator('[data-reset-filter]').click()
    ck('Reset synchronizes chips and cards',p.locator('[data-brand-chip=""]').get_attribute('aria-pressed')=='true' and p.locator('[data-product]:visible').count()==count)
    for cb in p.locator('[data-compare]').all()[:3]:cb.check()
    ck('Product compare retained',p.locator('[data-compare-content] article').count()==3)
    p.close()
    p=load('/ko/',390,844)
    ck('Mobile dock has five labeled targets',p.locator('.ux-mobile-dock a').count()==5 and p.locator('.ux-mobile-dock').is_visible())
    p.locator('.menu-toggle').click()
    ck('Full menu remains available',p.locator('#primary-nav').is_visible())
    p.keyboard.press('Escape');ck('Menu Escape retained',p.locator('.menu-toggle').get_attribute('aria-expanded')=='false')
    p.close()
    for rel in ['dupr-self-check/','clip-lite/']:
        p=load('/ko/'+rel,390,844)
        ck('Dock does not cover working controls '+rel,not p.locator('.ux-mobile-dock').is_visible())
        p.close()
    # User-facing captures; no mocked product photos, remote images remain unavailable.
    shots=[('visual-home-desktop','/ko/',1440,1000),('visual-home-en','/en/',1440,1000),('visual-home-mobile','/ko/',390,844),
           ('visual-gear-desktop','/ko/gear/',1440,1000),('visual-tour-desktop','/ko/tour/',1440,1000),
           ('visual-tools-desktop','/ko/video-tools/',1440,1000),('visual-learn-desktop','/ko/learn/',1440,1000),
           ('visual-self-check','/ko/dupr-self-check/',1440,1000),('visual-clip','/ko/clip-lite/',1440,1000)]
    for name,rel,w,h in shots:
        p=load(rel,w,h)
        p.evaluate("document.activeElement?.blur();window.scrollTo(0,0)")
        p.screenshot(path=str(OUT/(name+'.png')),full_page=True,animations='disabled')
        if name=='visual-home-desktop':
            p.locator('.ux-quick-section').screenshot(path=str(OUT/'visual-six-cards.png'))
        p.close()
    ck('No uncaught JavaScript errors',not errors,errors)
    browser.close()
except Exception as e:
    ck('Visual test run completed',False,str(e))
report={'status':'PASS' if all(c['ok'] for c in checks) else 'FAIL','checks':len(checks),'failures':[c for c in checks if not c['ok']],'checksDetail':checks,'externalRequestsBlocked':sorted(blocked),'scope':'Local HTML/CSS/JS rendering. No external CDN availability, actual Windows runtime or browser encoder validation. In-memory localStorage stand-in.'}
(OUT/'visual-ux-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ['checksDetail','externalRequestsBlocked']},ensure_ascii=False,indent=2))
raise SystemExit(0 if report['status']=='PASS' else 1)
