import {CANNON,WIDTH,HEIGHT,aimAt,clampAngle} from './rules.js?v=50';

export function bindControls({canvas,aim,fire,swap,pause,enabled}) {
  let angle=0, pointer=null;
  const change=value=>{angle=clampAngle(value);aim(angle);};
  const point=e=>{const r=canvas.getBoundingClientRect();change(aimAt((e.clientX-r.left)*WIDTH/r.width,(e.clientY-r.top)*HEIGHT/r.height));};
  canvas.addEventListener('pointerdown',e=>{
    if(!enabled()||pointer!==null||e.button!==0)return;
    e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});point(e);
  });
  canvas.addEventListener('pointermove',e=>{if((pointer===e.pointerId||e.pointerType==='mouse'&&pointer===null)&&enabled())point(e);});
  canvas.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;pointer=null;if(enabled()){point(e);fire(angle);}});
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('lostpointercapture',()=>{pointer=null;});
  document.querySelector('#aim-left').onclick=()=>{if(enabled())change(angle-.09);};
  document.querySelector('#aim-right').onclick=()=>{if(enabled())change(angle+.09);};
  document.querySelector('#fire').onclick=()=>fire(angle);
  document.querySelector('#swap').onclick=swap;
  // Only capture game keys while the board has focus; normal form/button behavior remains intact.
  canvas.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()==='p'){e.preventDefault();pause();return;}
    if(!enabled())return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(angle+(e.key==='ArrowLeft'?-.045:.045));}
    if(e.code==='Space'||e.key==='Enter'){e.preventDefault();if(!e.repeat)fire(angle);}
    if(e.key.toLowerCase()==='x'){e.preventDefault();if(!e.repeat)swap();}
  });
  return {reset:()=>{angle=0;aim(0);}};
}
