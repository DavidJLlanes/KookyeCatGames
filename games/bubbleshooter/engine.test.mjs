import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,configuration,neighbors,position,aimAt,hash} from './rules.js';
import {newGame,launch,advance,attach,swap,validGame,availableColors} from './engine.js';
import {reduceBubbleEvent,finalScore} from './scoring.js';
import {createEmptyProfile,normalizeProfile} from '../../assets/js/storage.js?v=49';
import {dispatchGameEvent,EVENT_VERSION} from '../../core/events.js?v=49';
import {loadAchievementCatalog,ACHIEVEMENTS,unlockAchievements,achievementIcon} from '../../assets/js/achievements.js?v=49';
import {exportGameBackup,exportAllBackup,restoreBackup} from '../../assets/js/backups.js?v=49';
import {readFile,access} from 'node:fs/promises';
const ID='bubbleshooter';
const resolveShot=(g,angle)=>{const shot=launch(g,angle);for(let step=0;step<1000;step++){const result=advance(g,shot,1/60);if(result)return {...result,bounces:shot.banks};}throw Error('A shot did not resolve');};

test('60 deterministic, independent campaign boards and seeded daily challenges',()=>{
  assert.equal(LEVELS.length,60);
  for(const l of LEVELS){const a=newGame(configuration('classic',l.number)),b=newGame(configuration('classic',l.number));assert.deepEqual(a,b);assert.ok(validGame(a));assert.equal(a.board.length,new Set(a.board.map(c=>`${c.r}:${c.c}`)).size);assert.ok(availableColors(a).includes(a.current));}
  assert.deepEqual(newGame(configuration('daily',1,'2026-11-07')),newGame(configuration('daily',1,'2026-11-07')));
  assert.notEqual(hash('bubbles:2026-11-07'),hash('bubbles:2026-11-08'));
});
test('hexagon neighbors are symmetric and centers touch exactly',()=>{
  for(let r=0;r<14;r++)for(let c=0;c<(r%2?9:10);c++)for(const [nr,nc] of neighbors(r,c)){
    assert.ok(neighbors(nr,nc).some(([rr,cc])=>rr===r&&cc===c));
    const a=position(r,c),b=position(nr,nc);assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-40)<.0001);
  }
});
test('matching groups remove only matching cells; disconnected branches fall',()=>{
  const g=newGame(configuration('classic',1));g.board=[{r:0,c:4,color:0},{r:0,c:5,color:0},{r:1,c:4,color:1},{r:2,c:4,color:2}];
  const p=position(0,3),result=attach(g,{...p,color:0,banks:1},g.board[0]);
  assert.equal(result.popped,3);assert.equal(result.fallen,2);assert.ok(result.won);assert.equal(g.banks,1);assert.equal(g.bestCombo,1);assert.equal(g.board.length,0);
});
test('two same-color bubbles do not pop; six misses descend the ceiling',()=>{
  const g=newGame(configuration('classic',1));g.board=[{r:0,c:4,color:0}];
  const result=attach(g,{...position(0,3),color:0,banks:0},g.board[0]);assert.equal(result.popped,0);assert.equal(g.board.length,2);
  g.misses=5;attach(g,{...position(0,2),color:1,banks:0},g.board.find(b=>b.c===3));assert.equal(g.drop,1);assert.equal(g.misses,0);
});
test('reaching the danger line loses; swaps are restricted to one per shot',()=>{
  const g=newGame(configuration('classic',1));g.board=[{r:13,c:4,color:0}];
  assert.ok(swap(g));assert.equal(swap(g),false);
  const result=attach(g,{...position(14,4),color:1,banks:0},g.board[0]);assert.ok(result.lost);assert.equal(g.swapped,false);
});
test('extreme angles rebound and every shot resolves without overlap or invalid cells',()=>{
  for(const level of [1,12,30,45,60])for(const angle of [-1.38,-1,-.5,0,.5,1,1.38]){
    const g=newGame(configuration('classic',level)),result=resolveShot(g,angle);assert.ok(result);if(Math.abs(angle)>1)assert.ok(result.bounces>0);
    assert.equal(g.board.length,new Set(g.board.map(b=>`${b.r}:${b.c}`)).size);
    for(const b of g.board){assert.ok(b.r>=0&&b.r<15);assert.ok(b.c>=0&&b.c<(b.r%2?9:10));}
  }
  assert.ok(Math.abs(aimAt(-1000,594))<=1.38);
});
test('mid-flight resume reproduces the same board and random sequence',()=>{
  const a=newGame(configuration('classic',30));a.flight=launch(a,.82);advance(a,a.flight,.1);
  assert.ok(validGame(a));const b=structuredClone(a);
  for(let i=0;i<1000;i++){
    const ar=advance(a,a.flight,1/60),br=advance(b,b.flight,1/60);assert.deepEqual(ar,br);
    if(ar){assert.deepEqual(a,b);return;}
  }assert.fail('Saved shot never landed');
});
test('invalid restored games are rejected',()=>{
  const g=newGame(configuration('classic',1));
  for(const change of [{drop:-1},{current:9},{elapsed:NaN},{board:[{r:0,c:100,color:0}]},{flight:{x:220,y:594,vx:0,vy:0,color:0,banks:0}}])assert.equal(Boolean(validGame({...g,...change})),false);
});
test('registry extends existing progress without changing scores or other games',()=>{
  const profile=createEmptyProfile();profile.games.picross.bestScore=1234;profile.stats.arcadeXp=80;delete profile.games[ID];
  const updated=normalizeProfile(profile);assert.equal(updated.games.picross.bestScore,1234);assert.equal(updated.stats.arcadeXp,80);assert.equal(updated.games[ID].unlockedLevel,1);
});
test('35 awards use real metrics, unique IDs and existing individual artwork',async()=>{
  await loadAchievementCatalog([ID]);const all=ACHIEVEMENTS.filter(a=>a.scope===ID);assert.equal(all.length,35);assert.equal(new Set(all.map(a=>a.id)).size,35);
  const profile=createEmptyProfile();assert.equal(unlockAchievements(profile).length,0);
  for(const a of all){await access(new URL(`../../${achievementIcon(a)}`,import.meta.url));assert.ok(a.detail.length>15);}
  const event=(type,payload)=>dispatchGameEvent(profile,{version:EVENT_VERSION,gameId:ID,type,payload},{[ID]:reduceBubbleEvent});
  event('game_started',{mode:'classic'});assert.ok(profile.arcade.gamesTried.includes(ID));
  event('shot_resolved',{popped:6,fallen:20,bank:true,combo:5});const m=profile.games[ID].metrics;
  assert.equal(m.shots,1);assert.equal(m.popped,6);assert.equal(m.fallen,20);assert.equal(m.bankShots,1);assert.equal(m.bigDrop,20);
  event('game_completed',{mode:'daily',elapsed:50,drop:0,accuracy:90});assert.equal(m.dailyWins,1);assert.equal(m.fastWins,1);assert.equal(m.preciseWins,1);
});
test('individual and global ZIP round-trips preserve independent game data',async()=>{
  await loadAchievementCatalog();const p=createEmptyProfile();p.games[ID].active=newGame(configuration('classic',1));p.games[ID].bestScore=789;p.games.picross.bestScore=555;
  const backup=await exportGameBackup(ID,p.games[ID],[]);let restored;
  await restoreBackup(backup,createEmptyProfile(),async value=>{restored=value;},undefined,'game');assert.deepEqual(restored.games[ID],p.games[ID]);assert.equal(restored.games.picross.bestScore,0);
  await restoreBackup(await exportAllBackup(p),createEmptyProfile(),async value=>{restored=value;});assert.equal(restored.games.picross.bestScore,555);assert.deepEqual(restored.games[ID],p.games[ID]);
  await assert.rejects(()=>restoreBackup(backup,p,async()=>{},undefined,'all'));
});
test('offline shell references real files and includes all game runtime modules',async()=>{
  const sw=await readFile(new URL('../../sw.js',import.meta.url),'utf8'),files=[...sw.matchAll(/'((?:\.\/)[^']+)'/g)].map(m=>m[1]);
  for(const file of files)await access(new URL(`../../${file}`,import.meta.url));
  for(const name of ['bubble.js','engine.js','rules.js','controls.js','renderer.js','achievements.js','scoring.js','bubble.css'])assert.ok(files.includes(`./games/bubbleshooter/${name}`));
  assert.ok(Number.isFinite(finalScore(newGame(configuration('classic',1)))));
});
