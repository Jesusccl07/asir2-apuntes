# ASIR 2 · Apuntes y tests

Web con todos los apuntes, tests y exámenes de 2º ASIR, organizados por asignatura y tema.

- `index.html` · portal de asignaturas
- `asignatura.html?s=<asignatura>` · temas de cada asignatura
- `perfil.html` · tu progreso: notas, tiempo de estudio e intentos en gráficos
- `temas/<asignatura>/<tema>.html` · cada tema (tal cual estaba publicado)
- `assets/data.js` · catálogo; para añadir un tema copia su `.html` a `temas/<asignatura>/` y añádelo ahí

## ASO · Tema 2 (Shell Script)

`temas/aso/tema-2.html` tiene tres vistas: `#teoria`, `#practica` y `#test`.

- `tema-2-preguntas.js` · banco de preguntas del test. Para añadir preguntas de apuntes nuevos, añade filas al bloque que toque.
- `tema-2-scripts.js` · código de los scripts e01–e23 (se genera a partir de la carpeta `aso_sh_40_clemente_j`).
- `tema-2-app.js` · laboratorios interactivos, checklist de práctica y motor del test (rachas, XP, modos y ranking).

## Puntuaciones y estadísticas

Cada usuario tiene su propio perfil: las notas, intentos y minutos de estudio se guardan en **su navegador**
y se ven como gráficos en `perfil.html` (se pueden exportar/importar para cambiar de dispositivo).

### Ranking compartido (opcional)

Para que todos los usuarios aparezcan en el mismo ranking hace falta una base de datos online:

1. Crea un proyecto en <https://console.firebase.google.com> y activa **Firestore** en modo de prueba.
2. Rellena `assets/config.js` con `projectId` y `apiKey` del proyecto.
3. Haz commit y push.
