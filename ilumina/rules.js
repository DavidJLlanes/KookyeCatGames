import{hash}from'./engine.js?v=1';
import {PUZZLES} from './levels.js';
export const LEVELS=PUZZLES.map((p,i)=>({number:i+1,optimal:p.optimal}));
export const localDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
export function configuration(mode='classic',level=1){if(mode==='classic'){level=Math.max(1,Math.min(60,level));return{mode,level,id:'level:'+level,name:'Nivel '+String(level).padStart(2,'0'),chapter:'Mínimo '+LEVELS[level-1].optimal+' lámparas',seed:level};}const day=localDate(),seed=mode==='daily'?hash(day):(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;return{mode,level:0,id:mode+':'+(mode==='daily'?day:seed),name:mode==='daily'?'Reto diario':'Contrarreloj',chapter:mode==='daily'?day:'120 segundos',seed};}
