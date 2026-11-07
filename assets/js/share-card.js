import { ACHIEVEMENTS, achievementIcon } from './achievements.js?v=48';
import { GAMES } from '../../core/game-registry.js?v=48';

const rect=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const text=(c,value,x,y,size,color='#182440',weight=800)=>{c.fillStyle=color;c.font=`${weight} ${size}px system-ui, sans-serif`;c.fillText(String(value),x,y);};
const clip=(c,value,max)=>{let s=String(value);while(c.measureText(s).width>max&&s.length>2)s=s.slice(0,-2)+'…';return s;};
const assetRoot=new URL('../../',import.meta.url);
async function badgeImage(award){try{const url=new URL(achievementIcon(award),assetRoot).href;const image=new Image();image.src=url;await image.decode();return image;}catch{return null;}}

/** One visual family for arcade and game cards, with distinct game colors and real award progress. */
export async function makeShareCard({profile,scope='arcade',title,subtitle,score,trophies=[]}){
  const game=GAMES.find(item=>item.id===scope),progress=game?profile?.games?.[scope]:null;
  const catalog=ACHIEVEMENTS.filter(item=>scope==='arcade'?true:item.scope===scope);
  const owned=new Set(profile?.achievements||[]),earned=catalog.filter(item=>owned.has(item.id));
  const rare=earned.filter(item=>item.tier==='LEGENDARIO'||item.tier==='ORO');
  const showcase=[...rare.reverse(),...earned.filter(item=>!rare.includes(item)).reverse()].slice(0,3);
  const icons=await Promise.all(showcase.map(badgeImage));
  const accent=scope==='picross'?'#ec5fa7':scope==='fusion-2048'?'#2b85ed':scope==='bubbleshooter'?'#157d70':'#815ce2';
  const secondary=scope==='picross'?'#ffd3e7':scope==='fusion-2048'?'#d3eaff':scope==='bubbleshooter'?'#d8f4eb':'#eadfff';
  const total=catalog.length,won=earned.length,ratio=total?won/total:0;
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;
  const c=canvas.getContext('2d');if(!c)throw new Error('No se pudo crear la tarjeta.');
  const bg=c.createLinearGradient(0,0,1200,630);bg.addColorStop(0,'#fff9ef');bg.addColorStop(.55,'#f5f9ff');bg.addColorStop(1,secondary);c.fillStyle=bg;c.fillRect(0,0,1200,630);
  c.fillStyle=secondary;c.beginPath();c.arc(1100,60,245,0,Math.PI*2);c.fill();c.beginPath();c.arc(55,610,180,0,Math.PI*2);c.fill();
  rect(c,30,28,1140,574,34,'#ffffff');c.strokeStyle='#dce5f3';c.lineWidth=3;c.beginPath();c.roundRect(30,28,1140,574,34);c.stroke();
  rect(c,62,57,305,46,16,'#eaf3ff');text(c,'✦  KOOKYECAT GAMES',80,87,20,'#31517c',900);
  rect(c,965,57,171,46,16,secondary);text(c,scope==='arcade'?'MI ARCADE':game?.name?.toUpperCase()||'MI JUEGO',984,87,16,accent,900);
  text(c,title||game?.name||'Mi arcade',70,174,57,'#172441',950);
  text(c,scope==='arcade'?'Cada partida cuenta':subtitle||'Mi progreso',72,213,21,'#63718e',650);
  if(scope==='bubbleshooter'){
    ['#e64f86','#277ed5','#17856b','#af6bd5'].forEach((color,i)=>{
      const x=906+(i%2)*54,y=145+Math.floor(i/2)*47;
      c.fillStyle=color;c.beginPath();c.arc(x,y,24,0,Math.PI*2);c.fill();
      c.fillStyle='#ffffffb0';c.beginPath();c.ellipse(x-7,y-9,8,4,-.5,0,Math.PI*2);c.fill();
    });
  }
  rect(c,70,242,615,276,27,'#f2f7ff');
  text(c,scope==='arcade'?'MI AVENTURA':'MI PARTIDA',98,284,18,'#61728f',900);
  const main=scope==='arcade'?`${profile?.arcade?.gamesTried?.length||0} / ${GAMES.length}`:`${progress?.completedLevels?.length||0} / ${game?.levels||60}`;
  text(c,main,98,361,72,accent,950);
  text(c,scope==='arcade'?'juegos descubiertos':'niveles superados',103,396,21,'#465775',700);
  rect(c,98,427,553,20,10,'#dce6f4');rect(c,98,427,Math.max(4,553*(scope==='arcade'?(profile?.arcade?.gamesTried?.length||0)/Math.max(1,GAMES.length):(progress?.completedLevels?.length||0)/(game?.levels||60))),20,10,accent);
  text(c,scope==='arcade'?'XP DE LA ARCADE':'MEJOR PUNTUACIÓN',99,488,15,'#64738d',900);
  text(c,scope==='arcade'?`${profile?.stats?.arcadeXp||0} XP`:(progress?.bestScore||0).toLocaleString('es-ES'),330,488,25,'#172441',900);
  rect(c,713,242,422,276,27,'#fff8e9');text(c,'VITRINA DE PREMIOS',741,282,19,'#8a6636',900);
  text(c,`${won} / ${total}`,741,349,54,accent,950);text(c,'logros y trofeos',744,383,20,'#625b65',700);
  rect(c,741,410,366,16,8,'#eedfcb');rect(c,741,410,Math.max(4,366*ratio),16,8,accent);
  const trophyTotal=catalog.filter(item=>item.kind==='trophy').length;
  const trophyWon=earned.filter(item=>item.kind==='trophy').length;
  text(c,`🏆 ${trophyWon} / ${trophyTotal} trofeos`,744,470,21,'#6a5070',800);
  rect(c,70,536,1065,1,0,'#e4eaf3');text(c,'MIS INSIGNIAS',70,572,15,'#65728e',900);
  let x=237;showcase.forEach((a,i)=>{rect(c,x,545,49,49,12,a.tier==='LEGENDARIO'?'#392a60':'#fff0c3');if(icons[i])c.drawImage(icons[i],x+2,547,45,45);else text(c,'✦',x+12,577,21,accent);c.font='700 15px system-ui';text(c,clip(c,a.name,170),x+58,574,15,'#425171',750);x+=300;});
  if(!showcase.length)text(c,'Tus primeros premios te esperan',237,574,20,'#63718e',700);
  return new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
}

