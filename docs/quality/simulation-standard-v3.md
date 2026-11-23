# Estándar de simulación v3 (temas 17 en adelante) — análisis y plan

Fecha: 2026-11-23. Amplía `docs/quality/3d-quality-bar.md` (la barra, continuidad, "Production standard 2026-11"); no lo sustituye. Objetivo del dueño: que el alumno **entienda mejor y más rápido** en la simulación, y que las simulaciones sean **más impresionantes, pulidas y bonitas**.

## 1. Qué cubre hoy el estándar de 17–18 (y lo hace bien)

- Continuidad: un cuerpo, una cámara; sitios medidos, vuelos, run-ons, línea `arrive`, prewarm de geometría.
- Corrección: fiel a los apuntes, guardas de visibilidad, anclas y etiquetas, tablet.
- Código de color de arcos del embrión al adulto; resumen final en 3D (`arkuen-mapa`).

Es un estándar de **continuidad y corrección geométrica**. Casi no dice nada medible sobre velocidad de comprensión ni sobre belleza del encuadre.

## 2. Lo que falla en pantalla (28 capturas de 14 etapas, 1440 px, hoy)

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **El sujeto es pequeño o está cortado.** | Tema 18: cobertura medida 15–33 % en casi todas, `edge` (cortado) en 8 de 14 capturas, `aho-sabai-gandorrak` 4,4 %. Tema 17: 3,6–44 %, `edge` en 6 de 14; `laringeko-kartilagoak` termina en 6 %, `arkuen-mapa` en 11,5 %. |
| 2 | **La garantía de encuadre está apagada.** | `fit: false` en 44/94 pasos (17), 83/137 (18) y 159/159 (19). |
| 3 | **Marco saturado de interfaz.** | Pie de figura, clave de ejes, clave de color, tarjeta "Non gaude?", píldoras: la clave de color y el pie quedan **encima del modelo** en la mayoría de capturas; en `arkuaren-osagaiak` tres píldoras-lupa tapan la clave. |
| 4 | **Formas de juguete o de diagrama.** | Glándulas = bolas y salchichas (`guruinen-jaisketa`); lengua = región de color sobre un bloque; diente = arco plano; crestas palatinas = cuñas; cara final = máscara pintada (naranja, azul, amarillo, morado). |
| 5 | **Lo que la etapa enseña es diminuto.** | `arkuaren-osagaiak`: arteria, vena, nervio y cartílago son puntos de 4–8 px. |
| 6 | **Demasiado texto a la vez.** | Nota al pie media 94–99 caracteres; 24/88 (17) y 44/138 (18) pasan de 110. Es el tercer texto del paso: bajo la escena el panel ya muestra la idea principal y la explicación. |
| 7 | **Pasos sin acontecimiento.** | 35 de 94 pasos (17) y 38 de 137 (18) no cambian la pose: solo cámara y nombres. |
| 8 | **El movimiento no deja rastro.** | Al terminar un descenso (timo, paratiroides, tiroides) el fotograma parado no dice de dónde vino nada. |
| 9 | **Poca recuperación activa.** | 8 preguntas en 22 etapas (17), 9 en 29 (18); el tema 14 tenía 51 en 26. "Ulertzeko gakoa": 2 (17) y 6 (18). |
| 10 | **La herramienta de QA no ve lo que ve el alumno.** | `stage-sheet.mjs` recorta a 640 px de alto y mide todo el modelo, no el sujeto del paso. |

Lo que sí funciona y hay que conservar: el mapa de arcos en 3D con su tabla sincronizada (`arkuen-mapa`), el recuadro 2D sincronizado del paladar (`aho-sabai-gandorrak`) y la piel continua de la cara.

Por comprobar: `lehen-arkua-kartilagoak` a 0,5 se quedó en "3D eredua prestatzen…" durante toda la espera de la hoja (a 0,95 sí se dibujó, con 3,6 % de cobertura). El servidor estaba cargado por dos sesiones, así que no está confirmado como fallo; repetir con la máquina tranquila. Dos capturas de pantalla completa salieron vacías porque mi script esperó poco: no cuentan como evidencia.

