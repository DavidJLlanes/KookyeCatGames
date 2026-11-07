import {LEVELS,MISS_LIMIT,configuration,localDate} from './rules.js?v=48';
import {newGame,launch,advance,swap,validGame} from './engine.js?v=48';
import {createRenderer} from './renderer.js?v=48';
import {bindControls} from './controls.js?v=48';
import {finalScore,reduceBubbleEvent} from './scoring.js?v=48';
import {createGameSound} from '../../assets/js/game-sound.js?v=48';
import {loadProfile,saveProfile,resetGameProgress} from '../../assets/js/storage.js?v=48';
import {dispatchGameEvent,recordArcadeAction,EVENT_VERSION} from '../../core/events.js?v=48';
import {arcadeXpForResult} from '../../core/scores.js?v=48';
import {ACHIEVEMENTS,achievementIcon,metricValue,getAchievementCounts,loadAchievementCatalog,unlockAchievements} from '../../assets/js/achievements.js?v=48';
import {exportGameBackup,restoreBackup} from '../../assets/js/backups.js?v=48';
import {downloadZip,readZip} from '../../assets/js/zip.js?v=48';
import {shareProgressCard,labelShareButtons} from '../../assets/js/share-card.js?v=48';
import {enablePwaUpdates} from '../../assets/js/pwa-update.js?v=48';

const $=s=>document.querySelector(s), ID='bubbleshooter', canvas=$('#board');
const draw=createRenderer(canvas), sound=createGameSound(ID);
const clock=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
let profile,game,angle=0,paused=false,queue=Promise.resolve(),frame=0,lastFrame=0,controls,nextAction,resetArmed=false;
const progress=()=>profile.games[ID];
const interactive=()=>Boolean(game&&!game.finished&&!paused&&!game.flight&&!document.hidden);

