/** Common presentation behavior. Gameplay and configuration remain inside each game. */
export function setupGameInterface({name,workspace='#game-workspace',fullscreen='#fullscreen',board}){
  const root=document.querySelector(workspace),button=document.querySelector(fullscreen);
  if(!root||!button)throw Error(`Interfaz incompleta: ${name}`);
  const active=()=>document.fullscreenElement===root||root.classList.contains('arcade-focus');
  function update(){const on=active();button.textContent=on?'⛶ Salir':'⛶';button.setAttribute('aria-label',on?'Salir de pantalla completa':'Jugar a pantalla completa');button.setAttribute('aria-pressed',String(on));button.style.width=on?'auto':'';}
  function leaveFocus(){root.classList.remove('arcade-focus');document.body.classList.remove('arcade-focus-open');update();button.focus({preventScroll:true});}
  button.addEventListener('click',async()=>{
    if(document.fullscreenElement===root){await document.exitFullscreen();return;}
    if(root.classList.contains('arcade-focus')){leaveFocus();return;}
    try{if(!root.requestFullscreen)throw Error('native fullscreen unavailable');await root.requestFullscreen();}
    catch{root.classList.add('arcade-focus');document.body.classList.add('arcade-focus-open');update();}
  });
  document.addEventListener('fullscreenchange',update);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.classList.contains('arcade-focus')){event.preventDefault();leaveFocus();}});
  // Picross updates its selected class itself; keep the shared mode semantics synchronized.
  const modeButtons=[...root.querySelectorAll('[data-mode]')];
  const syncModes=()=>modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('selected')||b.classList.contains('active'))));
  const observer=new MutationObserver(syncModes);modeButtons.forEach(b=>observer.observe(b,{attributes:true,attributeFilter:['class']}));syncModes();update();
  document.querySelector(board)?.setAttribute('data-game-board',name);
  return {leaveFocus};
}
