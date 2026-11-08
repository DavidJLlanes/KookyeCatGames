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
- La PWA instalada se actualiza sola: comprobar al instalar, luego como máximo cada seis horas mientras haya conexión y la app esté visible, y al volver a primer plano o a Internet si ya venció el intervalo. Reutilizar el registro compartido del service worker entre páginas, no sondear una API ni descargar recursos si no cambió la versión, guardar el progreso antes de recargar y mostrar un aviso al completar. Coordinar HTML, módulos y caché para evitar mezclas de versiones.
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
- Norma permanente: todos los juegos usan exactamente la misma distribución de interfaz en escritorio y la misma versión responsive en móvil. La configuración y el tablero propios permanecen en la carpeta de cada juego; no se permite crear una carcasa visual distinta para un juego nuevo.
- Contrato de pantalla: cabecera compacta con volver a Arcade, nombre, mascota y tarjeta; área principal con modos, selector de nivel, cuatro indicadores de partida, tablero y controles; paneles en orden de récord, progreso, premios y ayuda; sección final común con tarjeta, backup y restauración, y borrado de progreso.
- El tablero es el protagonista: en escritorio ocupa la columna amplia, con los datos secundarios en una barra lateral estrecha. En tablet y móvil, los paneles pasan debajo del tablero; nunca poner ayudas, ilustraciones grandes, backups o vitrinas antes del área de juego. Mantener tamaños táctiles, foco visible y navegación sin desbordamiento horizontal.
- Compartir `assets/css/game-interface.css` y `assets/js/game-interface.js` para estructura, jerarquía, breakpoints, controles comunes y pantalla completa. Cada carpeta aporta `interface.js`, su HTML y el CSS exclusivo del tablero; solo varían la identidad, el acento y las acciones o métricas necesarias para jugar. Mantener el orden de los paneles y las funciones comunes al ampliar la arcade.
- Pantalla completa disponible en todos los juegos en el mismo lugar. Si el navegador no admite la API nativa, ofrecer un modo de juego ampliado con salida visible y Escape, sin alterar la partida ni su progreso.
- Cada juego incorpora efectos sonoros suaves para movimientos, aciertos y errores, sin música. Cada juego muestra un interruptor accesible para activar o desactivar sus sonidos y recuerda esa preferencia localmente. Aplicar la misma norma a todos los juegos futuros.
- Estética divertida, colorida y estimulante, con jerarquía visual clara y controles accesibles.
- Los juegos se adaptan a pantalla completa en móvil y PC; pueden mostrar puntuación, logros, trofeos y navegación además del área de juego.
- Cada juego incluye un control visible para volver a la portada.
- Como máximo tres modos por juego; cada uno tendrá un propósito distinto.
- Todos los juegos deben funcionar con fluidez y de manera profesional en móvil táctil y escritorio con ratón y teclado. Los controles, foco, gestos, tamaños táctiles y estados deben sentirse coherentes y atractivos.
- Norma permanente: optimizar toda la portada y todos los juegos para escritorio, móvil y tablet. En tablets, priorizar la orientación vertical y proporciones habituales (aprox. 3:4 o 4:3): el tablero debe aprovechar el ancho disponible, mantener controles legibles y cómodos y dejar los paneles secundarios debajo o en columnas equilibradas. Aplicar la norma también a todos los juegos existentes.
- En móvil, todos los juegos y la portada deben impedir el zoom con pellizco. Mantener `maximum-scale=1,user-scalable=no` en sus metadatos viewport, `touch-action: pan-x pan-y` en el documento y cargar `assets/js/mobile-zoom-lock.js` en cada página. No retirar esta protección al añadir nuevos juegos.
- Respetar contraste suficiente, accesibilidad por teclado y la preferencia de movimiento reducido.
- Usar Inspo MCP al diseñar nuevas pantallas o juegos, salvo que ya exista un sistema visual establecido que deba respetarse.