function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function save(){
  progress().active=game&&!game.finished?structuredClone(game):null;
  const snapshot=structuredClone(profile);
  queue=queue.catch(()=>{}).then(()=>saveProfile(snapshot));
  return queue;
}
function event(type,payload){dispatchGameEvent(profile,{version:EVENT_VERSION,gameId:ID,type,payload},{[ID]:reduceBubbleEvent});}
function redraw(){if(game)draw(game,angle,game.flight);}
function render(){
  const p=progress(),c=game.config;
  document.querySelectorAll('[data-mode]').forEach(b=>{const selected=b.dataset.mode===c.mode;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#level-label').hidden=c.mode!=='classic';
  $('#level').replaceChildren(...LEVELS.slice(0,Math.min(60,p.unlockedLevel)).map(l=>new Option(String(l.number).padStart(2,'0'),l.number)));
  $('#level').value=String(c.number);$('#chapter').textContent=c.chapter;$('#title').textContent=c.name;
  $('#score').textContent=game.score.toLocaleString('es-ES');$('#shots').textContent=game.shots;
  $('#combo').textContent=`${game.combo}×`;$('#time').textContent=clock(c.mode==='timed'?Math.max(0,120-game.elapsed):game.elapsed);
  $('#pressure-text').textContent=`${MISS_LIMIT-game.misses} tiros sin grupo para que baje el techo`;
  $('#pressure-bar').style.width=`${game.misses/MISS_LIMIT*100}%`;
  $('#progress').textContent=`${p.completedLevels.length} / 60 niveles`;$('#progress-bar').style.width=`${p.completedLevels.length/60*100}%`;
  $('#best').textContent=p.bestScore.toLocaleString('es-ES');
  $('#solved-count').textContent=p.solved;$('#played-count').textContent=p.gamesPlayed;$('#best-time').textContent=p.bestTime===null?'—':clock(p.bestTime);
  const count=getAchievementCounts(profile,ID);$('#awards').textContent=`${count.earned} / ${count.total} premios`;
  const next=ACHIEVEMENTS.filter(a=>a.scope===ID&&!profile.achievements.includes(a.id)).sort((a,b)=>metricValue(profile,b.metric)/b.target-metricValue(profile,a.metric)/a.target)[0];
  const container=$('#next-award');container.replaceChildren();
  if(next){const img=new Image();img.src=new URL(achievementIcon(next),new URL('../../',import.meta.url));img.alt='';img.loading='lazy';container.append(img,`${next.name} · ${Math.min(metricValue(profile,next.metric),next.target)} / ${next.target}`);}
  else container.textContent='¡Vitrina completa!';
  $('#swap').disabled=!interactive()||game.swapped;$('#fire').disabled=!interactive();
  $('#aim-left').disabled=!interactive();$('#aim-right').disabled=!interactive();$('#pause').disabled=game.finished;
  $('#pause').textContent=paused?'▶ Reanudar':'Ⅱ Pausar';redraw();
}
function showOverlay(title,message,action,label='Continuar',symbol='✦'){
  $('#result').textContent=title;$('#message').textContent=message;$('#result-symbol').textContent=symbol;
  $('#continue').textContent=label;nextAction=action;$('#overlay').hidden=false;$('#continue').focus({preventScroll:true});
}
function stopAnimation(){cancelAnimationFrame(frame);frame=0;lastFrame=0;}
function start(config){
  stopAnimation();game=newGame(config);game.flight=null;paused=false;$('#overlay').hidden=true;
  controls?.reset();$('#board-status').textContent='Apunta y une al menos tres burbujas iguales.';render();save();
}
function finish(won,reason='Las burbujas han alcanzado la línea del cielo.'){
  stopAnimation();game.finished=true;game.flight=null;paused=false;
  sound(won?'win':'error');window.dispatchEvent(new CustomEvent('kcg:mascot',{detail:{mood:won?'win':'try'}}));
  const c=game.config,p=progress();let detail=reason;
  if(won){
    const first=!p.completedPuzzles.includes(c.id),points=finalScore(game);
    if(first){p.completedPuzzles.push(c.id);p.solved++;profile.stats.gamesSolved++;const xp=arcadeXpForResult(points,3000,true);p.arcadeXp+=xp;profile.stats.arcadeXp+=xp;}
    if(c.mode==='classic'&&!p.completedLevels.includes(c.number)){p.completedLevels.push(c.number);p.completedLevels.sort((a,b)=>a-b);p.unlockedLevel=Math.min(60,Math.max(p.unlockedLevel,c.number+1));}
    p.totalPoints+=points;profile.stats.totalPoints+=points;p.bestScore=Math.max(p.bestScore,points);p.bestTime=p.bestTime===null?game.elapsed:Math.min(p.bestTime,game.elapsed);
    if(c.mode!=='daily'||first)event('game_completed',{mode:c.mode,elapsed:game.elapsed,drop:game.drop,accuracy:100*game.hits/Math.max(1,game.shots)});
    if(p.completedLevels.length===60)event('game_mastered',{});
    detail=`${points.toLocaleString('es-ES')} puntos · ${game.shots} disparos · ${game.fallen} burbujas caídas.`;
  }
  const awards=unlockAchievements(profile).filter(a=>a.scope===ID);if(awards.length)detail+=` ${awards.length} premio${awards.length===1?' nuevo':'s nuevos'}.`;
  render();save();
  const following=won&&c.mode==='classic'&&c.number<60;
  showOverlay(won?'¡Cielo despejado!':'Otra oportunidad',detail,()=>{
    start(configuration(c.mode,following?c.number+1:Math.max(1,c.number)));canvas.focus({preventScroll:true});
  },following?'Siguiente nivel →':'Volver a jugar',won?'✦':'↻');
}
function settle(result){
  game.flight=null;if(result.popped)game.hits=(game.hits||0)+1;
  event('shot_resolved',{...result,combo:game.combo});
  $('#board-status').textContent=result.popped?`${result.popped} burbujas explotadas${result.fallen?`, ${result.fallen} caídas`:''}${result.bank?' · ¡Buen rebote!':''}. Racha ${game.combo}.`:'Sin grupo. Prueba otro ángulo o cambia la burbuja.';
  sound(result.popped?'merge':'tap');
  if(result.won)finish(true);else if(result.lost)finish(false);else{unlockAchievements(profile);render();save();}
}
function animate(now){
  frame=0;if(paused||document.hidden||!game?.flight||game.finished)return;
  const dt=lastFrame?Math.min(.04,(now-lastFrame)/1000):1/60;lastFrame=now;
  const result=advance(game,game.flight,dt);redraw();
  if(result){lastFrame=0;settle(result);}else frame=requestAnimationFrame(animate);
}
function fire(value){
  if(!interactive())return;
  if(game.config.mode==='daily'&&game.config.id!==`daily:${localDate()}`){start(configuration('daily'));toast('Ha comenzado un nuevo reto diario.');return;}
  angle=value;
  if(!game.counted){game.counted=true;progress().gamesPlayed++;profile.stats.gamesPlayed++;event('game_started',{mode:game.config.mode});}
  game.flight=launch(game,angle);sound('tap');render();save();lastFrame=0;frame=requestAnimationFrame(animate);
}
function togglePause(){
  if(!game||game.finished)return;
  paused=!paused;stopAnimation();
  if(paused)showOverlay('Un respiro','Tu cielo se queda justo aquí.',togglePause,'Seguir jugando','Ⅱ');
  else{$('#overlay').hidden=true;canvas.focus({preventScroll:true});if(game.flight)frame=requestAnimationFrame(animate);}
  render();save();
}
function restoreActive(){
  const active=progress().active;
  if(validGame(active)&&(active.config.mode!=='daily'||active.config.id===`daily:${localDate()}`)){
    stopAnimation();game=active;game.hits??=0;game.flight??=null;paused=false;$('#overlay').hidden=true;render();
    if(game.counted)togglePause();
  }else start(configuration('classic',Math.min(60,Math.max(1,progress().unlockedLevel))));
}
async function init(){
  profile=await loadProfile();await loadAchievementCatalog([ID]);
  controls=bindControls({canvas,aim:value=>{angle=value;redraw();},fire,enabled:interactive,
    swap:()=>{if(interactive()&&swap(game)){sound('tap');render();save();}},pause:togglePause});
  restoreActive();
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(game.config.mode!==b.dataset.mode)start(configuration(b.dataset.mode,progress().unlockedLevel));});
  $('#level').onchange=e=>{const n=Number(e.target.value);if(n>=1&&n<=progress().unlockedLevel)start(configuration('classic',n));};
  $('#restart').onclick=()=>{if(game.counted&&!game.finished&&!confirm('¿Reiniciar esta partida? Conservarás tus niveles y premios.'))return;start(configuration(game.config.mode,Math.max(1,game.config.number)));};
  $('#continue').onclick=()=>nextAction?.();$('#pause').onclick=togglePause;
  setInterval(()=>{
    if(!game?.counted||game.finished||paused||document.hidden)return;
    game.elapsed++;progress().playedSeconds++;profile.stats.playSeconds++;
    $('#time').textContent=clock(game.config.mode==='timed'?Math.max(0,120-game.elapsed):game.elapsed);
    if(game.config.mode==='timed'&&game.elapsed>=120)finish(false,'Se agotaron los 120 segundos. Busca grupos grandes y provoca caídas.');else if(game.elapsed%5===0)save();
  },1000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&game?.counted&&!game.finished&&!paused)togglePause();});
  window.addEventListener('pagehide',()=>{if(game)save();});
  $('#export').onclick=async()=>{try{await save();downloadZip(await exportGameBackup(ID,progress(),profile.achievements.filter(id=>id.startsWith(`${ID}-`))),'bubbleshooter.zip');recordArcadeAction(profile,'export');unlockAchievements(profile);await save();toast('bubbleshooter.zip guardado en tu dispositivo.');}catch(e){toast(e.message);}};
  $('#import').onclick=()=>{if(game.counted&&!game.finished&&!paused)togglePause();$('#import-file').click();};
  $('#import-file').onchange=async e=>{
    const file=e.target.files[0];e.target.value='';if(!file)return;
    try{const files=await readZip(file),manifest=JSON.parse(files.get('backup-manifest.json'));
      if(manifest.scope!=='game'||manifest.gameIds?.length!==1||manifest.gameIds[0]!==ID)throw Error('Selecciona una copia de Bubble Shooter.');
      if(!confirm('Se sustituirá solo el progreso de Bubble Shooter en este dispositivo. ¿Restaurar?'))return;
      await queue;await restoreBackup(file,profile,saveProfile,undefined,'game');profile=await loadProfile();recordArcadeAction(profile,'import');unlockAchievements(profile);restoreActive();await save();toast('Bubble Shooter restaurado.');
    }catch(e){toast(e.message);}
  };
  $('#reset').onclick=async()=>{
    if(!resetArmed){resetArmed=true;$('#reset').textContent='Confirmar: borrar todo Bubble Shooter';setTimeout(()=>{resetArmed=false;$('#reset').textContent='Borrar mi progreso de Bubble Shooter';},6000);return;}
    resetArmed=false;stopAnimation();await queue;profile=resetGameProgress(profile,ID);start(configuration('classic',1));$('#reset').textContent='Borrar mi progreso de Bubble Shooter';toast('Progreso de Bubble Shooter borrado.');
  };
  labelShareButtons($('#share'),$('#share-header'));
  $('#share').onclick=async()=>{try{const result=await shareProgressCard({profile,scope:ID,title:'Bubble Shooter',subtitle:`${progress().completedLevels.length} / 60 cielos despejados`},'bubbleshooter.png',$('#share'));
    if(result==='ready'){toast('Tarjeta lista. Toca de nuevo para abrir Compartir.');return;}
    if(result!=='cancelled'){recordArcadeAction(profile,'share');unlockAchievements(profile);await save();toast('Tu tarjeta está lista.');}
  }catch(e){toast(e.message);}};
  $('#share-header').onclick=()=>$('#share').click();
  enablePwaUpdates('../../sw.js',toast,()=>save()).catch(()=>{});
}
init().catch(e=>{toast(`No se pudo iniciar Bubble Shooter: ${e.message}`);});
