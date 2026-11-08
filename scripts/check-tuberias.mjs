import assert from 'node:assert/strict';
import{PUZZLES}from'../tuberias/levels.js';
import{createPuzzle,rotate,inspect,isValidGame}from'../tuberias/engine.js';
import{configuration}from'../tuberias/rules.js';
import{solve}from'./pipes-solver.mjs';
let previous=0,size=0;const unique=new Set();
for(let i=0;i<60;i++){
 const p=PUZZLES[i],g=createPuzzle(configuration('classic',i+1));
 assert(isValidGame(g));assert(!inspect(g.tiles,g.size).won);assert(p.optimal>=previous);assert(p.size>=size);previous=p.optimal;size=p.size;
 const key=p.size+':'+p.tiles.join(',');assert(!unique.has(key));unique.add(key);
 const found=solve(p.tiles,p.size).solutions;assert.equal(found.length,1);assert.deepEqual(found[0],p.solution);
 let cost=0;
 for(let j=0;j<g.tiles.length;j++){const before=g.tiles[j];let t=before;for(let r=0;r<4;r++)t=rotate(t);assert.equal(t,before);let turns=0;while(g.tiles[j]!==p.solution[j]){g.tiles[j]=rotate(g.tiles[j]);cost++;assert(++turns<=3);}}
 assert.equal(cost,p.optimal);assert(inspect(g.tiles,g.size).won);
 const broken=structuredClone(g);broken.tiles[0]=0;assert(!isValidGame(broken));
}
assert(!inspect([2,8,2,8],2).won,'disconnected components must not win');
assert(!inspect([1,1,1,1],2).won,'open edges must not win');
const daily=configuration('daily');assert.deepEqual(createPuzzle(daily),createPuzzle(daily));
console.log('PASS: 60 unique, uniquely solvable networks; nondecreasing size and exact clockwise cost; rotation, leaks, connectivity, saved-state validation and deterministic daily puzzle.');
