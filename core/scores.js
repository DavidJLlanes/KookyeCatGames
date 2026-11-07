/** Comparable arcade XP. Native game scores and leaderboards stay inside each game. */
export function arcadeXpForResult(score, maximum, firstClear) {
  if (!firstClear || !Number.isFinite(score) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.round(20 + 80 * Math.min(1, Math.max(0, score / maximum)));
}
