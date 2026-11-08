# Hoja de ruta: de 7 a 50 juegos

Fuente: «KookyeCat Games - Hoja de ruta 50 juegos(1).pdf», plan de catálogo v1, incorporado el 8 de noviembre de 2026.

## Orden y activación

Cuando David diga **«haz el siguiente juego»**, consultar primero este archivo y `AGENTS.md` en la versión actual de `main`, comprobar el catálogo publicado y desarrollar **un solo juego: el primero pendiente de la tabla**. Aplicar todas las normas del proyecto sin que David tenga que repetirlas.

Se adopta la numeración 1–43 del documento como orden de implementación. La sugerencia del PDF de empezar por Ilumina y Cifras no cambia esa secuencia. Una petición explícita posterior de David tiene prioridad. No iniciar juegos automáticamente ni interpretar el calendario orientativo del PDF como una programación de tareas.

**Siguiente previsto: Cajas (Sokoban), número 2 de esta lista y noveno juego de la arcade.**

Al terminar y verificar un juego, actualizar aquí su estado, carpeta y enlace, además del README, registro y caché correspondientes. Marcarlo completado solo cuando la implementación y sus comprobaciones estén publicadas en `main`; no confundir publicación en GitHub con despliegue en el VPS. Si está en curso, continuar ese juego antes de saltar al siguiente.

## Base existente

| Juego | Carpeta |
| --- | --- |
| Picross | `picross/` |
| Fusión 2048 | `2048/` |
| Bubble Shooter | `bubbleshooter/` |
| Tetris | `tetris/` |
| Rush Hour | `rush/` |
| Lights Out | `lights/` |
| Conecta tuberías | `tuberias/` |

## Los 43 juegos nuevos

Los números son los del PDF, no la posición global del catálogo. A: 1–21, rejilla y deducción; B: 22–32, números, lógica y palabras; C: 33–40, estrategia contra IA; D: 41–43, memoria y puntería.

| Orden | Juego | Verificación prevista | Estado |
| --- | --- | --- | --- |
| 1 | Ilumina (Akari) | Solución única y mínimo de lámparas | Implementado en main: [ilumina/](ilumina/). Campaña verificada; revisión visual en dispositivos pendiente. |
| 2 | Cajas (Sokoban) | BFS/A* y empujes mínimos | Pendiente |
| 3 | Inunda | Óptimo exacto mediante IDA* | Pendiente |
| 4 | Minas seguras | Solucionador sin adivinanzas ni situaciones 50/50 | Pendiente |
| 5 | Conecta pares | Unicidad y longitud de caminos | Pendiente |
| 6 | Puentes (Hashi) | CSP con solución única | Pendiente |
| 7 | Cierra el bucle | Unicidad por backtracking | Pendiente |
| 8 | Perlas (Masyu) | Unicidad | Pendiente |
| 9 | Islas (Nurikabe) | Unicidad | Pendiente |
| 10 | Luces y sombras | Unicidad y retrocesos | Pendiente |
| 11 | Habitaciones (Heyawake) | Unicidad y retrocesos | Pendiente |
| 12 | Campamento (Tents) | Unicidad | Pendiente |
| 13 | Estrellas (Star Battle) | Unicidad | Pendiente |
| 14 | Rascacielos | Unicidad | Pendiente |
| 15 | Imanes | Unicidad | Pendiente |
| 16 | Relleno (Fillomino) | Unicidad | Pendiente |
| 17 | Cuentas (KenKen) | Solución única | Pendiente |
| 18 | Sumas cruzadas (Kakuro) | Solución única | Pendiente |
| 19 | Sudokín | Unicidad y técnicas mínimas; sudoku 6 × 6 | Pendiente |
| 20 | Sendero (Hidato) | Camino único | Pendiente |
| 21 | Colmena (Suguru) | Unicidad | Pendiente |
| 22 | Cifras | Número de soluciones por fuerza bruta | Pendiente |
| 23 | Código secreto | Mínimo de intentos; estrategia de Knuth | Pendiente |
| 24 | Palabra del día | Diccionario local y fecha | Pendiente |
| 25 | Criptograma | Unicidad de la sustitución | Pendiente |
| 26 | Anacumbres | Diccionario y rareza | Pendiente |
| 27 | Cerillas | Solucionador exhaustivo y solución única | Pendiente |
| 28 | Criptosuma | Solucionador y solución única | Pendiente |
| 29 | Balanza | Óptimo por búsqueda | Pendiente |
| 30 | Deslizante | Movimientos mínimos mediante IDA* | Pendiente |
| 31 | Torres | Mínimo exacto; 2^n − 1 para Hanoi clásico; verificar las variantes | Pendiente |
| 32 | Laberinto | Longitud del camino único y giros | Pendiente |
| 33 | Cuatro en línea | Posiciones ganables certificadas y profundidad de IA | Pendiente |
| 34 | Reversi | Evaluación frente a bot de referencia | Pendiente |
| 35 | Damas | Damas españolas; posiciones ganables y profundidad | Pendiente |
| 36 | Hex | Motor y certificado de victoria | Pendiente |
| 37 | Cercados | Simulación de partidas de puntos y cajas | Pendiente |
| 38 | Zorro y ocas | Victoria certificada por bando | Pendiente |
| 39 | Mate en N | Motor precalculado; mate en 1, 2 o 3 | Pendiente |
| 40 | Tres en raya 4×4 | Tabla completa de estados propuesta; verificar viabilidad antes de prometerla | Pendiente |
| 41 | Parejas | Tableros fijos precalculados y simulación | Pendiente |
| 42 | Secuencias | Longitud de las series y simulación | Pendiente |
| 43 | Dianas | Dificultad mediante simulación de bot | Pendiente |

