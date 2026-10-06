import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {zipStore} from '../public/assets/tools/zip-store.js';
export function packageTools(ROOT,OUT,site){
 const entries={},enc=new TextEncoder(),put=(name,data)=>entries[name]=typeof data==='string'?enc.encode(data):data;
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
 // Include only the files needed by the web editor; exclude other tools and source archives.
 for(const file of walk(path.join(OUT,'assets'))){
  const rel=path.relative(OUT,file).split(path.sep).join('/');
  if((rel==='assets/favicon.svg'||/^assets\/(css\/(?:site|visual|menu)\.|js\/(?:site|visual)\.|tools\/|vendor\/ffmpeg-core\/)/.test(rel))&&!rel.includes('self-check'))put(rel,fs.readFileSync(file));
 }
 for(const l of site.locales){
  let html=fs.readFileSync(path.join(OUT,l,'clip-lite/index.html'),'utf8');
  html=html.replace(/<a class="skip-link"[^]*?<main id="main">/,'<main id="main">');
  html=html.replace(/<nav class="ux-mobile-dock"[^]*?<\/nav>/,'');
  html=html.replace(/<footer class="site-footer">[^]*?<\/footer>/,'');
  html=html.replace(/href="(\/(?:en|ko)\/[^"]*|\/downloads\/[^"]*)"/g,(_,u)=>`href="${site.url}${u}"`);
  html=html.replace(/class="lang-switch" href="[^"]*\/(en|ko)\/clip-lite\/"/g,(_,lang)=>`class="lang-switch" href="/${lang}/"`);
  html=html.replace('content="index,follow"','content="noindex,follow"');
  put(l+'/index.html',html);
 }
 put('server.mjs',`import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.wasm':'application/wasm','.json':'application/json','.svg':'image/svg+xml'};
http.createServer((req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}const u=new URL(req.url,'http://127.0.0.1');if(u.pathname==='/'){res.writeHead(302,{Location:'/en/'});res.end();return;}let p=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});if(req.method==='HEAD'){res.end();return;}fs.createReadStream(p).pipe(res);}catch(e){res.writeHead(400);res.end('Invalid path');}}).listen(8877,'127.0.0.1',()=>console.log('Picklary Clip Web: http://127.0.0.1:8877/en/ | http://127.0.0.1:8877/ko/'));`);
 put('START_WINDOWS.bat','@echo off\r\ncd /d "%~dp0"\r\nwhere node >nul 2>nul\r\nif errorlevel 1 (echo Install Node.js 22 or newer, then retry. & pause & exit /b 1)\r\necho Open http://127.0.0.1:8877/en/ or /ko/ in your browser.\r\nnode server.mjs\r\npause\r\n');
 put('START_MAC_LINUX.sh','#!/bin/sh\ncd "$(dirname "$0")" || exit 1\nnode server.mjs\n');
 put('README.txt','Picklary Clip Web 1.2.0 - local browser edition\n\nThis is NOT Picklary Lite Windows v0.9.8 and does not include DualCam, POV, or Join.\nRequires Node.js 22+ and a modern browser. Run START_WINDOWS.bat, or node server.mjs.\nOpen http://127.0.0.1:8877/en/ or http://127.0.0.1:8877/ko/.\nDo not open index.html as file://.\nSource video stays on your computer. The encoding core loads on first export.\nUnless cached in assets/vendor/ffmpeg-core, pinned FFmpeg core JS/WASM are fetched from unpkg.com.\nNo source footage is uploaded. Initial engine loading needs network access.\nInput limit in this web edition: 750 MB; actual limits depend on device memory.\nUse your existing native program for large 4K/HEVC files and advanced features.\nBrowser MP4 export integration is supplied; the restoration environment did not permit an end-to-end browser encoder test. Test a small clip before relying on a long export.\n');
 put('THIRD_PARTY_NOTICES.txt',fs.readFileSync(path.join(ROOT,'THIRD_PARTY_NOTICES.md')));
 const dest=path.join(OUT,'downloads');fs.mkdirSync(dest,{recursive:true});
 const webFile='Picklary_Clip_Web_v1.2.0_Local.zip';fs.writeFileSync(path.join(dest,webFile),zipStore(entries));
 const docs={};
 for(const file of walk(path.join(ROOT,'legacy/vision-documents'))){if(file.includes('v0.2.4'))docs[path.basename(file)]=fs.readFileSync(file);}
 docs['READ_FIRST_DOCUMENTS_ONLY.txt']=enc.encode('ARCHIVED DOCUMENTATION ONLY - NOT A PROGRAM\nThese are original v0.2.4 guides, changelogs and illustrative reports supplied with the website source.\nNo executable, model weights or installation environment is included.\nSample scores are not measurements of your video. Original performance/accuracy claims have not been independently validated in this restoration.\nThe working desktop program must be supplied separately.\n');
 fs.writeFileSync(path.join(dest,'Picklary_Vision_v0.2.4_Docs_Only.zip'),zipStore(docs));
 const sums=fs.readdirSync(dest).filter(n=>n.endsWith('.zip')).sort().map(n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(dest,n))).digest('hex')+'  '+n).join('\n')+'\n';
 fs.writeFileSync(path.join(dest,'checksums.txt'),sums);
 return {webEditor: webFile,visionDocs:'Picklary_Vision_v0.2.4_Docs_Only.zip'};
}
