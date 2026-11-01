(()=>{
  const scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  const base = new URL('.', scriptUrl);
  const parts = ['bg1.txt','bg2.txt','bg3.txt','bg4.txt'];

  async function loadScene(){
    try{
      const chunks = await Promise.all(parts.map(async name => {
        const res = await fetch(new URL(name, base), {cache:'no-store'});
        if(!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
        return (await res.text()).trim();
      }));
      const src = 'data:image/webp;base64,' + chunks.join('').replace(/\s+/g,'');
      window.RARE_SCENE = src;

      const apply = () => {
        const img = document.getElementById('sceneImg');
        if(!img) return false;
        img.onload = () => console.log('RARE classroom asset loaded', img.naturalWidth, img.naturalHeight);
        img.onerror = (e) => console.error('RARE classroom image decode failed', e);
        img.src = src;
        return true;
      };

      if(!apply()){
        if(document.readyState === 'loading'){
          document.addEventListener('DOMContentLoaded', apply, {once:true});
        }else{
          setTimeout(apply, 0);
        }
      }
    }catch(err){
      console.error('RARE classroom asset load failed:', err);
    }
  }

  loadScene();
})();
