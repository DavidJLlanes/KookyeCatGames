import {hash} from './engine.js?v=1';
const chapters=['SALIDA BLOQUEADA','PRIMEROS ATASCOS','TRÁFICO CRUZADO','NUDOS URBANOS','HORA PUNTA'];
export const LEVELS=Array.from({length:60},(_,i)=>({number:i+1,chapter:chapters[Math.min(4,Math.floor(i/12))]}));
export const localDate=()=>new Date().toLocaleDateString('en-CA');
export function configuration(mode='classic',level=1){
 if(mode==='classic'){const l=LEVELS[level-1]||LEVELS[0];return{mode,level:l.number,id:'level:'+l.number,name:'Nivel '+String(l.number).padStart(2,'0'),chapter:l.chapter,seed:hash('rush:campaign:'+l.number)};}
 if(mode==='daily'){const date=localDate();return{mode,level:0,id:'daily:'+date,name:'Reto diario',chapter:date,seed:hash('rush:daily:'+date)};}
 const seed=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;return{mode,level:0,id:'timed:'+seed,name:'Contrarreloj',chapter:'120 segundos',seed:seed||1};
}