
/* Presentation interactions only. Does not alter assessment or video processing. */
document.addEventListener('DOMContentLoaded',()=>{
 const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
 $$('[data-result-card]').forEach(card=>{
  const tabs=$$('[data-result-tab]',card),panels=$$('[data-result-panel]',card);
  const select=(tab,focus=false)=>{
   tabs.forEach(b=>{const current=b===tab;b.setAttribute('aria-selected',String(current));b.tabIndex=current?0:-1;});
   panels.forEach(p=>p.hidden=p.dataset.resultPanel!==tab.dataset.resultTab);
   if(focus)tab.focus();
  };
  tabs.forEach((tab,i)=>{
   tab.addEventListener('click',()=>select(tab));
   tab.addEventListener('keydown',e=>{
    let n;
    if(e.key==='ArrowRight')n=(i+1)%tabs.length;
    else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;
    else if(e.key==='Home')n=0;
    else if(e.key==='End')n=tabs.length-1;
    else return;
    e.preventDefault();select(tabs[n],true);
   });
  });
 });
 const brand=document.querySelector('[data-brand-filter]'),chips=$$('[data-brand-chip]');
 if(brand){
  const sync=()=>chips.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.brandChip===brand.value)));
  chips.forEach(b=>b.addEventListener('click',()=>{brand.value=b.dataset.brandChip;brand.dispatchEvent(new Event('change',{bubbles:true}));sync();}));
  brand.addEventListener('change',sync);
  document.querySelector('[data-reset-filter]')?.addEventListener('click',sync);
  sync();
 }
});
