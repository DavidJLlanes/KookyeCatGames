import {PUZZLES} from './levels.js';
/** Akari rules. Cells: -2 white, -1 unnumbered wall, 0..4 numbered wall. */
export function topology(cells,size){
 const adjacent=i=>[i%size?i-1:-1,i%size<size-1?i+1:-1,i>=size?i-size:-1,i<cells.length-size?i+size:-1].filter(j=>j>=0);
 const visible=cells.map((c,i)=>{
  if(c!==-2)return [];
  const out=[i],x=i%size,y=Math.floor(i/size);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   for(let a=x+dx,b=y+dy;a>=0&&a<size&&b>=0&&b<size;a+=dx,b+=dy){
    const j=b*size+a;if(cells[j]!==-2)break;out.push(j);
   }
  }return out;
 });
 return {visible,adjacent};
}
export function inspect(cells,size,lamps){
 const {visible,adjacent}=topology(cells,size),lit=new Set(),conflicts=new Set(),badClues=[],excessClues=[],clueCounts={};
 for(const i of lamps){if(cells[i]!==-2)continue;for(const j of visible[i]){lit.add(j);if(j!==i&&lamps.includes(j)){conflicts.add(i);conflicts.add(j);}}}
 cells.forEach((c,i)=>{if(c<0)return;const count=adjacent(i).filter(j=>lamps.includes(j)).length;clueCounts[i]=count;if(count!==c)badClues.push(i);if(count>c)excessClues.push(i);});
 const dark=cells.flatMap((c,i)=>c===-2&&!lit.has(i)?[i]:[]);
 const valid=lamps.every(i=>Number.isInteger(i)&&cells[i]===-2)&&new Set(lamps).size===lamps.length;
 return {lit:[...lit],conflicts:[...conflicts],badClues,excessClues,clueCounts,dark,won:valid&&!dark.length&&!conflicts.size&&!badClues.length};
}

export function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function createPuzzle(config){const index=config.mode==='classic'?config.level-1:config.seed%60,p=PUZZLES[index];return {puzzleVersion:1,config:{...config},index,cells:p.cells.slice(),size:p.size,board:[],optimal:p.optimal,moves:0,elapsed:0,undoCount:0,undoStack:[],counted:false,finished:false};}
export function isValidGame(g){const p=PUZZLES[g?.index];return !!p&&g.puzzleVersion===1&&JSON.stringify(g.cells)===JSON.stringify(p.cells)&&g.size===p.size&&Array.isArray(g.board)&&g.board.every(i=>Number.isInteger(i)&&p.cells[i]===-2)&&new Set(g.board).size===g.board.length&&Array.isArray(g.undoStack)&&g.undoStack.every(a=>Array.isArray(a)&&a.every(i=>p.cells[i]===-2))&&Number.isFinite(g.elapsed)&&g.elapsed>=0&&Number.isInteger(g.moves)&&g.moves>=0&&['classic','timed','daily'].includes(g.config?.mode);}
