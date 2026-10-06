"""Native FFmpeg compatibility test. NOT a browser/WASM export test."""
from pathlib import Path
import subprocess, json, zipfile, hashlib
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'test-results/native-contract';OUT.mkdir(parents=True,exist_ok=True)
checks=[]
def run(args):
    return subprocess.run(args,cwd=OUT,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,check=True)
def ff(*a):return run(['ffmpeg','-hide_banner','-loglevel','error',*a])
def duration(name):
    p=run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',name]);return float(json.loads(p.stdout)['format']['duration'])
def ck(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
ff('-f','lavfi','-i','testsrc=size=320x180:rate=24','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','4','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest','-y','input.mp4')
for i,(start,seconds) in enumerate([(0.25,1.0),(2.0,1.0)],1):
    out=f'clip_{i:02}.mp4'
    ff('-ss',f'{start:.3f}','-i','input.mp4','-t',f'{seconds:.3f}','-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',out)
    d=duration(out);ck('Native clip '+str(i)+' duration',abs(d-seconds)<.2,d)
(OUT/'concat.txt').write_text("file 'clip_01.mp4'\nfile 'clip_02.mp4'\n")
ff('-f','concat','-safe','0','-i','concat.txt','-c','copy','-movflags','+faststart','-y','combined.mp4')
d=duration('combined.mp4');ck('Native concat approximately two seconds',abs(d-2)<.3,d)
ff('-ss','0.250','-i','input.mp4','-t','1.000','-map','0:v:0','-map','0:a:0?','-c:v','mpeg4','-q:v','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y','fallback.mp4')
ck('Native MPEG4 fallback command supported',abs(duration('fallback.mp4')-1)<.2)
ff('-i','input.mp4','-an','-c:v','copy','-y','silent.mp4')
ff('-ss','0.250','-i','silent.mp4','-t','1.000','-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y','silent-clip.mp4')
ck('Optional audio mapping accepts silent input',abs(duration('silent-clip.mp4')-1)<.2)
for file in (ROOT/'dist/downloads').glob('*.zip'):
    with zipfile.ZipFile(file) as z:
        ck('Actual ZIP CRC integrity '+file.name,z.testzip() is None,len(z.namelist()))
ck('Edited output differs from original',hashlib.sha256((OUT/'input.mp4').read_bytes()).digest()!=hashlib.sha256((OUT/'combined.mp4').read_bytes()).digest())
report={'status':'PASS' if all(c['ok'] for c in checks) else 'FAIL','scope':'Native FFmpeg CLI only; validates command compatibility and ZIP bytes, NOT FFmpeg.wasm browser execution','checks':checks}
(ROOT/'test-results/native-encode-contract.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if report['status']!='PASS':raise SystemExit(1)