## Recursos visuales
- El gato azul de vóxeles es la mascota permanente de KookyeCat Games: poses de reposo, saludo, juego y celebración, movimiento suave y reacción al toque o clic. Cada pose debe conservar exactamente cuatro extremidades reconocibles (dos patas delanteras y dos traseras); la cola debe distinguirse de las patas. Mantener el mismo estilo de vóxeles y no tapar tableros ni controles.
- Crear o preparar los gráficos e iconos necesarios para la arcade y cada juego.
- Incluir iconos de instalación para Android, iPhone y PC, favicon y Open Graph cuando corresponda.
- Mantener consistencia visual entre portada, juegos, iconos y tarjetas compartibles.

## Primer juego
- El primer juego es Picross.
- Modos previstos: clásico, contrarreloj y reto diario (máximo tres).

## Proceso de ampliación
- Norma permanente de David: cada nuevo juego debe tener su descripción en el README principal antes de publicarse. Añadirlo al catálogo y documentar imagen propia, mecánica, modos, controles, niveles, premios, carpeta, enlace para jugar y nombre del backup; actualizar también los datos generales que cambien. Si se modifica un juego existente, mantener su documentación al día.
- Consultar estas instrucciones antes de añadir o modificar juegos y servicios compartidos.
- Preservar compatibilidad del progreso mediante versiones de esquema y migraciones explícitas.
- Evitar archivos monolíticos; separar responsabilidades en archivos pequeños.
- No introducir cuentas, inicio de sesión, telemetría, sincronización ni almacenamiento remoto de partidas.

## GitHub y copia local
- Trabajar sobre el repositorio `https://github.com/DavidJLlanes/KookyeCatGames`, directamente en la rama `main`.
- No usar ni sincronizar la copia local del repositorio salvo que David pida expresamente sincronizarla.
- Revisar la versión actual de `main` antes de cada cambio y no reemplazar cambios ajenos sin inspeccionarlos.

## Despliegue VPS
- La portada y raíz web de la arcade van en `/var/www/djl.com.es/games/` y se sirven desde `https://djl.com.es/games/`.
- En el repositorio, `index.html`, `assets/` y `core/` están en la raíz; cada juego vive también como carpeta hermana de `index.html` (`picross/`, `2048/`, `bubbleshooter/`, `tetris/`). Así, el despliegue directo conserva la misma estructura y no añade un nivel `games/` extra.
- Cada juego se despliega en una subcarpeta directa de esa raíz: `/var/www/djl.com.es/games/<id-del-juego>/` (por ejemplo, Tetris en `/var/www/djl.com.es/games/tetris/`). Nunca anidar los juegos en `/var/www/djl.com.es/games/games/<id>/`.
- Los enlaces del catálogo, las rutas de recursos y la caché offline deben coincidir con esas URL directas. No asumir que extraer el repositorio entero en la raíz conserva este mapa: revisar el empaquetado y las rutas relativas antes de dar el comando de despliegue.
- Al entregar una versión lista, proporcionar comandos claros para desplegar manualmente.
- No conectarse al VPS ni ejecutar despliegues remotos salvo petición explícita. Limitar los comandos al directorio del proyecto.

## Robustez
- Aislar la base de datos IndexedDB, stores y claves bajo el namespace KookyeCatGames para evitar colisiones con otras aplicaciones del mismo origen.
- Coordinar el service worker y la PWA con el alcance `/games/`; usar caché versionada y verificar operación offline.
- La PWA instalada se actualiza automáticamente con las comprobaciones limitadas descritas arriba. La instalación del nuevo worker debe precargar una sola vez la caché versionada, activarse sin pedir una acción manual y recargar las páginas abiertas tras guardar su progreso.
- Definir un contrato de eventos versionado entre juegos y el sistema común de logros.

## Segundo juego
- Fusión 2048 vive en `2048/`: 60 niveles, controles táctiles y teclado, 35 premios visuales propios, modos campaña, contrarreloj y reto diario; progreso y backup independientes.

