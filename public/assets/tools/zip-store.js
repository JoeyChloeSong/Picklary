/* ZIP (stored entries), UTF-8 filenames, CRC32; no runtime dependency. */
const table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function zipStore(entries){
  const encoder=new TextEncoder(),local=[],central=[];let offset=0,centralLength=0;
  const names=Object.keys(entries);if(names.length>65535)throw Error('Too many ZIP entries');
  const u16=(v,o,n)=>v.setUint16(o,n,true),u32=(v,o,n)=>v.setUint32(o,n,true);
  for(const name of names){
    if(!name||name.startsWith('/')||name.includes('\\')||/^[a-z]:/i.test(name)||name.split('/').includes('..'))throw Error('Unsafe ZIP filename');
    const label=encoder.encode(name),bytes=entries[name] instanceof Uint8Array?entries[name]:new Uint8Array(entries[name]);
    if(label.length>65535||bytes.length>0xffffffff)throw Error('ZIP64 is not supported');
    const checksum=crc32(bytes),lh=new Uint8Array(30+label.length),lv=new DataView(lh.buffer);
    u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x800);u16(lv,12,0x21);u32(lv,14,checksum);u32(lv,18,bytes.length);u32(lv,22,bytes.length);u16(lv,26,label.length);lh.set(label,30);
    const ch=new Uint8Array(46+label.length),cv=new DataView(ch.buffer);
    u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x800);u16(cv,14,0x21);u32(cv,16,checksum);u32(cv,20,bytes.length);u32(cv,24,bytes.length);u16(cv,28,label.length);u32(cv,42,offset);ch.set(label,46);
    local.push(lh,bytes);central.push(ch);offset+=lh.length+bytes.length;centralLength+=ch.length;
  }
  if(offset+centralLength>0xffffffff)throw Error('Archive too large; use smaller clips');
  const end=new Uint8Array(22),ev=new DataView(end.buffer);u32(ev,0,0x06054b50);u16(ev,8,names.length);u16(ev,10,names.length);u32(ev,12,centralLength);u32(ev,16,offset);
  const out=new Uint8Array(offset+centralLength+22);let n=0;for(const x of [...local,...central,end]){out.set(x,n);n+=x.length;}return out;
}
