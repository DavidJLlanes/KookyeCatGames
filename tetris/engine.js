export const COLS=10,ROWS=20;
export const SHAPES=[
  {name:'I',color:'#48c9d8',cells:[[0,1],[1,1],[2,1],[3,1]]},
  {name:'O',color:'#f5c247',cells:[[1,0],[2,0],[1,1],[2,1]]},
  {name:'T',color:'#ae78ed',cells:[[1,0],[0,1],[1,1],[2,1]]},
  {name:'S',color:'#56c88a',cells:[[1,0],[2,0],[0,1],[1,1]]},
  {name:'Z',color:'#ee677b',cells:[[0,0],[1,0],[1,1],[2,1]]},
  {name:'J',color:'#558bf3',cells:[[0,0],[0,1],[1,1],[2,1]]},
  {name:'L',color:'#f2924e',cells:[[2,0],[0,1],[1,1],[2,1]]},
];
export function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6d2b79f5)|0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
export function pieceFrom(index,rotation=0){const p=SHAPES[index%7],cells=p.cells.map(([x,y])=>{let a=x-1.5,b=y-1.5;for(let i=0;i<rotation;i++)[a,b]=[-b,a];return[Math.round(a+1.5),Math.round(b+1.5)];});return{type:index%7,rotation,cells,color:p.color};}
export function newGame(config){const random=rng(config.seed),bag=[];const draw=()=>{if(!bag.length){bag.push(0,1,2,3,4,5,6);for(let i=6;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}return bag.pop();};const current=draw();const piece=pieceFrom(current);piece.x=3;piece.y=-1;return{mode:config.mode,config,seed:config.seed,randomState:config.seed>>>0,board:Array.from({length:ROWS},()=>Array(COLS).fill(null)),piece,next:[draw(),draw(),draw()],score:0,lines:0,level:1,pieces:0,elapsed:0,dropClock:0,combo:0,counted:false,finished:false};}
export function collides(board,piece,dx=0,dy=0){return piece.cells.some(([x,y])=>{const px=piece.x+x+dx,py=piece.y+y+dy;return px<0||px>=COLS||py>=ROWS||(py>=0&&board[py][px]);});}
function randomPiece(game){let s=game.randomState>>>0;s=(Math.imul(s,1664525)+1013904223)>>>0;game.randomState=s;return s%7;}
export function spawn(game){const type=game.next.shift();game.next.push(randomPiece(game));game.piece=pieceFrom(type);game.piece.x=3;game.piece.y=-1;if(collides(game.board,game.piece))game.finished=true;return !game.finished;}
export function move(game,dx,dy=0){if(!game||game.finished||collides(game.board,game.piece,dx,dy))return false;game.piece.x+=dx;game.piece.y+=dy;return true;}
export function rotate(game,dir=1){if(!game||game.finished||game.piece.type===1)return false;const p=pieceFrom(game.piece.type,(game.piece.rotation+dir+4)%4);p.x=game.piece.x;p.y=game.piece.y;for(const [dx,dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]])if(!collides(game.board,p,dx,dy)){p.x+=dx;p.y+=dy;game.piece=p;return true;}return false;}
export function hardDrop(game){if(!game||game.finished)return null;let distance=0;while(move(game,0,1))distance++;game.score+=distance*2;return lock(game);}
export function lock(game){const p=game.piece;for(const [x,y] of p.cells){const px=p.x+x,py=p.y+y;if(py<0){game.finished=true;return{gameOver:true,cleared:0};}game.board[py][px]=p.color;}let cleared=0;for(let y=ROWS-1;y>=0;y--)if(game.board[y].every(Boolean)){game.board.splice(y,1);game.board.unshift(Array(COLS).fill(null));cleared++;y++;}game.lines+=cleared;game.score+=([0,100,300,500,800][cleared]||0)*game.level;game.combo=cleared?game.combo+1:0;game.level=Math.floor(game.lines/10)+1;game.pieces++;if(game.lines>=game.config.targetLines){game.finished=true;return{gameOver:false,cleared,won:true};}if(!spawn(game))return{gameOver:true,cleared};return{gameOver:false,cleared};}
export function tick(game,dt){if(!game||game.finished)return null;game.dropClock+=dt;const interval=Math.max(.075,.8-(game.level-1)*.055);if(game.dropClock<interval)return null;game.dropClock=0;if(move(game,0,1))return null;return lock(game);}
export function validGame(g){return !!g&&['classic','timed','daily'].includes(g.mode)&&Array.isArray(g.board)&&g.board.length===ROWS&&g.board.every(r=>Array.isArray(r)&&r.length===COLS)&&Number.isFinite(g.score)&&Number.isFinite(g.elapsed)&&g.piece?.cells?.length===4&&Array.isArray(g.next)&&g.config?.mode===g.mode;}