## Tercer juego
- Bubble Shooter vive en `bubbleshooter/`: campaña de 60 niveles, contrarreloj de 120 segundos y reto diario determinista; 35 premios con iconos propios y backup `bubbleshooter.zip`.
- Tablero hexagonal, grupos de al menos tres, caída de burbujas desconectadas, rebotes y cambio de burbuja una vez por tiro. Cada seis tiros sin eliminar un grupo baja el techo.
- Controles: arrastrar y soltar con dedo o ratón; con foco en el tablero, flechas para apuntar, espacio/Enter para disparar, X para cambiar y P para pausar. Ofrecer botones táctiles equivalentes, guía de rebote y símbolos además del color.
- Conservar los disparos en vuelo al guardar; pausar al ocultar la página y al recuperar una partida. El tiempo de pausa no cuenta. No volver a conceder victoria diaria ni XP del mismo reto.

## Tarjetas de progreso: instrucción permanente de David
- La arcade tendrá una tarjeta visual propia y cada juego tendrá otra tarjeta individual, con diseño consistente con la web y entre tarjetas.
- Las tarjetas deben ser atractivas y trabajadas: mostrar el progreso real de niveles o juegos, logros, trofeos, puntuación e insignias conseguidas con sus iconos. Adaptar acentos y contenido a cada juego sin perder la identidad común.
- Deben generarse localmente, permitir compartir o descargar, y actualizarse al añadir nuevos juegos. Evitar tarjetas genéricas o sosas con solo texto y una puntuación.
- Las acciones de backup deben explicar claramente qué se descarga y qué se restaura, tanto en la portada como dentro de cada juego.

- Las tarjetas de arcade y de cada juego deben abrir la opción nativa de compartir archivos en Android y iPhone al tocar Compartir; ofrecer descarga PNG como alternativa cuando el navegador no admita compartir la imagen. Si la generación consume la activación del usuario, mantener la tarjeta preparada y pedir un segundo toque para abrir Compartir, sin descargar automáticamente.

- El botón para crear la tarjeta debe estar visible cerca de la cabecera también en móvil, además de la sección de progreso. En escritorio la acción descarga el PNG directamente y el texto del botón debe decirlo; solo dispositivos móviles usan Compartir nativo.

- La tarjeta de progreso debe tener una llamada a la acción destacada al comienzo de la sección de datos en móvil. No depender de que una tercera tarjeta al final de las copias de seguridad sea visible.

## Cuarto juego
- Tetris vive en `tetris/`: campaña de 60 niveles de líneas objetivo crecientes, contrarreloj de 120 segundos para completar 15 filas y reto diario determinista; 35 insignias propias y backup `tetris.zip`.
- Tablero de 10 × 20, siete piezas, giro con ajuste lateral, caída fantasma, caída rápida y velocidad creciente cada diez filas. Controles táctiles por botones y gestos en el tablero (toque o deslizar arriba para girar, arrastrar lateralmente para mover la pieza de forma continua mientras se mantiene el dedo apoyado, deslizar abajo para bajar y gesto largo/rápido hacia abajo para caída rápida), ratón por botones y teclado (flechas, X, espacio y P).
- Conservar la carcasa compartida de escritorio/móvil, los efectos suaves sin música y su interruptor local. Actualizar catálogo, README, eventos y caché offline al ampliar la plataforma.

## Quinto juego
- Rush Hour vive en `rush/`: 60 niveles de campaña, contrarreloj de 120 segundos y reto diario determinista; 35 premios propios y backup `rush.zip`.
- Desliza cada coche únicamente por su carril; despeja la fila del coche rojo para sacarlo por la derecha. El tablero es 6 × 6 y la ruta debe poder resolverse sin adivinar.
- Acepta arrastre táctil o con ratón, botones direccionales y teclado; conserva deshacer, pausa, selección, sonido suave con interruptor local y progreso solo en el dispositivo.
- Mantener el contrato de interfaz, accesibilidad, zoom móvil bloqueado, optimización para tablets verticales y progreso local común a los demás juegos.
- Actualizar catálogo, README, eventos, caché offline y las 35 insignias al ampliar Rush Hour.

