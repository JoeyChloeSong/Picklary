/* Local worker; third-party core is fetched only after an explicit export action.
 * Configure coreBase to '/assets/vendor/ffmpeg-core' after npm run engine:cache.
 * The fallback loads pinned core JS/WASM from unpkg, never user video data.
 */
'use strict';
let ff=null;
const remote='https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
self.onmessage=async({data:{id,type,data}})=>{
  try{
    let result=null;
    if(type==='load'){
      if(!ff){
        let base=data.coreBase;
        if(!base){
          try {const r=await fetch('/assets/vendor/ffmpeg-core/ffmpeg-core.js',{method:'HEAD'});if(r.ok&&/javascript/.test(r.headers.get('content-type')||''))base='/assets/vendor/ffmpeg-core';} catch(_){}
        }
        base=base||remote;
        const coreURL=new URL(base+'/ffmpeg-core.js',self.location.href).href;
        const wasmURL=new URL(base+'/ffmpeg-core.wasm',self.location.href).href;
        importScripts(coreURL);
        if(typeof self.createFFmpegCore!=='function')throw Error('FFmpeg core factory not found');
        ff=await self.createFFmpegCore({mainScriptUrlOrBlob:coreURL+'#'+btoa(JSON.stringify({wasmURL})),locateFile:(name)=>name.endsWith('.wasm')?wasmURL:new URL(name,coreURL).href});
        ff.setLogger((data)=>self.postMessage({event:'log',data}));
        ff.setProgress((data)=>self.postMessage({event:'progress',data}));
      }
      result=true;
    }else{
      if(!ff)throw Error('Load the encoder first');
      if(type==='write'){ff.FS.writeFile(data.name,data.bytes);result=true;}
      else if(type==='read'){const bytes=ff.FS.readFile(data.name).slice();self.postMessage({id,data:bytes},[bytes.buffer]);return;}
      else if(type==='delete'){try{ff.FS.unlink(data.name);}catch(_){}result=true;}
      else if(type==='exec'){
        if(!Array.isArray(data.args)||!data.args.every(x=>typeof x==='string'))throw Error('Invalid encoder arguments');
        ff.setTimeout(-1);ff.exec(...data.args);result=ff.ret;ff.reset();
      }else throw Error('Unknown worker operation');
    }
    self.postMessage({id,data:result});
  }catch(error){self.postMessage({id,error:error?.message||String(error)});}
};