## Requisitos de implementación de esta hoja de ruta

- Cada juego vive en su propia subcarpeta y URL `/games/<id>/`, con `index.html`, `game.json`, `interface.js`, recursos y lógica propios. Elegir y documentar la carpeta al implementarlo, salvo que David la indique.
- Mantener los servicios comunes existentes y la carcasa visual compartida. No introducir un motor de reglas o IA compartido en ejecución entre juegos nuevos: cada juego conserva su lógica dentro de su carpeta.
- Generadores y solucionadores de desarrollo pueden vivir en `scripts/` y emitir datos estáticos dentro del juego. No trasladar cálculos costosos al VPS ni al navegador.
- Campaña de 60 niveles, contrarreloj y reto diario determinista, premios propios y progreso local, conforme a las normas vigentes. Verificar reglas, solvencia y dificultad progresiva con `node scripts/check-<id>.mjs`.
- Las verificaciones de la tabla son objetivos técnicos, no certificaciones ya realizadas. Definir la métrica real y demostrarla; revisar la viabilidad de búsquedas exhaustivas y documentar cualquier limitación, sin afirmar optimalidad o unicidad sin pruebas.
- Para estrategia contra IA, validar las reglas específicas y la progresión con posiciones y partidas de referencia; una mayor profundidad por sí sola no demuestra una dificultad adecuada.
- Parejas, Secuencias y Dianas son la excepción a la solvencia por solucionador: validar dificultad mediante simulación y documentar el método en el README.
- Actualizar el README principal con imagen, descripción, mecánica, modos, controles, niveles, premios, carpeta, enlace y backup de cada juego.
- Aplicar íntegramente `AGENTS.md`: interfaz unificada, explicación breve dentro del juego, táctil/ratón/teclado, móvil y tablets verticales, sonidos suaves sin música, progreso y backups, premios, PWA y actualización automática.
- Trabajar directamente sobre GitHub y publicar en `main`. No sincronizar la copia local ni desplegar en el VPS sin petición expresa.