## Instalación en Safari
- La portada debe ofrecer un botón de instalación accesible y explicar los pasos manuales de Safari en iPhone/iPad (Compartir → Añadir a pantalla de inicio), ya que iOS Safari no emite el evento `beforeinstallprompt`.
- Mantener iconos Apple y metadatos de web app, manifiesto y service worker con scope `/games/`; comprobar el flujo en Safari móvil cuando haya un dispositivo/navegador de prueba disponible.

## Dificultad progresiva: norma permanente
- Todos los juegos nuevos y las revisiones de juegos existentes deben tener una lógica bien implementada y dificultad progresiva medible. No confundir más mezclas aleatorias, piezas o velocidad con dificultad real.
- Definir la medida propia del juego (solución mínima, dependencias, objetivos, ritmo) y validar que la campaña progresa según ella. Comprobar que los puzles tienen solución, no se repiten y respetan las reglas.
- Para puzles como Rush Hour y Lights Out, verificar las soluciones y medir su coste óptimo. Precalcular cuando convenga para no trasladar cálculos costosos al dispositivo ni al VPS.

## Sexto juego
- Lights Out vive en `lights/`, destino `/var/www/djl.com.es/games/lights/`: tablero 5 × 5, 60 niveles distintos en doce escalones de 3 a 14 pulsaciones óptimas, cinco tableros por escalón.
- Cada toque invierte la casilla y sus vecinas ortogonales, sin envolver bordes. Todas las soluciones se verifican enumerando las 32 posibles primeras filas y propagando las siguientes; se selecciona la solución de menor peso.
- Contrarreloj de 120 segundos y reto diario, 35 premios propios, backup `lights.zip`, controles táctiles/ratón/teclado, sonido suave opcional, interfaz compartida y adaptación a tablets verticales.

## Explicación breve de cada juego: norma permanente
- Cada juego existente y futuro debe mostrar una explicación breve, visible al abrir su propia página, antes de los modos y del tablero. Usar el componente compartido `arcade-game-intro`, manteniendo el tablero como protagonista y el mismo diseño responsive.
- Explicar en lenguaje sencillo el objetivo y la acción principal; añadir un ejemplo o aclarar una regla poco intuitiva cuando sea necesario. No dar por hecho que el jugador conoce el juego.
- Estas instrucciones de juego se muestran únicamente dentro de la página de cada juego. No añadir bloques de instrucciones a la portada, al catálogo ni a otras páginas. Las descripciones y documentación ya requeridas del README se mantienen.
- La ayuda ampliada «Cómo jugar» puede seguir disponible, pero no sustituye a esta explicación inicial visible. Mantener ambos textos coherentes con las reglas y los controles reales al modificar un juego.

## Séptimo juego
- Conecta tuberías vive en `tuberias/`, destino `/var/www/djl.com.es/games/tuberias/`. Cada toque gira una pieza 90° en sentido horario; la red gana cuando todas las piezas reciben agua desde IN y no queda ninguna conexión abierta. FIN está abajo a la derecha.
- Campaña de 60 redes con solución única, de 4 × 4 a 6 × 6, con mínimo no decreciente de 13 a 72 giros. La dificultad combina tamaño y coste óptimo; validar unicidad, conexiones, fugas y solución con `scripts/check-tuberias.mjs` y `scripts/pipes-solver.mjs`.
- El solucionador se utiliza durante el desarrollo, no se ejecuta en el navegador ni en el VPS. Los niveles publicados son datos estáticos.
- Contrarreloj de 120 segundos y reto diario determinista, 35 insignias propias, backup `tuberias.zip`, tarjeta individual, controles táctiles/ratón/teclado y sonidos suaves sin música.
- Explicación inicial visible, agua y fugas identificables, deshacer y pistas con penalización. Mantener la carcasa común y adaptación a tablets verticales.

La campaña revisada deja al menos el 75 % de las piezas giratorias desorientadas. Además del tamaño y del coste óptimo, ordena las redes por las piezas que siguen siendo ambiguas tras propagar las restricciones locales: de 0 a 25, sin retrocesos. Esta es una medida estructural del solucionador, no una estimación del tiempo que tardará cada persona. Los primeros seis niveles son 4 × 4, los siguientes dieciocho son 5 × 5 y los treinta y seis restantes, 6 × 6. Al actualizar se reinicia solamente la partida antigua en curso; se conservan récords y niveles desbloqueados.

