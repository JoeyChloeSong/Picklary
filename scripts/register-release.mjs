/** Register a user-supplied desktop ZIP. This never executes its contents.
 * --id vision-ko|vision-en|windows-editor --file PATH --version VERSION --reviewed
 * The flag attests to operator testing; the script only verifies structure/hash.
 */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),opt=k=>args.includes(k)?args[args.indexOf(k)+1]:null;
const id=opt('--id'),file=opt('--file'),version=opt('--version');
if(!id||!file||!version||!args.includes('--reviewed'))throw Error('Usage: npm run release:register -- --id vision-ko|vision-en|windows-editor --file PATH.zip --version VERSION --reviewed');
const metadata=path.join(ROOT,'data/app-releases.json'),rows=JSON.parse(fs.readFileSync(metadata)),entry=rows.find(r=>r.id===id);
if(!entry)throw Error('Unknown release id');
const bytes=fs.readFileSync(path.resolve(file));if(bytes.length<22||bytes.readUInt32LE(0)!==0x04034b50)throw Error('Not a ZIP archive');
let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(bytes.readUInt32LE(i)===0x06054b50){end=i;break;}
if(end<0)throw Error('ZIP directory not found');
if(bytes.readUInt16LE(end+4)!==0||bytes.readUInt16LE(end+6)!==0)throw Error('Multipart ZIP is not supported');
const n=bytes.readUInt16LE(end+10);let p=bytes.readUInt32LE(end+16);const names=[];
if(n===65535||p===0xffffffff)throw Error('Use a non-ZIP64 release or review it outside this helper');
for(let i=0;i<n;i++){
 if(p+46>bytes.length||bytes.readUInt32LE(p)!==0x02014b50)throw Error('Invalid ZIP directory');
 const flags=bytes.readUInt16LE(p+8),len=bytes.readUInt16LE(p+28),extra=bytes.readUInt16LE(p+30),comment=bytes.readUInt16LE(p+32);
 if(flags&1)throw Error('Encrypted ZIP is not supported');
 if(p+46+len>bytes.length)throw Error('Truncated ZIP directory');
 const name=bytes.subarray(p+46,p+46+len).toString('utf8').replaceAll('\\','/');
 if(name.startsWith('/')||/^[a-z]:/i.test(name)||name.split('/').includes('..'))throw Error('Unsafe ZIP path');
 if(/(?:^|\/)\.env(?:$|\.)|(?:^|\/)\.git\//i.test(name))throw Error('Remove secrets/development metadata before distribution');
 names.push(name);p+=46+len+extra+comment;
}
const launcher=names.some(n=>/\.(exe|cmd|bat)$/i.test(n)),implementation=names.some(n=>/\.(exe|py)$/i.test(n));
if(!launcher||!implementation)throw Error('This looks like documentation, not a complete application source/binary with a launcher');
if(entry.kind==='vision'&&!names.some(n=>/vision/i.test(n)))throw Error('No Vision application files found');
const base=path.basename(file).replace(/[^a-zA-Z0-9_.-]/g,'_');
if(!base.endsWith('.zip'))throw Error('Expected .zip extension');
fs.mkdirSync(path.join(ROOT,'releases'),{recursive:true});const dest=path.join(ROOT,'releases',base);
if(path.resolve(file)!==dest)fs.copyFileSync(file,dest);
Object.assign(entry,{file:base,version,reviewed:true,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),operatorReviewDate:new Date().toISOString().slice(0,10)});
fs.writeFileSync(metadata,JSON.stringify(rows,null,2)+'\n');
console.log('Registered',id,version,base,'entries:',names.length);
console.log('SHA256',entry.sha256);console.log('No code was executed or safety/accuracy certified. Run npm run check and test on the target Windows device.');
