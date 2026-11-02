(()=>{
  const FX_BASE='assets/pixelfx/ui/';
  const cache=new Map();
  const style=document.createElement('style');
  style.textContent=`
    .pixelfx-stage{position:absolute;inset:0;z-index:44;pointer-events:none;overflow:hidden}
    .pixelfx-sprite{position:absolute;image-rendering:pixelated;background-repeat:no-repeat;transform:translate(-50%,-50%) scale(var(--fx-scale,1));transform-origin:center;filter:drop-shadow(0 8px 12px #0008)}
    .scene.fx-hit{animation:fxSceneHit .34s ease-out}
    .scene.fx-success{animation:fxSuccess .42s ease-out}
    @keyframes fxSceneHit{0%,100%{transform:translate(0)}20%{transform:translate(-5px,2px)}40%{transform:translate(5px,-2px)}60%{transform:translate(-3px,1px)}80%{transform:translate(2px)}}
    @keyframes fxSuccess{0%,100%{filter:none}35%{filter:brightness(1.22) saturate(1.25)}}
  `;
  document.head.appendChild(style);
  const scene=document.querySelector('.scene');
  if(!scene)return;
  let stage=document.querySelector('.pixelfx-stage');
  if(!stage){stage=document.createElement('div');stage.className='pixelfx-stage';scene.appendChild(stage)}

  function loadFx(id){
    if(cache.has(id))return cache.get(id);
    const p=fetch(`${FX_BASE}${id}/${id}.json?v=1`).then(r=>{if(!r.ok)throw new Error(`PixelFX ${id} metadata ${r.status}`);return r.json()});
    cache.set(id,p);return p;
  }
  async function playFx(id,{x=50,y=50,scale=1,hold=0}={}){
    try{
      const data=await loadFx(id),frames=data.frames||[],meta=data.meta||{},fx=meta.pixelfx||{};
      if(!frames.length)return;
      const el=document.createElement('div');
      el.className=`pixelfx-sprite fx-${id}`;
      el.style.left=x+'%';el.style.top=y+'%';el.style.setProperty('--fx-scale',scale);
      const first=frames[0].frame,w=first.w,h=first.h;
      el.style.width=w+'px';el.style.height=h+'px';
      el.style.backgroundImage=`url(${FX_BASE}${id}/${id}.png?v=1)`;
      if(meta.size)el.style.backgroundSize=`${meta.size.w}px ${meta.size.h}px`;
      stage.appendChild(el);
      const fps=Number(fx.fps)||30,step=1000/fps,start=performance.now();
      function draw(now){
        let i=Math.min(frames.length-1,Math.floor((now-start)/step));
        const f=frames[i].frame;el.style.backgroundPosition=`-${f.x}px -${f.y}px`;
        if(i<frames.length-1)requestAnimationFrame(draw);else setTimeout(()=>el.remove(),hold);
      }
      requestAnimationFrame(draw);
    }catch(err){console.warn('PixelFX playback failed',id,err)}
  }
  function pulse(cls){scene.classList.remove(cls);void scene.offsetWidth;scene.classList.add(cls);setTimeout(()=>scene.classList.remove(cls),500)}

  const originalAccept=window.accept;
  if(typeof originalAccept==='function')window.accept=function(){
    const out=originalAccept.apply(this,arguments);
    playFx('confetti',{x:50,y:45,scale:1.55});pulse('fx-success');
    return out;
  };
  const originalTimeout=window.timeout;
  let lastTimeout=0;
  if(typeof originalTimeout==='function')window.timeout=function(){
    const now=performance.now(),out=originalTimeout.apply(this,arguments);
    if(now-lastTimeout>700){lastTimeout=now;playFx('heart-lost',{x:50,y:43,scale:2.15,hold:120});pulse('fx-hit')}
    return out;
  };

  let warningPlayed=false;
  const time=document.getElementById('time');
  if(time){
    new MutationObserver(()=>{
      const n=parseFloat(time.textContent);
      if(Number.isFinite(n)&&n>0&&n<=3.05&&!warningPlayed){warningPlayed=true;playFx('countdown',{x:50,y:43,scale:1.35})}
      if(Number.isFinite(n)&&n>6)warningPlayed=false;
    }).observe(time,{childList:true,characterData:true,subtree:true});
  }
  window.RARE_PIXELFX={play:playFx};
})();