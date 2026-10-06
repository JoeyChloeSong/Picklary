"""Render the shipped HTML with embedded local images/CSS/JS.
External requests are blocked, NOT a CDN or hosted integration test.
Srcset candidates are structurally checked separately; rendering embeds the large local variant.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from PIL import Image
import json,base64,mimetypes,os
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
checks=[];errors=[];blocked=set()
def ck(name,ok,details=None):
 checks.append({'name':name,'ok':bool(ok),**({'details':details} if details is not None else {})})
def document(rel):
 soup=BeautifulSoup((ROOT/'dist'/rel.strip('/')/'index.html').read_text(),'html.parser');js=[]
 for link in soup.select('link[rel=stylesheet]'):
  el=soup.new_tag('style');el.string=(ROOT/'dist'/link['href'].lstrip('/')).read_text();link.replace_with(el)
 for im in soup.select('img[src]'):
  if im['src'].startswith('/'):
   path=ROOT/'dist'/im['src'].lstrip('/');im['src']='data:'+mimetypes.guess_type(path)[0]+';base64,'+base64.b64encode(path.read_bytes()).decode()
   im.attrs.pop('srcset',None);im.attrs.pop('sizes',None);im['loading']='eager'
 for sc in soup.select('script[src]'):
  js.append((ROOT/'dist'/sc['src'].lstrip('/')).read_text());sc.decompose()
 return str(soup),js
registry=json.loads((ROOT/'data/menu-art.json').read_text())
for k,entry in registry.items():
 for v in entry['variants']:
  p=ROOT/'dist'/v['path'].lstrip('/');im=Image.open(p);im.load()
  ck('Image decodes with declared dimensions '+k+' '+str(v['width']),im.size==(v['width'],v['height']))
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking'])
  c=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
  def route(r):
   if r.request.url.startswith(('data:','blob:')):r.continue_()
   else:blocked.add(r.request.url);r.abort()
  c.route('**/*',route)
  def load(rel,width=1440,height=1000):
   html,scripts=document(rel);p=c.new_page();p.set_default_timeout(12000);p.set_viewport_size({'width':width,'height':height})
   p.on('pageerror',lambda e:errors.append(str(e)))
   p.set_content(html,wait_until='domcontentloaded')
   p.evaluate("""()=>{window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__store[k]??null,setItem:(k,v)=>window.__store[k]=String(v),removeItem:k=>delete window.__store[k]}})}""")
   for js in scripts:p.add_script_tag(content=js)
   p.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'))")
   p.wait_for_function("Array.from(document.querySelectorAll('[data-navigation-art]')).every(i=>i.complete&&i.naturalWidth>0)")
   return p
  routes=['','gear/','gear/paddles/','gear/shoes/','learn/','level-check/','video-tools/','vision-rating/','downloads/','tour/','tour/schedule/','tour/players/']
  for width in [1440,1024,768,390,360]:
   for l in ['ko','en']:
    for rel in routes:
     p=load('/'+l+'/'+rel,width)
     dims=p.evaluate('({w:innerWidth,sw:document.documentElement.scrollWidth})')
     ck(f'No horizontal overflow {width} {l}/{rel}',dims['sw']<=dims['w']+1,dims)
     violations=p.evaluate("""()=>[...document.querySelectorAll('.menu-feature,.menu-guide,.menu-category-strip>a,.menu-hero-scene')].flatMap(e=>{
       const a=e.querySelector('.ux-feature-visual,.ux-guide-art,.menu-category-image')||(e.matches('.menu-hero-scene')?e.querySelector('img'):null),
       d=e.querySelector('.ux-feature-body,.ux-guide-copy')||(e.matches('.menu-category-strip>a')?e.querySelector(':scope>span'):e.querySelector('figcaption'));
       if(!a||!d)return[];const r=a.getBoundingClientRect(),s=d.getBoundingClientRect();return r.bottom>s.top+1?[{visual:r.bottom,copy:s.top}]:[]})""")
     ck(f'Image and label boxes separate {width} {l}/{rel}',not violations,violations)
     if not rel:
      ck(f'Six real image feature links {width} {l}',p.locator('.ux-feature-link').count()==6 and p.locator('.ux-feature-link img[data-navigation-art]').count()>=6)
      targets=p.locator('.ux-feature-link').evaluate_all('(es)=>es.map(e=>e.getAttribute("href"))')
      ck(f'Core tools preserved {width} {l}',all('/'+l+'/'+x+'/' in targets for x in ['dupr-self-check','vision-rating','clip-lite']))
      ratios=p.locator('.menu-feature').evaluate_all("es=>es.map(e=>e.querySelector('.ux-feature-visual').getBoundingClientRect().height/e.getBoundingClientRect().height)")
      ck(f'Images occupy most of each home card {width} {l}',min(ratios)>.50,ratios)
      ck(f'No duplicated screenshot gallery {width} {l}',p.locator('.ux-menu-gallery,.ux-gallery-card,.ux-legacy-shot').count()==0)
     if rel=='tour/schedule/':
      rect=p.evaluate("()=>{const a=document.querySelector('.schedule-hero-grid').getBoundingClientRect(),b=document.querySelector('.schedule-stats').getBoundingClientRect();return {bottom:a.bottom,stats:b.top}}")
      ck(f'Calendar statistics never overlay hero {width} {l}',rect['stats']>=rect['bottom']-1,rect)
     p.close()
    print('Completed viewport',width,l,flush=True)
  # Keyboard and focus: every large illustration tile is a normal named link.
  p=load('/ko/',390,844)
  names=p.locator('.ux-feature-link').evaluate_all("xs=>xs.map(x=>({href:x.getAttribute('href'),heading:x.querySelector('h2')?.textContent,tab:x.tabIndex}))")
  ck('All feature cards have visible names and natural keyboard focus',all(n['heading'] and n['tab']==0 for n in names),names)
  p.locator('.menu-toggle').click();ck('Mobile navigation opens',p.locator('#primary-nav').is_visible())
  p.keyboard.press('Escape');ck('Mobile navigation closes with Escape',p.locator('.menu-toggle').get_attribute('aria-expanded')=='false');p.close()
  for rel in ['dupr-self-check/','clip-lite/']:
   p=load('/ko/'+rel,390,844)
   ck('No redundant navigation artwork in active tool '+rel,p.locator('.page-intro img[data-navigation-art]').count()==0)
   ck('Mobile dock hidden on active tool '+rel,not p.locator('.ux-mobile-dock').is_visible());p.close()
  shots=[('home-desktop','/ko/',1440,1700),('home-mobile','/ko/',390,1800),('home-en','/en/',1440,1100),('gear-desktop','/ko/gear/',1440,1100),('gear-mobile','/ko/gear/',390,1500),('learn-desktop','/ko/learn/',1440,1200),('tour-desktop','/ko/tour/',1440,1150),('tools-desktop','/ko/video-tools/',1440,1150),('schedule-desktop','/ko/tour/schedule/',1440,1100)]
  for name,rel,w,h in shots:
   p=load(rel,w,h);p.evaluate("async()=>{await Promise.race([Promise.all([...document.querySelectorAll('img[src^=\"data:\"]')].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,1000))])}");p.wait_for_timeout(200);p.screenshot(path=str(OUT/(name+'.png')),animations='disabled')
   if name=='home-desktop':
    p.locator('.ux-quick-section').screenshot(path=str(OUT/'menu-cards.png'),animations='disabled')
   if name=='home-mobile':
    p.screenshot(path=str(OUT/'home-mobile-full.png'),full_page=True,animations='disabled')
   p.close()
  ck('No uncaught browser JavaScript errors',not errors,errors);b.close()
except Exception as e:ck('Audit completed',False,str(e))
report={'status':'PASS' if all(c['ok'] for c in checks) else 'FAIL','checks':len(checks),'failures':[c for c in checks if not c['ok']],'checksDetail':checks,'externalRequestsBlocked':sorted(blocked),'scope':'Actual browser renders of shipped HTML/CSS/JS with embedded local WebP. External requests blocked. localStorage is an in-memory stand-in. Responsive srcset file dimensions validated, rendering uses large candidate. Not hosted uptime, WASM encoding, native app or official rating validation.'}
(OUT/'image-menu-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ['checksDetail','externalRequestsBlocked']},ensure_ascii=False,indent=2))
raise SystemExit(0 if report['status']=='PASS' else 1)
