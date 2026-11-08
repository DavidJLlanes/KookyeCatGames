import{PUZZLES}from'./levels.js?v=1';
export const DIRS=[1,2,4,8];
export function rotate(mask){return ((mask<<1)&15)|(mask>>3);}
export function neighbor(i,d,n){const x=i%n,y=Math.floor(i/n);return d===0?(y?i-n:-1):d===1?(x<n-1?i+1:-1):d===2?(y<n-1?i+n:-1):(x?i-1:-1);}
export function inspect(tiles,size){
 const wet=new Set([0]),queue=[0],leaks=[];
 for(let i=0;i<tiles.length;i++)for(let d=0;d<4;d++)if(tiles[i]&DIRS[d]){const j=neighbor(i,d,size);if(j<0||!(tiles[j]&DIRS[(d+2)%4]))leaks.push({i,d});}
 for(let h=0;h<queue.length;h++)for(let d=0;d<4;d++){const i=queue[h],j=neighbor(i,d,size);if(j>=0&&(tiles[i]&DIRS[d])&&(tiles[j]&DIRS[(d+2)%4])&&!wet.has(j)){wet.add(j);queue.push(j);}}
 return{wet,leaks,won:wet.size===tiles.length&&leaks.length===0};
}
export function puzzleIndex(c){return c.mode==='classic'?c.level-1:c.mode==='daily'?25+(c.seed%35):10+(c.seed%20);}
export function createPuzzle(config){const p=PUZZLES[puzzleIndex(config)];if(!p)throw Error('Nivel desconocido');return{puzzleVersion:2,config:{...config},size:p.size,tiles:p.tiles.slice(),solution:p.solution.slice(),optimal:p.optimal,moves:0,elapsed:0,undoCount:0,hintCount:0,undoStack:[],counted:false,finished:false};}
export function isValidGame(g){
 if(!g||g.puzzleVersion!==2||!['classic','timed','daily'].includes(g.config?.mode)||!Number.isInteger(g.config.seed)||g.config.seed<0)return false;
 const p=PUZZLES[puzzleIndex(g.config)];if(!p||g.size!==p.size||g.optimal!==p.optimal||!Array.isArray(g.solution)||g.solution.join(',')!==p.solution.join(','))return false;
 const validTiles=tiles=>Array.isArray(tiles)&&tiles.length===p.tiles.length&&tiles.every((m,i)=>{let v=p.tiles[i];for(let k=0;k<4;k++){if(m===v)return true;v=rotate(v);}return false;});
 return validTiles(g.tiles)&&Array.isArray(g.undoStack)&&g.undoStack.length<=100&&g.undoStack.every(validTiles)&&['moves','elapsed','undoCount','hintCount'].every(k=>Number.isInteger(g[k])&&g[k]>=0)&&g.undoStack.length<=g.moves&&typeof g.finished==='boolean';
}
export function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