## 3. El estándar v3

Cada regla lleva cómo se comprueba. Las de recuento van a un test (`tests/standard-v3.test.ts`, ver §4).

### A. Aprender más rápido

- **A1. La idea primero.** Cada etapa tiene al menos un "ulertzeko gakoa": la frase que hace que el resto encaje. *Recuento: etapas sin `key`.*
- **A2. Un paso = un acontecimiento = una idea.** En cada paso algo crece, se mueve, se fusiona, se abre o se ilumina. Un paso de solo cámara o solo nombres se funde con su vecino o se convierte en `tour` (partes iluminadas una a una). *Recuento: pasos sin cambio de pose ni de luz.*
- **A3. Un solo texto a la vez.** La nota al pie es la conclusión del paso en palabras de los apuntes, máximo 80 caracteres; no repite ni el pie de figura ni la narración. *Recuento.*
- **A4. Nombres en el orden en que se dicen, como mucho 4 nuevos por paso.** Más de 4: dos pasos o un `tour`. No se quita ningún nombre. *Recuento.*
- **A5. La vista se explica sola en 3 segundos.** Una vista rara (desde atrás sin techo, desde abajo, un corte) se **construye en pantalla** la primera vez: se parte del conjunto reconocible y el techo se levanta, el bloque sale, la mitad se aparta. Nunca solo un pie que diga "sabaia kenduta". *Tira de vuelo: fotograma 1 reconocible.*
- **A6. Cada etapa pregunta.** Una comprobación por etapa sobre su dato más difícil. Si el resultado es contraintuitivo (la paratiroides inferior sale de la bolsa superior), la pregunta va **antes** de mostrarlo: predecir y luego ver. *Recuento: etapas sin `ask`.*
- **A7. El movimiento deja rastro.** Cuando algo viaja, al final del paso se ve de dónde vino: fantasma tenue en el origen y la ruta con punto de inicio, en su color; desaparecen en el paso siguiente. Sin anillos ni cajas. *Prueba del fotograma parado: sin texto, se entiende qué acaba de pasar.*
- **A8. Lo pequeño tiene su plano.** Si el sujeto del paso ocupa menos del 45 % del lado corto del marco, el paso lo encuadra solo (`fit`, `half`) o lleva un recuadro de detalle sincronizado. *Hoja de etapas, medido sobre el sujeto iluminado.*
- **A9. Cada sección cierra con su mapa.** Tras cada correspondencia (bolsa → derivado, arco → nervio/hueso/músculo, parte de la lengua → nervio), el último paso enciende todo junto con su tabla al lado, rellenada en sincronía. Ya era regla para el final del tema; pasa a cada sección.

### B. Más impresionante y pulido

- **B1. El sujeto manda en el marco.** Medido en la imagen WebGL al final de cada paso: la caja del sujeto ocupa al menos el 55 % del lado limitante de la zona libre, nada nombrado queda cortado y nada de la interfaz lo tapa. `fit: false` se permite solo si la hoja lo demuestra. *Recuento de `fit: false` + hoja.*
- **B2. Marco limpio.** Sobre la imagen solo hay nombres, una línea al pie y la clave. El pie de figura se muestra 3 s y se retira (la cabecera ya dice la vista); la clave de ejes se reduce al gizmo; la clave de color lleva solo los colores presentes, máximo 4, sobre placa y nunca encima del sujeto; la tarjeta "Non gaude?" se pliega tras el primer paso. *Recuento de claves > 4 + hoja.*
- **B3. Tejido, no juguetes.** Ninguna estructura con nombre es una esfera, una cápsula o una calcomanía plana. Cada órgano tiene silueta propia (asimetría, lóbulos, pedículo), nace de su origen con ensanche, tiene relieve a la escala de la cámara y grosor donde está cortado. *Prueba sin etiquetas: quien ha estudiado la figura de los apuntes la reconoce.*
- **B4. Profundidad que se nota.** Lo iluminado se apoya en algo: sombra de contacto y sombra suave sobre el fondo, contexto lejano algo más apagado, contorno fino en lo iluminado y ninguno en el suelo. (Requiere trabajo de kit, §5.)
- **B5. Disciplina de color.** Máximo 4 colores de código en pantalla; la saturación es solo para lo iluminado; al terminar un proceso ("ez da josturarik geratzen") los colores vuelven al tono natural en ese mismo paso.
- **B6. Un fotograma de cartel por etapa.** El final del paso clave se compone como póster (tres cuartos, sujeto grande, resultado legible sin movimiento). Es la miniatura, la lámina y el clip del reel. *Hoja a 0,97 revisada como serie de carteles.*
- **B7. Ritmo del movimiento.** La cámara llega antes de que empiece el cambio (primer cuarto del paso), el cambio ocurre en el tramo central, los nombres después, y el último 10 % es pausa de lectura. Todo con aceleración suave; una sola cosa se mueve a la vez.

