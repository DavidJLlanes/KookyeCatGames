# KookyeCatGames — instrucciones permanentes del proyecto

## Objetivo
Crear una arcade web instalable en `https://djl.com.es/games`, pensada para aproximadamente 50 juegos. La portada ofrece acceso al catálogo. Cada juego vive en su propia subcarpeta y conserva progreso separado.

## Decisiones permanentes de David
- La plataforma debe ser muy visual, atractiva y coherente entre portada, juegos, iconos, logros y trofeos. Cada nuevo juego necesita portada e imágenes propias adaptadas al lenguaje gráfico común.
- Cada juego debe tener carpeta, `game.json`, reglas, lógica, puntuación y récords independientes, imágenes, controles, progreso, catálogo de premios e insignias propias. El registro común declara los juegos disponibles y carga sus catálogos cuando hacen falta.
- La gamificación debe cubrir el uso real de la arcade y los aspectos relevantes de cada juego. Incluir variedad de logros y trofeos, hitos de dominio y objetivos de largo plazo; evitar que unas pocas partidas desbloqueen una gran proporción del catálogo.
- Cada premio tiene icono propio y dificultad visible. Los premios difíciles requieren una presentación más llamativa. La vitrina debe seguir siendo navegable con 50 juegos, mediante filtros, búsqueda, paginación y carga diferida.
- Los juegos deben responder con fluidez a táctil, ratón y teclado. Verificar gestos, cruces y correcciones de casillas, reinicios, fin de nivel, errores y persistencia antes de publicar cambios.
- Picross debe poder resolverse por deducción sin adivinar; la comprobación se aplica a toda la campaña y a puzles aleatorios. Las marcas vacías equivocadas muestran aviso visual sin consumir vida; rellenar mal consume corazón. El aviso en la casilla se desvanece en dos segundos y no bloquea otras casillas.
- La PWA instalada se actualiza sola con comprobaciones limitadas para no sobrecargar el VPS y muestra un aviso al cargar la última versión. Coordinar HTML, módulos y caché para evitar mezclas de versiones.
- Conservar la estructura modular y documentar las decisiones que afecten a futuros juegos. En esta etapa inicial no se exige migrar los datos del prototipo, pero las actualizaciones normales no deben borrar el progreso vigente.
- Trabajar en el repositorio, publicar en `main` tras revisar, y entregar el comando de despliegue manual para el VPS. No desplegar en el VPS sin petición expresa.

## Tecnología y arquitectura
- Priorizar HTML5, CSS y JavaScript modular, con archivos pequeños, enfocados y fáciles de revisar.
- Mantener la web rápida, escalable, accesible y adaptable a móvil, tablet y PC.
- Evitar dependencias y frameworks innecesarios; proponer una tecnología adicional solo si resuelve una necesidad concreta y explicar el motivo.
- Compartir una carcasa común para navegación, preferencias, logros, trofeos, puntuaciones y backups. Aislar lógica y recursos específicos de cada juego en su subcarpeta.
- Cada juego declara su identidad, versión, modos y formato de progreso de manera explícita.

## Datos, privacidad y backups
- PRIVACIDAD TOTAL: no habrá cuentas de usuario, perfiles remotos ni inicio de sesión. El progreso se guarda únicamente en el dispositivo del jugador; no habrá sincronización ni almacenamiento remoto de partidas.
- Guardar datos estructurados en JSON y usar almacenamiento local adecuado para datos persistentes.
- Permitir exportar y restaurar el progreso de cada juego en un ZIP cuyo nombre sea el de la carpeta del juego y extensión `.zip`.
- Permitir exportar y restaurar todos los juegos en `games.zip`.
- Al importar, identificar el juego mediante metadatos, validar estructura y versión y restaurar localmente. No subir ni descomprimir backups en el VPS.

