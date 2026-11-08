import assert from 'node:assert/strict';
import {PUZZLES} from '../ilumina/levels.js';
import {inspect,createPuzzle,isValidGame} from '../ilumina/engine.js';
import {solve} from './akari-solver.mjs';
assert.equal(PUZZLES.length,60);
assert.equal(new Set(PUZZLES.map(p=>JSON.stringify(p.cells))).size,60);
for(let i=0;i<60;i++){
 const p=PUZZLES[i],s=solve(p.cells,p.size);
 assert.equal(s.solutions.length,1);
 assert.equal(s.solutions[0].length,p.optimal);
 assert(inspect(p.cells,p.size,s.solutions[0]).won);
 assert(!inspect(p.cells,p.size,[]).won);
 assert.equal(s.branches,p.branches);
 if(i)assert(p.branches>=PUZZLES[i-1].branches);
 const g=createPuzzle({mode:'classic',level:i+1});
 assert(isValidGame(g));g.board=[-1];assert(!isValidGame(g));
}
assert.equal(solve([-2,-2,-2,-2],2).solutions.length,2);
assert.equal(solve([4,-2,-2,-2],2).solutions.length,0);
console.log('60 unique Akari puzzles verified; monotonic solver branches, minimum lamps, victory and saved-state checks passed.');
