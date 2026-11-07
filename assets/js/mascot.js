const root=new URL('../../',import.meta.url);
const poses=['sit','wave','play','celebrate'];
const messages={sit:['¡Hola!','¿Una partida?'],wave:['¡Miau!','¡A jugar!'],play:['¡Te pillo!','Otra ronda'],celebrate:['¡Bien hecho!','¡Eso es!']};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const widgets=[...document.querySelectorAll('[data-mascot]')];
const timers=new WeakMap();
function pose(button,name,say=true){
  const image=button.querySelector('img'),speech=button.querySelector('.mascot-speech');
  if(!image||!speech)return;
  image.src=new URL(`assets/mascot/${name}.webp`,root).href;
  button.dataset.pose=name;
  button.classList.remove('reacting');
  if(!reduceMotion.matches){void button.offsetWidth;button.classList.add('reacting');}
  if(say){speech.textContent=messages[name][Math.floor(Math.random()*messages[name].length)];button.classList.add('talking');}
  clearTimeout(timers.get(button));
  timers.set(button,setTimeout(()=>{button.classList.remove('talking','reacting');if(name!=='sit'){image.src=new URL('assets/mascot/sit.webp',root).href;button.dataset.pose='sit';}},2600));
}
for(const button of widgets){
  let next=1;
  button.addEventListener('click',()=>{pose(button,poses[next]);next=next%3+1;});
  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    button.addEventListener('mouseenter',()=>{if(button.dataset.pose==='sit')pose(button,'wave',false);});
  }
}
window.addEventListener('kcg:mascot',event=>{
  const mood=event.detail?.mood==='win'?'celebrate':event.detail?.mood==='try'?'play':'wave';
  widgets.forEach(button=>pose(button,mood));
});