## Logros, puntuaciones y trofeos
- Mantener un sistema común, amplio y extensible de logros y trofeos para la web y cada juego.
- Los logros corresponden a hitos y actividad medibles, con categorías o niveles cuando aporten valor; evitar premios repetitivos o arbitrarios.
- Conservar récords, puntuaciones, estadísticas y desbloqueos localmente.
- Mostrar en cada juego el estado de partida y la información pertinente de puntuación y logros sin ocultar el área principal.
- Gamificar la actividad de la arcade y de cada juego con muchos tipos de retos; escalonar los requisitos para que unas pocas partidas no desbloqueen una gran parte del catálogo.
- Cada logro y cada trofeo tiene una insignia visual propia, coherente con la web. Los premios difíciles deben resultar más llamativos.
- Separar el catálogo y la evaluación comunes de los logros, métricas y reglas de puntuación específicos de cada juego. Los eventos tienen contrato versionado y no deben conceder progreso por refrescar la página.
- Cada juego vive en su carpeta con `game.json`, archivos de reglas y puntuación, catálogo propio de logros, imágenes y progreso independiente. La portada agrega datos sin mezclar puntuaciones de modos incompatibles.
- Mantener `core/game-registry.js` como registro ligero de los juegos publicados; cargar sus catálogos bajo demanda. El núcleo no debe importar directamente código de Picross ni de otros juegos.
- Cada juego conserva su puntuación nativa. La arcade usa XP normalizada por primera victoria de cada puzle o reto; un juego nuevo no cambia retrospectivamente el porcentaje global. Mostrar avance por juego y selección.
- La vitrina debe filtrar, buscar y paginar premios; no renderizar a la vez las insignias de 50 juegos.
- Los eventos comunes registran actividad real de la web (visitas por sesión y días distintos, juegos, modos, copias, restauraciones, tarjetas y dominios). Evitar conceder logros por refrescos repetidos.
- Las partidas y los premios se guardan en el dispositivo; los backups individuales y globales incluyen el progreso del esquema vigente. En esta fase inicial no es necesario migrar datos de versiones anteriores.

## Tarjetas para compartir
- Permitir crear tarjetas de imagen con logros, puntuaciones y trofeos, tanto del perfil general como de cada juego.
- Permitir guardar o compartir las tarjetas en Android, iPhone y PC. Usar compartir nativo de archivos cuando exista y ofrecer siempre descarga de imagen.
- Optimizar las tarjetas para pantallas pequeñas y redes sociales. No incluir datos personales.
- Generar las imágenes en el dispositivo, sin enviar progreso a un servidor.

## Interfaz y controles
- Estética divertida, colorida y estimulante, con jerarquía visual clara y controles accesibles.
- Los juegos se adaptan a pantalla completa en móvil y PC; pueden mostrar puntuación, logros, trofeos y navegación además del área de juego.
- Cada juego incluye un control visible para volver a la portada.
- Como máximo tres modos por juego; cada uno tendrá un propósito distinto.
- Todos los juegos deben funcionar con fluidez y de manera profesional en móvil táctil y escritorio con ratón y teclado. Los controles, foco, gestos, tamaños táctiles y estados deben sentirse coherentes y atractivos.
- Respetar contraste suficiente, accesibilidad por teclado y la preferencia de movimiento reducido.
- Usar Inspo MCP al diseñar nuevas pantallas o juegos, salvo que ya exista un sistema visual establecido que deba respetarse.

## Recursos visuales
- Crear o preparar los gráficos e iconos necesarios para la arcade y cada juego.
- Incluir iconos de instalación para Android, iPhone y PC, favicon y Open Graph cuando corresponda.
- Mantener consistencia visual entre portada, juegos, iconos y tarjetas compartibles.

## Primer juego
- El primer juego es Picross.
- Modos previstos: clásico, contrarreloj y reto diario (máximo tres).

## Proceso de ampliación
- Consultar estas instrucciones antes de añadir o modificar juegos y servicios compartidos.
- Preservar compatibilidad del progreso mediante versiones de esquema y migraciones explícitas.
- Evitar archivos monolíticos; separar responsabilidades en archivos pequeños.
- No introducir cuentas, inicio de sesión, telemetría, sincronización ni almacenamiento remoto de partidas.

## Carpeta local y GitHub
- La raíz local del proyecto es `F:\Proyectos\KookyeCatGames`.
- Desarrollar y revisar primero en esa carpeta; después publicar los cambios aprobados en `main` de `https://github.com/DavidJLlanes/KookyeCatGames`.
- No reemplazar cambios ajenos sin inspeccionarlos.

## Despliegue VPS
- Destino: VPS Ubuntu, `/var/www/djl.com.es/games/`.
- Al entregar una versión lista, proporcionar comandos claros para desplegar manualmente.
- No conectarse al VPS ni ejecutar despliegues remotos salvo petición explícita. Limitar los comandos al directorio del proyecto.

## Robustez
- Aislar la base de datos IndexedDB, stores y claves bajo el namespace KookyeCatGames para evitar colisiones con otras aplicaciones del mismo origen.
- Coordinar el service worker y la PWA con el alcance `/games/`; usar caché versionada y verificar operación offline.
- La PWA instalada se actualiza automáticamente. Limitar las comprobaciones de versión para no sobrecargar el VPS y, al cargar una actualización, mostrar un aviso visible de que ya está en la última versión.
- Definir un contrato de eventos versionado entre juegos y el sistema común de logros.
