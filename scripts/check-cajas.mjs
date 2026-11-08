import assert from 'node:assert/strict';
import {LEVELS} from '../cajas/levels.js';
import {solve,move,isWon,createPuzzle} from '../cajas/engine.js';
assert.equal(LEVELS.length,60);
assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l))).size,60);
let previous=-1;
for(let i=0;i<60;i++){const l=LEVELS[i],s=solve(l);assert(s,'level unsolvable');assert.equal(s.minPushes,l.optimalPushes);assert.equal(s.minMoves,l.optimalMoves);assert(s.minPushes>=previous,'push difficulty must not decrease');previous=s.minPushes;const g=createPuzzle('classic',i+1);assert.equal(g.level,i+1);for(const w of l.walls)assert(!l.goals.includes(w));}
const t={width:5,height:5,walls:[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24],goals:[12],boxes:[11],player:16,pushes:0,moves:0};assert(move(t,0,-1));assert.equal(t.pushes,1);assert(t.boxes.includes(6));assert(!move(t,0,-1));console.log('60 Sokoban boards re-solved; minimum pushes/moves and movement rules verified.');
