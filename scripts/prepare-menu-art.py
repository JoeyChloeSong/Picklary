"""Deterministic crops of supplied Picklary menu art, not replacement product/player photos.
Requires Pillow only when regenerating; prebuilt WebP files are committed for normal builds.
Source artwork: user-supplied Picklary_v0.8.4_SOURCE_FINAL.zip, assets/img/.
Do not use the old sample ratings, DUPR verification badge, expert-tested claim or fake controls.
"""
from pathlib import Path
from PIL import Image, ImageOps
import json, hashlib
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'design/menu-originals'
OUT=ROOT/'public/assets/menu/v122'
OUT.mkdir(parents=True,exist_ok=True)
# Rectangles use fractions of the original image dimensions. Only image regions are used.
SPECS={
 'home-court':('play-hub-hero.webp',(.0,.19,.514,.865),'Players enjoying a pickleball session'),
 'self-check':('posts/third-shot-drop-vs-drive.webp',(.0,.16,1,.97),'Two shot choices on a pickleball court'),
 'video-review':('insights-dashboard-design.webp',(.354,.237,.66,.496),'A video review screen illustration'),
 'clip-rallies':('posts/dupr-balanced-score.webp',(.01,.405,.987,.717),'A rally on a video review screen'),
 'players':('pro-scene-dashboard-design.webp',(.105,.142,.44,.495),'A generic player profile illustration'),
 'results':('pro-scene-dashboard-design.webp',(.525,.153,.696,.49),'A gold tournament trophy'),
 'schedule':('play-hub-dashboard-design.webp',(.051,.574,.23,.858),'A trophy and calendar illustration'),
 'paddles':('gear-lab-dashboard-design.webp',(.387,.055,.586,.393),'A generic paddle illustration'),
 'balls':('gear-lab-dashboard-design.webp',(.101,.755,.229,.913),'Two pickleballs beside a net'),
 'shoes':('gear-lab-dashboard-design.webp',(.652,.14,.931,.38),'A generic court shoe illustration'),
 'apparel':('gear-lab-dashboard-design.webp',(.388,.547,.606,.866),'A court shirt and skirt illustration'),
 'accessories':('gear-lab-dashboard-design.webp',(.658,.547,.935,.855),'A gear bag, water bottle and towel'),
 'downloads':('insights-dashboard-design.webp',(.681,.233,.84,.5),'An illustrated app window and link'),
 'serve':('level-up-dashboard-design.webp',(.020,.60,.138,.792),'A serve illustrated with a paddle and ball'),
 'return':('level-up-dashboard-design.webp',(.164,.601,.282,.79),'A return illustrated with a paddle'),
 'dink':('level-up-dashboard-design.webp',(.313,.600,.421,.79),'A dink illustrated with a paddle and ball'),
 'drop':('level-up-dashboard-design.webp',(.454,.61,.565,.789),'A drop shot illustration'),
 'reset':('level-up-dashboard-design.webp',(.596,.60,.705,.79),'A reset illustrated with a paddle'),
 'position':('level-up-dashboard-design.webp',(.733,.605,.845,.798),'Court positioning illustration'),
 'confidence':('level-up-dashboard-design.webp',(.876,.606,.986,.788),'Learning and improvement illustration'),
 'guide-reset':('posts/backhand-reset-soft-control.webp',(.017,.34,.98,.788),'A player preparing a low reset'),
 'guide-dink':('posts/dink-rally-consistency.webp',(.015,.265,.99,.815),'A controlled dink exchange'),
 'guide-position':('posts/doubles-middle-ball.webp',(.013,.178,.985,.8),'Players covering the middle of the court'),
}
registry={}
for key,(name,box,label) in SPECS.items():
 image=Image.open(SRC/name).convert('RGB')
 rect=tuple(round(v*(image.width if i%2==0 else image.height)) for i,v in enumerate(box))
 crop=image.crop(rect)
 variants=[]
 for width in (480,960):
  height=round(crop.height*width/crop.width)
  out=crop.resize((width,height),Image.Resampling.LANCZOS)
  import io
  buf=io.BytesIO();out.save(buf,format='WEBP',quality=86,method=6)
  data=buf.getvalue();digest=hashlib.sha256(data).hexdigest()
  filename=f'{key}-{width}.{digest[:10]}.webp'
  (OUT/filename).write_bytes(data)
  variants.append({'path':'/assets/menu/v122/'+filename,'width':width,'height':height,'bytes':len(data),'sha256':digest})
 registry[key]={'kind':'navigation-illustration','alt':label,'source':name,'sourceSha256':hashlib.sha256((SRC/name).read_bytes()).hexdigest(),'crop':list(rect),'variants':variants}
# Clean obsolete hashed files, but preserve every file referenced by the registry.
keep={Path(v['path']).name for r in registry.values() for v in r['variants']}
for p in OUT.glob('*.webp'):
 if p.name not in keep:p.unlink()
(ROOT/'data/menu-art.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
print(f'{len(registry)} navigation illustrations / {len(keep)} WebP files / {sum(p.stat().st_size for p in OUT.glob("*.webp")):,} bytes')
