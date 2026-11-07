const badge = (id, name, detail, tier, kind, metric, target, symbol) => ({ id, name, detail, tier, kind, metric, target, symbol, scope: 'arcade' });
export const ARCADE_ACHIEVEMENTS = [
  badge('arcade-welcome','La primera ficha','Inicia una partida.','BRONCE','achievement','stats.gamesPlayed',1,'play'),
  badge('arcade-return','Vuelvo enseguida','Juega 10 partidas.','BRONCE','achievement','stats.gamesPlayed',10,'loop'),
  badge('arcade-regular','Habitual de la casa','Juega 50 partidas.','PLATA','achievement','stats.gamesPlayed',50,'home'),
  badge('arcade-marathon','Arcade sin descanso','Juega 200 partidas.','ORO','achievement','stats.gamesPlayed',200,'bolt'),
  badge('arcade-legend','Una vida jugando','Juega 1.000 partidas.','LEGENDARIO','trophy','stats.gamesPlayed',1000,'crown'),
  badge('arcade-first-win','Primera victoria','Completa tu primer juego.','BRONCE','achievement','stats.gamesSolved',1,'spark'),
  badge('arcade-ten-wins','Diez victorias','Gana 10 partidas.','PLATA','achievement','stats.gamesSolved',10,'star'),
  badge('arcade-century','Centurión','Gana 100 partidas.','ORO','trophy','stats.gamesSolved',100,'shield'),
  badge('arcade-thousand','Leyenda de la arcade','Gana 1.000 partidas.','LEGENDARIO','trophy','stats.gamesSolved',1000,'crown'),
  badge('arcade-hour','Una hora de juego','Acumula una hora de juego.','BRONCE','achievement','stats.playSeconds',3600,'clock'),
  badge('arcade-day','Un día entre juegos','Acumula 24 horas de juego.','ORO','trophy','stats.playSeconds',86400,'hourglass'),
  badge('arcade-points','Cazapuntos','Consigue 2.000 puntos.','PLATA','achievement','stats.totalPoints',2000,'star'),
  badge('arcade-vault','Tesoro de puntos','Consigue 25.000 puntos.','ORO','trophy','stats.totalPoints',25000,'diamond'),
  badge('arcade-million','El millón','Consigue 1.000.000 de puntos.','LEGENDARIO','trophy','stats.totalPoints',1000000,'crown'),
];
