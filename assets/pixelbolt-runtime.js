(()=>{
  const BASE='assets/pixelbolt/';
  const files={
    idle:'student_idle.png',
    nervous:'student_idle_inhale.png',
    hot:'student_idle_exhale.png',
    correct:'student_idle_exhale.png',
    fail:'student_hurt_recoil.png',
    recover:'student_hurt_recover.png'
  };
  const style=document.createElement('style');
  style.textContent=`
    .studentWrap.pixelbolt-enabled{height:190px;display:flex;align-items:flex-end;justify-content:center;overflow:visible}
    .studentWrap.pixelbolt-enabled>svg{display:none!important}
    .pixelbolt-student{width:88px;height:99px;object-fit:contain;image-rendering:pixelated;transform:scale(1.7);transform-origin:50% 100%;filter:drop-shadow(0 6px 5px #0007);pointer-events:none}
    .seat.nervous .pixelbolt-student{animation:nervous .22s infinite alternate}
    .seat.hot .pixelbolt-student{animation:hotshake .11s infinite alternate}
    .seat.correct .pixelbolt-student{animation:jump .45s ease}
    .seat.fail .pixelbolt-student{animation:fail .6s ease}
  `;
  document.head.appendChild(style);

  function stateFor(seat){
    if(seat.classList.contains('fail'))return'fail';
    if(seat.classList.contains('correct'))return'correct';
    if(seat.classList.contains('hot'))return'hot';
    if(seat.classList.contains('nervous'))return'nervous';
    return'idle';
  }
  function wireSeat(seat){
    const wrap=seat.querySelector('.studentWrap');
    if(!wrap)return;
    wrap.classList.add('pixelbolt-enabled');
    let img=wrap.querySelector('.pixelbolt-student');
    if(!img){
      img=document.createElement('img');
      img.className='pixelbolt-student';
      img.alt='Pixelbolt student sprite';
      wrap.appendChild(img);
    }
    const state=stateFor(seat),next=BASE+files[state];
    if(img.getAttribute('src')!==next){img.src=next;img.dataset.state=state;}
  }
  function sync(){document.querySelectorAll('.seat').forEach(wireSeat)}
  const seats=document.getElementById('seats');
  if(!seats)return;
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})};
  new MutationObserver(schedule).observe(seats,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  sync();
  window.RARE_PIXELBOLT={sync,files};
})();
