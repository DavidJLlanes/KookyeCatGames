# KookyeCatGames — instrucciones permanentes del proyecto

## Objetivo
Crear una arcade web instalable en `https://djl.com.es/games`, con muchos minijuegos sencillos. La portada ofrece acceso al catálogo. Cada juego vive en su propia subcarpeta y conserva progreso separado.

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
