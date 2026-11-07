# KookyeCatGames

Arcade web instalable en `https://djl.com.es/games`. Proyecto estático HTML, CSS y JavaScript; sin framework ni dependencias de ejecución.

## Desarrollo local

Desde esta carpeta, inicia un servidor estático para que funcionen los módulos ES y el service worker:

```powershell
py -m http.server 8080
```

Abre `http://localhost:8080/`.

Las imágenes PNG de instalación y Open Graph se generan desde los recursos vectoriales con `python scripts/render-graphics.py` (requiere Pillow solo para generar gráficos; no es necesario para ejecutar la web).

## Estructura

- `index.html`: portada y catálogo.
- `assets/js/`: almacenamiento local, logros, tarjetas compartibles y ZIP.
- `games/<id>/`: cada juego y su manifiesto independiente.
- `games/picross/`: `puzzle.js` contiene niveles y pistas; `rules.js`, vidas, errores y puntuación; `gesture.js`, arrastre táctil y con ratón; `picross.js`, partida y almacenamiento; `picross.css` y `picross-responsive.css`, presentación adaptable.

Picross incluye una campaña de 60 niveles: 20 de 5×5, 20 de 10×10 y 20 avanzados de 10×10. Los niveles se desbloquean en orden y se puede volver a jugar cualquiera que ya esté abierto.

El progreso se conserva en IndexedDB del navegador. Los backups se crean localmente: `games.zip` para todo y `picross.zip` para Picross.

En la portada puedes guardar o restaurar `games.zip`. Dentro de Picross puedes guardar o restaurar `picross.zip`; esa restauración solo afecta a Picross. Los archivos se validan antes de guardar los datos y nunca se envían al servidor.

## Despliegue manual en Ubuntu

Cuando se publique una versión, desde la raíz del proyecto en el VPS:

```bash
sudo install -d -o www-data -g www-data /var/www/djl.com.es/games
sudo rsync -av --exclude='.git' ./ /var/www/djl.com.es/games/
sudo chown -R www-data:www-data /var/www/djl.com.es/games
```

Los comandos copian al directorio de la arcade sin borrar archivos ajenos mediante `--delete`.

## Gamificación modular (v2)

- `core/achievements.js` evalúa los premios comunes y carga cada catálogo de juego bajo demanda. Cada premio declara identificador estable, ámbito, tipo, categoría, requisito medible e icono SVG propio.
- `core/events.js` valida el contrato de eventos `version: 1`. Cada juego aporta su reductor y sus reglas de puntuación; Picross los define en `games/picross/scoring.js` y `games/picross/achievements.js`.
- Cada juego tiene su directorio con `game.json`, controles, reglas, arte e insignias. Al añadir un juego, registrar su catálogo en el núcleo y su reductor en la integración del juego.
- IndexedDB guarda el perfil local de esquema 2; los ZIP de backup usan el mismo esquema. Esta versión inicia un perfil nuevo sin migrar los datos del prototipo.
- Las insignias SVG se cargan según se muestran, sin precargar todas durante la instalación de la PWA. La vista permite filtrar por juego y por tipo.

### Ampliación a 50 juegos

`core/game-registry.js` declara solo metadatos ligeros, la ruta del catálogo, el estado inicial y el número de premios de cada juego publicado. `core/achievements.js` importa el catálogo de un juego bajo demanda y rechaza identificadores repetidos o cantidades incoherentes. La vitrina muestra 24 premios por página; una búsqueda global explícita carga el resto. Los eventos de `core/events.js` aceptan adaptadores de cualquier juego sin introducir condiciones específicas en el núcleo.

La puntuación nativa pertenece a cada juego. `core/scores.js` transforma una primera victoria en una cantidad limitada de XP de la arcade, comparable entre juegos. El perfil local conserva el esquema 2 y añade campos con valores iniciales, por lo que una actualización no borra las partidas ya guardadas. La vitrina muestra el avance de la selección visible sin reducir un porcentaje global al publicar otro juego.

## Fusión 2048

Segundo juego en `games/2048/`, con campaña de 60 niveles, contrarreloj de 180 segundos y reto diario. Desliza en móvil, utiliza flechas/WASD o botones. Guarda progreso local y 35 premios independientes; backup `fusion-2048.zip`.
