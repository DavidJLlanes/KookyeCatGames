import {LEVELS} from './levels.js?v=1';
export function region(c,w){const found=new Set([0]),queue=[0],color=c[0];for(let h=0;h<queue.length;h++){let v=queue[h],x=v%w,y=Math.floor(v/w);for(const t of [x?v-1:-1,x<w-1?v+1:-1,y?v-w:-1,y<w-1?v+w:-1])if(t>=0&&!found.has(t)&&c[t]===color){found.add(t);queue.push(t)}}return found}
export function frontier(g){const inside=region(g.cells,g.width),edge=new Set,w=g.width;for(const i of inside){const x=i%w,y=Math.floor(i/w);for(const n of [x?i-1:-1,x<w-1?i+1:-1,y?i-w:-1,y<w-1?i+w:-1])if(n>=0&&!inside.has(n))edge.add(n)}return edge}
export function availableColors(g){return new Set([...frontier(g)].map(i=>g.cells[i]))}
export function moveLimit(g){return g.optimal+(g.mode==='timed'?2:0)}
export function flood(g,color){if(color===g.cells[0]||!availableColors(g).has(color))return false;const r=region(g.cells,g.width);for(const i of r)g.cells[i]=color;g.moves++;return true}
export const won=g=>g.cells.every(c=>c===g.cells[0]);
export function createPuzzle(config){const level=LEVELS[config.index];return{version:1,mode:config.mode,id:config.id,level:config.index+1,width:level.w,cells:level.c.split('').map(Number),initial:level.c,optimal:level.optimal,moves:0,elapsed:0,undo:[],undoCount:0,finished:false,counted:false,score:0}}
export function valid(g){return !!g&&g.version===1&&Number.isInteger(g.level)&&g.level>=1&&g.level<=60&&g.width===LEVELS[g.level-1].w&&g.initial===LEVELS[g.level-1].c&&Array.isArray(g.cells)&&g.cells.length===g.width*g.width&&g.cells.every(c=>Number.isInteger(c)&&c>=0&&c<5)&&Number.isInteger(g.moves)&&g.moves>=0&&Number.isInteger(g.elapsed)&&g.elapsed>=0&&Array.isArray(g.undo)}
