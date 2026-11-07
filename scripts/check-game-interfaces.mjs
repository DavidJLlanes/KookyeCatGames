import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {setupGameInterface} from '../assets/js/game-interface.js';

const games=[['picross','picross.js'],['2048','fusion.js'],['bubbleshooter','bubble.js'],['tetris','tetris.js']];
const contract=['arcade-topbar','arcade-workspace','arcade-modes','arcade-gamebar','arcade-stats','arcade-board-viewport','arcade-controls','arcade-primary-controls','arcade-utility-controls','arcade-sidebar','arcade-data'];
for(const [folder,entry] of games){
  const url=new URL(`../${folder}/index.html`,import.meta.url),html=await readFile(url,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${folder}: duplicate IDs`);
  const classes=new Set([...html.matchAll(/\bclass="([^"]+)"/g)].flatMap(m=>m[1].split(/\s+/)));
  for(const value of contract)assert.ok(classes.has(value),`${folder}: missing ${value}`);
  assert.deepEqual([...html.matchAll(/data-panel="([^"]+)"/g)].map(m=>m[1]),['score','progress','awards','help']);
  const script=await readFile(new URL(entry,url),'utf8');
  if(folder!=='picross')assert.ok(!/data-mode="classic" class="selected"/.test(html),`${folder}: stale selected mode`);
  for(const match of script.matchAll(/\$\(['"]#([\w-]+)['"]\)/g))assert.ok(ids.includes(match[1]),`${folder}: broken control #${match[1]}`);
  for(const match of html.matchAll(/(?:src|href)="(\.[^"]+)"/g)){
    const asset=new URL(match[1],url);asset.search='';asset.hash='';await access(asset);
  }
  assert.match(html,/src="\.\/interface\.js\?v=50"/);
  assert.equal((html.match(/data-mode="/g)||[]).length,3);
  assert.ok(html.indexOf('arcade-board-viewport')<html.indexOf('arcade-sidebar'));
  assert.ok(html.indexOf('arcade-sidebar')<html.indexOf('arcade-data data-section'));
  const statArea=html.split('aria-label="Estado de la partida">')[1].split('<div class="arcade-board-viewport">')[0];
  assert.equal((statArea.match(/<div>/g)||[]).length,4,`${folder}: expected four live stats`);
}

// Exercise the shared fullscreen fallback and mode semantics without browser/storage side effects.
function classes(initial=[]){const set=new Set(initial);return {contains:s=>set.has(s),add:s=>set.add(s),remove:s=>set.delete(s)};}
const button={style:{},attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.listeners[k]=v;},focus(){this.focused=true;}};
const modes=['selected','',''].map(value=>({classList:classes(value?[value]:[]),setAttribute(k,v){this[k]=v;}}));
const root={classList:classes(),querySelectorAll:()=>modes};
const listeners={},board={setAttribute(){}};
globalThis.document={body:{classList:classes()},querySelector:s=>s==='#game-workspace'?root:s==='#fullscreen'?button:board,addEventListener:(k,v)=>{listeners[k]=v;}};
globalThis.MutationObserver=class {observe(){}};
setupGameInterface({name:'test',board:'#board'});
assert.equal(modes[0]['aria-pressed'],'true');assert.equal(modes[1]['aria-pressed'],'false');
await button.listeners.click();assert.ok(root.classList.contains('arcade-focus'));assert.equal(button.attributes['aria-pressed'],'true');
listeners.keydown({key:'Escape',preventDefault(){}});assert.ok(!root.classList.contains('arcade-focus'));assert.ok(button.focused);
root.requestFullscreen=async()=>{document.fullscreenElement=root;};
document.exitFullscreen=async()=>{document.fullscreenElement=null;};
await button.listeners.click();listeners.fullscreenchange();assert.equal(button.attributes['aria-pressed'],'true');
await button.listeners.click();listeners.fullscreenchange();assert.equal(button.attributes['aria-pressed'],'false');
console.log('PASS: four interface contracts, control IDs, panel order, assets, mode semantics, native fullscreen and fallback.');
