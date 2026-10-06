/** Optional: package pinned FFmpeg core on the same origin; no auto-commit. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'public/assets/vendor/ffmpeg-core');fs.mkdirSync(dir,{recursive:true});
const downloads=[];
const manifest={package:'@ffmpeg/core',version:'0.12.6',retrievedAt:new Date().toISOString(),files:[]};
for(const name of ['ffmpeg-core.js','ffmpeg-core.wasm']){
 const url='https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/'+name;
 const response=await fetch(url,{signal:AbortSignal.timeout(180000)});if(!response.ok)throw Error('Download failed '+response.status+' '+url);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(name.endsWith('.wasm')&&bytes.subarray(0,4).toString('hex')!=='0061736d')throw Error('Not a WASM binary');
 if(name.endsWith('.js')&&!bytes.toString().includes('createFFmpegCore'))throw Error('Not an FFmpeg core script');
 downloads.push({name,bytes});manifest.files.push({name,url,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 console.log('Packaged',name,bytes.length);
}
for(const {name,bytes} of downloads)fs.writeFileSync(path.join(dir,name),bytes);
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
console.log('Core packaged. Review applicable FFmpeg/core and codec licences before redistributing.');