## 4. Cómo se hace cumplir

1. **Test de recuento** `tests/standard-v3.test.ts`: lee el `spec` de cada etapa y cuenta A1–A4, A6, B1, B2 y sitio/`arrive`. La deuda de 17 y 18 queda fijada y solo puede bajar; el 19 se informa sin fijar mientras siga `inPreparation`; del 20 en adelante, deuda cero desde el primer día. (Escrito en esta sesión y retirado sin ejecutar por falta de tiempo; es el paso 1 del plan.)
2. **Hoja de etapas**: marco completo en vez de 640 px, cobertura medida sobre el sujeto iluminado, umbrales de B1 y A8.
3. **Tres pruebas a ojo** sobre las hojas: 3 segundos (A5), fotograma parado (A7), sin etiquetas (B3).
4. Cada `topic-NN-todo.md` añade una sección "Estándar v3: qué le falta" con sus números.

## 5. Plan

| Paso | Qué | Dónde | Hecho cuando |
|---|---|---|---|
| 1 | Test de recuento con la deuda de 17 y 18 fijada | `tests/standard-v3.test.ts` | Pasa en verde y lista la deuda por etapa |
| 2 | Hoja de etapas v3 (marco completo, sujeto iluminado, umbrales) | `scripts/quality/stage-sheet.mjs` | Informe con % de pasos que cumplen B1 y A8 |
| 3 | Kit, marco limpio (B2): pie temporal, clave con placa y solo colores presentes, tarjeta plegable | `components/kit`, opt-in por `look` para no tocar 7–16 | Capturas antes/después de 3 etapas |
| 4 | Kit, rastro (A7): fantasma + ruta por paso | `Step.trace` en `week14/common.tsx` | Visible en un descenso |
| 5 | Kit, look v3 (B4): sombra suave, atenuación de fondo, contorno fino; con interruptor y dentro del presupuesto de `perf-guard` | `components/kit/three/gl.ts` | A/B en 3 etapas, fps sin cambio |
| 6 | **Piloto**: una sección entera al v3. Propuesta: bolsas y descenso de glándulas del 18 (etapas 3–9, un solo modelo) | `week18/pharynx-*.ts`, `Pharynx18.tsx`, `Ear18.tsx`, `Clefts18.tsx`, `Neck18.tsx`, `week18a/g/h/i.ts` | Deuda cero en esas 7 etapas, hojas a 1440 y tablet, visto por el dueño |
| 7 | Tras el visto bueno: resto del 18, luego 17 (lo peor primero: `arkuaren-osagaiak`, cabeza de músculos, lengua, dientes, paladar) | — | Deuda del test a cero |
| 8 | Tema 19 al v3 antes de quitar `inPreparation`; plantilla de brief v3 para el 20 en adelante | `docs/handover` | — |

Pasos 1–2 no tocan nada que se vea. Pasos 3–5 son del kit compartido: esperar a que la otra sesión (tema 19, `components/shell`) termine o coordinar, porque hoy está editando esos ficheros.

## 6. Estado de esta sesión

- Hecho: lectura del estándar y de los pendientes de 17–18, recuentos por tema, 28 capturas de 14 etapas, este documento.
- No hecho: ningún cambio en escenas, contenido ni kit; el test de recuento no se ha ejecutado; no hay capturas válidas de tablet ni de vuelos entre etapas en esta sesión.
