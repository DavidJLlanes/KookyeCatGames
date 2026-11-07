import{hash}from'../2048/engine.js?v=49';
const chapters=['PRIMEROS BLOQUES','GIROS PRECISOS','FILAS DOBLES','LLUVIA DE TETRIMINÓS','RETO DE MAESTRÍA'];
export const LEVELS=Array.from({length:60},(_,i)=>({number:i+1,chapter:chapters[Math.min(4,Math.floor(i/12))],targetLines:8+Math.floor(i/5)}));
export const localDate=()=>new Date().toLocaleDateString('en-CA');
export function configuration(mode='classic',level=1){if(mode==='classic'){const l=LEVELS[level-1]||LEVELS[0];return{mode,level:l.number,id:`level:${l.number}`,name:`Nivel ${String(l.number).padStart(2,'0')}`,chapter:l.chapter,targetLines:l.targetLines,seed:hash(`tetris:level:${l.number}`)};}if(mode==='daily'){const date=localDate();return{mode,level:0,id:`daily:${date}`,name:'Reto diario',chapter:date,targetLines:12,seed:hash(`tetris:daily:${date}`)};}const seed=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;return{mode,level:0,id:`timed:${seed}`,name:'Contrarreloj',chapter:'120 segundos',targetLines:15,seed};}
