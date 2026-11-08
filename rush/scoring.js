export function finalScore(game){return Math.max(100,6000-game.moves*35-game.undoCount*180+Math.max(0,120-game.elapsed)*5);}
export function reduceRushEvent(progress,event){
 const m=progress.metrics,p=event.payload||{};
 if(event.type==='vehicle_moved'){m.carsMoved++;if(p.axis==='h')m.horizontalMoves++;else m.verticalMoves++;}
 if(event.type==='game_completed'){
  m.escapes++;if(p.mode==='daily')m.dailyWins++;if(p.mode==='timed')m.timedWins++;
  if(p.undoCount===0)m.noUndoEscapes++;if(p.moves<=p.targetMoves)m.efficientEscapes++;
  m.bestScore=Math.max(m.bestScore||0,p.score||0);
 }
}