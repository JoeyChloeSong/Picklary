/** Local preview, with exact migration redirects and real HTTP 404 responses. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DIST=path.join(ROOT,'dist');
const port=Number(process.env.PORT||process.argv[2]||8080);
if(!fs.existsSync(path.join(DIST,'index.html')))throw new Error('Run npm run build first.');
const routes=JSON.parse(fs.readFileSync(path.join(ROOT,'data/redirects.json'),'utf8'));
routes.unshift({from:'/',to:'/en/',status:301});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8',
 '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Read-only preview.');}
  const raw=new URL(req.url,'http://localhost').pathname;
  const red=routes.find(x=>x.from===raw);
  if(red){res.writeHead(red.status,{Location:red.to});return res.end();}
  const safe=path.resolve(DIST,'.'+decodeURIComponent(raw));
  if(safe!==DIST&&!safe.startsWith(DIST+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  let f=safe;
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory()){
   if(!raw.endsWith('/')){res.writeHead(301,{Location:raw+'/'});return res.end();}
   f=path.join(f,'index.html');
  }
  let status=200;if(!fs.existsSync(f)||!fs.statSync(f).isFile()){f=path.join(DIST,'404.html');status=404;}
  res.writeHead(status,{'Content-Type':mime[path.extname(f)]||'application/octet-stream',
   'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(f).pipe(res);
 }catch(e){res.writeHead(400);res.end('Invalid path');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Picklary preview http://127.0.0.1:${port}/en/`));
process.on('SIGTERM',()=>server.close());process.on('SIGINT',()=>server.close());