## Tarjetas del catálogo: títulos completos
- Las portadas se muestran completas, con proporción estable y `object-fit: contain`; no recortar títulos integrados en las ilustraciones.
- Las etiquetas como «¡Juega ya!» van en el bloque de información, nunca encima de la portada. El título HTML admite varias líneas, sin elipsis ni altura fija, y las categorías y etiquetas se redistribuyen en móvil, tablet y escritorio.

## Selector de juegos de la vitrina
- Para 50 juegos o más, mantener un selector compacto con búsqueda por nombre, lista alfabética y desplazamiento interno. No volver a una fila o cuadrícula permanente con un botón por juego.
- Mantener «Todos los juegos» y «Arcade», navegación por teclado, nombres completos y controles táctiles. Buscar juegos no debe descargar sus catálogos; cargar premios bajo demanda y conservar la paginación y los filtros de tipo y texto.

## Hoja de ruta y orden «haz el siguiente juego»
- La lista permanente y el estado de los 43 juegos nuevos hasta alcanzar 50 están en [ROADMAP.md](ROADMAP.md), transcritos de la hoja de ruta de David.
- Cuando David diga «haz el siguiente juego», leer este archivo y ROADMAP.md desde la versión actual de main, contrastar el catálogo y completar un único juego: el primero pendiente en el orden numerado. Si hay uno en curso, terminarlo antes de avanzar. No pedir que repita las normas.
- Aplicar todas las normas existentes y los requisitos de verificación de la hoja de ruta. Una instrucción explícita posterior de David tiene prioridad sobre el orden.
- Al completar y verificar el juego, publicar en main y actualizar su estado, carpeta y enlace en ROADMAP.md, además del README, catálogo y caché. Entregar el comando de despliegue manual; no ejecutar el despliegue ni sincronizar la copia local sin petición.
- Esta instrucción guarda el plan; no autoriza a iniciar juegos sin una petición ni crea un calendario automático.

## Octavo juego
- Ilumina (Akari) vive en `ilumina/`, destino `/var/www/djl.com.es/games/ilumina/`. 60 tableros 5 × 5 con solución única, campaña, contrarreloj y reto diario; 35 premios y backup `ilumina.zip`.
- Las lámparas iluminan filas y columnas hasta un muro, no pueden verse entre sí y deben respetar las pistas ortogonales de los muros. Verificar con `node scripts/check-ilumina.mjs`.
- La campaña progresa por bifurcaciones del solucionador exacto y, a igualdad, por número mínimo de lámparas. No presentar esa métrica como tiempo humano garantizado.

## Noveno juego
- Cajas (Sokoban) vive en `cajas/`, destino `/var/www/djl.com.es/games/cajas/`. Empuja dos cajas a sus metas; movimiento ortogonal, no se puede tirar ni atravesar paredes. Campaña de 60 niveles ordenados por empujes mínimos certificados por BFS de coste 0-1, y estados explorados como desempate.
- Contrarreloj de 120 segundos y reto diario determinista, 35 premios, backup `cajas.zip`, progreso local, explicación de reglas, interfaz común, controles táctiles/ratón/teclado, sonido suave opcional.
- Verificar niveles con `node scripts/check-cajas.mjs`; el solver de niveles vive en scripts y no se ejecuta en navegador/VPS.

## Revisión de dificultad de Cajas
- La campaña actual de `cajas/` usa tres cajas, tres metas y obstáculos internos; sus 60 niveles son distintos, con dificultad ordenada por mínimo de empujes (de 5 a 12) y estados explorados. El selector de nivel debe mostrar siempre 01–60, nunca valores indefinidos.
- Al cambiar los tableros, aumentar la versión de la partida activa y descartarla si pertenece al conjunto anterior; conservar los niveles completados, premios y récords.
