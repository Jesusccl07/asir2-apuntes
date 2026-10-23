# Manual de estilo · cómo se hace un tema (modelo: ASO Tema 2)

Modelo de referencia: `temas/aso/tema-2.html` + `tema-2-app.js` + `tema-2-preguntas.js` + `tema-2-scripts.js`.
Cuando se pida un tema nuevo se replica **esta estructura entera**. Solo cambian los colores de acento y el contenido.

## 1. Archivos de un tema
| Archivo | Qué contiene |
|---|---|
| `tema-N.html` | Página única: CSS en `<style>`, 3 vistas (`#v-teoria`, `#v-practica`, `#v-test`), modal y toast |
| `tema-N-preguntas.js` | `window.TN_TOPICS` (bloques) y `window.TN_QUESTIONS` (banco) |
| `tema-N-scripts.js` | `window.TN_SCRIPTS` (código de los ejercicios, si la asignatura los tiene) |
| `tema-N-app.js` | Toda la lógica: navegación, laboratorios, práctica, test, ranking |

Cabecera del HTML: `config.js` y `claude-shim.js` (ranking/estadísticas), al final `back.css` y el enlace `#asir-back` hacia `asignatura.html?s=<slug>`.
Después hay que añadirlo a `assets/data.js` (catálogo) y subir.

## 2. Estructura de la página
**Barra superior fija** (`.top`): logo `>_` + nombre del tema, pestañas con pastilla animada (`.pill`) **Teoría · Práctica · Test** (rutas `#teoria`, `#practica`, `#test`), chip 🔥 de días seguidos y botón claro/oscuro.

### Vista Teoría
- **Hero**: etiqueta (`.eyebrow` con punto que parpadea), título con palabra en degradado (`.grad`), párrafo, 3 estadísticas (`.hero-stats`) y una **ventana de terminal que escribe sola** (`.termwin`, `#typer`).
- **Layout con índice lateral** (`.toc`): enlaces numerados, el activo se resalta, los leídos se marcan, barra «Has leído X de N». En móvil pasa a `.mobile-toc`.
- **Secciones numeradas** (`.sec`, `--c` = color propio de cada una), cada una con cabecera `.sec-head` (número grande `01`, título, subtítulo). Unos 15 bloques por tema.
- Todo aparece con **revelado al hacer scroll** (`.rv` → `.in`).

### Componentes de cada sección (usar los que encajen)
- **Esquema SVG animado** (`.diagram` + `.cap`): cajas `rect` con colores `*-soft` y borde de acento, flechas con `.flow` (línea que se mueve) y nodo clave con `.pulse`.
- **Tarjetas** (`.card`, `.grid .g2`) con icono emoji, y `.card.hov`.
- **Posits** (`.postits .postit`, variantes `pink/blue/green/orange`): curiosidades y errores típicos.
- **Notas** (`.note` con `info/warn/tip/bad/vio`): icono en círculo + título `b.t`.
- **Código** (`.code` con cabecera, nombre de fichero, botón copiar, resaltado de sintaxis, `data-fn`), y salida (`.out`).
- **Tablas** (`.tbl` dentro de `.tscroll`, color con `--c`), **comparador bien/mal** (`.vs .ok/.ko`), **verdadero/falso** (`.tf`).
- **Tarjetas que giran** (`.flips .flip`, cara A/B).
- **Árbol de familias** (`.tree .fam`), **anatomía de código** (`.anat` con línea resaltada ↔ explicación), **canales** (`.chan`), **celdas** (`.cells`) para bucles/arrays.
- **Laboratorios interactivos** (`.lab`): el alumno escribe/elige y ve el resultado al instante (ejecutar, `$?`, comillas, read, shift, calculadora, test de ficheros, case, regex, bucles, arrays, ámbito). **Cada concepto difícil lleva su laboratorio.**

### Vista Práctica
- Cabecera `.p-hero`, tarjetas de **datos copiables** (`.dato`), diagrama SVG del entorno.
- **Checklist por fases** (`.phase` / `.step`): casilla, etiqueta de dónde se ejecuta (`.where`), descripción y comando copiable. Anillo de progreso (`.ring`), progreso guardado en `localStorage` (`t2.steps`), confeti al completar.
- **Chuleta de comandos** (tabla), **«Si algo falla…»** (posits), **ejercicios** en tarjetas con filtro por categoría y **modal** con solución, cómo ejecutarlo y salida esperada, **preguntas del profe** en `details.qa`.

### Vista Test (gamificado)
- **Banco**: `[bloque, nivel 1/2/3, pregunta, [opciones], índice correcta, explicación, código opcional]`. Un bloque por apartado de la teoría (+ uno de práctica). Cada pregunta explica **por qué** es correcta. Mezcla de opciones al mostrar.
- **XP**: base 10/20/30 según nivel × multiplicador de racha (+0,5 cada 3 aciertos, máx. x3). **10 niveles** con nombre y emoji temáticos.
- **6 modos**: Práctica (nivel/bloques/cantidad), Examen (30 preguntas 9/13/8, 25 min, sin pistas, nota sobre 10), Supervivencia (3 vidas), Relámpago (60 s, +3 s por acierto), Repasar fallos, Solo difíciles.
- **Panel**: nivel y barra de XP, KPIs (mejor racha, % aciertos, dominadas, mejor nota), **dominio por bloque**, nombre + **ranking**.
- **Durante la pregunta**: barra de progreso, racha 🔥, multiplicador, atajos de teclado 1–4 e Intro, sacudida al fallar, XP flotante, toast + confeti en rachas 5/10/15/20/30/50.
- **Resultados**: anillo con la nota animada, KPIs, repetir modo / repetir fallos, **revisión** de fallos o todas con la respuesta correcta y la explicación.
- **Guardado**: `localStorage` (`tN.test`) y ranking en Firestore (colección `tN-ranking`, un doc por usuario con nick, score, final, best, streak, xp).

## 3. Diseño
- Fuentes: **Bricolage Grotesque** (títulos), **Atkinson Hyperlegible** (texto), **JetBrains Mono** (código), Caveat (toques manuscritos).
- Variables CSS en `:root`: `--bg --panel --ink --muted --line`, acento `--acc`, y pares `*-soft` para amber, violet, rose, sky. Código siempre oscuro (`--code-bg`).
- **Claro y oscuro** completos (automático por `prefers-color-scheme` y botón manual `data-theme`).
- Fondo con cuadrícula suave, tarjetas con `--shadow` y radio `--r:16px`, transiciones suaves, `prefers-reduced-motion` respetado, responsive (breakpoints 560/760/860/1020 px).
- **Colores por tema**: se puede cambiar `--acc` y la paleta de secciones (ASO usa verde `#0c9a6a`); el resto de la estructura no cambia.

## 4. Receta para un tema nuevo
1. Leer el material (PDF/apuntes/enunciados) y dividirlo en ~10–15 bloques numerados.
2. Para cada bloque: texto breve, **un esquema SVG animado**, tarjetas/tablas/posits/notas según toque, código y, si hay algo que se puede simular, un **laboratorio**.
3. Práctica: pasos en fases con comandos copiables, chuleta, fallos típicos, ejercicios con solución y preguntas de clase.
4. Test: mínimo ~10 preguntas por bloque en 3 niveles, con explicación; niveles de XP con nombres de la asignatura.
5. Colección de ranking propia `tN-ranking`, registrar en `assets/data.js`, probar en móvil y oscuro, subir.
