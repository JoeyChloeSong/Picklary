/* Picklary same-origin worker adapter. Single-thread FFmpeg.wasm core; no video upload. */
export class FFmpeg {
  constructor(){ this.worker=null; this.pending=new Map(); this.handlers={}; this.seq=0; }
  on(event,fn){ (this.handlers[event] ||= []).push(fn); }
  request(type,data={},transfer=[]){
    if(!this.worker)return Promise.reject(new Error('Engine is not running'));
    const id=++this.seq;
    return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.worker.postMessage({id,type,data},transfer);});
  }
  async load({coreBase}={}){
    if(this.worker)return;
    this.worker=new Worker('/assets/tools/ffmpeg-worker.js');
    this.worker.onmessage=({data:m})=>{
      if(m.event){for(const fn of this.handlers[m.event]||[])fn(m.data);return;}
      const task=this.pending.get(m.id);if(!task)return;this.pending.delete(m.id);
      if(m.error)task.reject(new Error(m.error));else task.resolve(m.data);
    };
    this.worker.onerror=(e)=>{for(const p of this.pending.values())p.reject(new Error(e.message||'Encoding worker failed'));this.pending.clear();};
    let timer;
    try {return await Promise.race([this.request('load',{coreBase}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Engine load timed out. Check network access or package the engine locally.')),120000);})]);}
    catch(e){this.terminate();throw e;}finally{clearTimeout(timer);}
  }
  async writeFile(name,bytes){ const copy=new Uint8Array(bytes);return this.request('write',{name,bytes:copy},[copy.buffer]); }
  readFile(name){return this.request('read',{name});}
  deleteFile(name){return this.request('delete',{name});}
  exec(args){return this.request('exec',{args});}
  terminate(){
    this.worker?.terminate();this.worker=null;
    for(const p of this.pending.values())p.reject(new DOMException('Export cancelled','AbortError'));
    this.pending.clear();
  }
}
export async function fetchFile(file){return new Uint8Array(await file.arrayBuffer());}