const preparedCards=new WeakMap();
export const isMobileDevice=()=>Boolean(navigator.userAgentData?.mobile||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));
export function labelShareButtons(...buttons){for(const button of buttons){if(button)button.textContent=isMobileDevice()?'Compartir tarjeta':'Descargar tarjeta PNG';}}
const canShareImage=(blob,filename)=>typeof navigator.share==='function'&&navigator.canShare?.({files:[new File([blob],filename,{type:'image/png'})]});

export async function shareProgressCard(card,filename,button){
  const cached=preparedCards.get(button);
  const stillFresh=cached&&Date.now()-cached.created<60000;
  const blob=stillFresh?cached.blob:await makeShareCard(card);
  if(isMobileDevice()&&canShareImage(blob,filename)&&!stillFresh&&navigator.userActivation?.isActive===false){
    preparedCards.set(button,{blob,created:Date.now(),label:button.textContent});
    button.textContent='Tarjeta lista: toca para compartir';
    return 'ready';
  }
  try{
    const result=await shareOrSave(blob,filename,isMobileDevice());
    if(stillFresh){button.textContent=cached.label;preparedCards.delete(button);}
    return result;
  }catch(error){
    if(error.name==='NotAllowedError'&&isMobileDevice()&&canShareImage(blob,filename)&&navigator.userActivation?.isActive!==true){
      preparedCards.set(button,{blob,created:Date.now(),label:cached?.label||button.textContent});
      button.textContent='Tarjeta lista: toca para compartir';
      return 'ready';
    }
    throw error;
  }
}

export async function shareOrSave(blob,filename,nativeShare=true){
  if(!blob)throw new Error('No se pudo crear la tarjeta.');
  const file=new File([blob],filename,{type:'image/png'});
  if(nativeShare&&navigator.share&&navigator.canShare?.({files:[file]})){
    try{await navigator.share({files:[file],title:'KookyeCat Games'});return 'shared';}
    catch(error){if(error.name==='AbortError')return 'cancelled';if(error.name==='NotAllowedError')throw error;}
  }
  const url=URL.createObjectURL(blob),link=Object.assign(document.createElement('a'),{href:url,download:filename});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return 'saved';
}
