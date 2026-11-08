import {hash} from './engine.js?v=1';
import {LEVELS} from './levels.js';
export {LEVELS};
export const localDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export function configuration(mode='classic',level=1){if(mode==='classic'){level=Math.max(1,Math.min(60,level));return{mode,level,id:'level:'+level,name:'Nivel '+String(level).padStart(2,'0'),chapter:LEVELS[level-1].optimalPushes+' empujes mínimos'};}const day=localDate(),seed=mode==='daily'?hash(day):(Date.now()^Math.random()*4294967295)>>>0;return{mode,level:0,id:mode+':'+(mode==='daily'?day:seed),name:mode==='daily'?'Reto diario':'Contrarreloj',chapter:mode==='daily'?day:'120 segundos',seed};}