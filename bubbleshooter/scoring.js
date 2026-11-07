export const finalScore = game => game.score + Math.max(0, 180-game.elapsed)*3 + Math.max(0, 100-game.shots)*5;
export function reduceBubbleEvent(progress, event) {
  const m=progress.metrics, p=event.payload;
  if (event.type === 'shot_resolved') {
    m.shots++; m.popped+=p.popped; m.fallen+=p.fallen;
    if (p.bank) m.bankShots++;
    m.bestCombo=Math.max(m.bestCombo,p.combo);
    m.bigDrop=Math.max(m.bigDrop,p.fallen);
  }
  if (event.type === 'game_completed') {
    if (p.mode==='daily') m.dailyWins++;
    if (p.mode==='timed') m.timedWins++;
    if (!p.drop) m.steadyWins++;
    if (p.elapsed<=60) m.fastWins++;
    if (p.accuracy>=80) m.preciseWins++;
  }
}
