import assert from 'node:assert/strict';
import {createPuzzle,press,solve,MASKS,isValidGame} from '../lights/engine.js';
let previous=0;const seen=new Set();
for(let level=1;level<=60;level++){
 const g=createPuzzle({mode:'classic',level});assert(isValidGame(g));assert(g.board);assert(!seen.has(g.board));seen.add(g.board);
 const solution=solve(g.board);assert.equal(solution.length,g.optimal);assert(g.optimal>=previous);previous=g.optimal;
 assert.equal(solution.reduce((b,i)=>press(b,i),g.board),0);
 for(let i=0;i<25;i++)assert.equal(press(press(g.board,i),i),g.board);
}
const pop=n=>n.toString(2).replaceAll('0','').length;
assert.equal(pop(MASKS[0]),3);assert.equal(pop(MASKS[2]),4);assert.equal(pop(MASKS[12]),5);
assert.equal(solve(0).length,0);assert.equal(seen.size,60);
console.log('Lights Out: 60 unique solvable levels, monotone exact minima, edges and toggle reversibility passed.');
