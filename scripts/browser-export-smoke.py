"""Opt-in REAL browser export smoke test. Requires a normal (non-policy-blocked)
browser, Playwright, ffmpeg/ffprobe, and npm run engine:cache && npm run check.
No encoder mock. Used by the manual GitHub Action, not executed in restoration.
"""
from pathlib import Path
import os, time, json, subprocess, urllib.request, zipfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'test-results/browser-export';OUT.mkdir(parents=True,exist_ok=True)
if not (ROOT/'dist/assets/vendor/ffmpeg-core/ffmpeg-core.wasm').exists():raise SystemExit('Run npm run engine:cache && npm run check first.')
server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'8767'},stdout=subprocess.DEVNULL)
checks=[]
def probe(path):
    r=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-show_entries','stream=codec_name','-of','json',str(path)],capture_output=True,text=True,check=True)
    return json.loads(r.stdout)
try:
    for _ in range(40):
        try:urllib.request.urlopen('http://127.0.0.1:8767/en/clip-lite/',timeout=1);break
        except Exception:time.sleep(.2)
    video=OUT/'synthetic.mp4';subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc=size=320x180:rate=15','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','4','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',str(video)],check=True)
    with sync_playwright() as pw:
        options={'headless':True}
        if os.environ.get('CHROMIUM_PATH'):options['executable_path']=os.environ['CHROMIUM_PATH']
        browser=pw.chromium.launch(**options);ctx=browser.new_context(accept_downloads=True)
        # Use the app's download fallback, not the interactive OS Save dialog.
        ctx.add_init_script("Object.defineProperty(window,'showSaveFilePicker',{configurable:true,value:undefined})")
        p=ctx.new_page();p.goto('http://127.0.0.1:8767/en/clip-lite/',wait_until='domcontentloaded')
        p.locator('#videoInput').set_input_files(video);p.wait_for_function("Number.isFinite(document.querySelector('#video').duration)")
        for a,b in [(0.25,1.25),(2,3)]:p.locator('#inInput').fill(str(a));p.locator('#outInput').fill(str(b));p.locator('#addDirect').click()
        for mode in ['combined','separate','both']:
            p.locator(f'input[name=exportMode][value={mode}]').check()
            with p.expect_download(timeout=300000) as dl:p.locator('#exportBtn').click()
            download=dl.value;file=OUT/download.suggested_filename;download.save_as(file)
            p.wait_for_function("!document.querySelector('#exportBtn').disabled",timeout=30000)
            if mode=='combined':
                d=probe(file);assert abs(float(d['format']['duration'])-2)<.4,d;checks.append({'mode':mode,'ok':True,'ffprobe':d})
            else:
                with zipfile.ZipFile(file) as z:
                    assert z.testzip() is None;names=z.namelist();assert len(names)==(2 if mode=='separate' else 3),names
                    for n in names:
                        assert '/' not in n and n.endswith('.mp4');f=OUT/(mode+'_'+n);f.write_bytes(z.read(n));d=probe(f);expected=2 if 'combined' in n else 1;assert abs(float(d['format']['duration'])-expected)<.4,d
                    checks.append({'mode':mode,'ok':True,'files':names})
        browser.close()
except Exception as e:
    checks.append({'ok':False,'error':str(e)})
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
    report={'status':'PASS' if checks and all(c['ok'] for c in checks) else 'FAIL','scope':'Actual browser FFmpeg.wasm, synthetic 4s H264/AAC, OS download fallback, three export modes','checks':checks}
    (OUT/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
    if report['status']!='PASS':raise SystemExit(1)
