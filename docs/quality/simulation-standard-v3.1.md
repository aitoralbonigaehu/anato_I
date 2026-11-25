# Propuesta de estándar de simulación v3.1

**24 de noviembre de 2026 · Para revisión del equipo docente y de simulación**

**Pilotos locales · 24 de noviembre de 2026.** El descenso glandular del tema 18 ya está implementado en la aplicación local. Las paratiroides siguen curvas continuas por longitud de arco, con perfiles ovoides, y el timo acompaña a las paratiroides de la tercera bolsa antes de separarse de ellas con un movimiento simétrico en ambos lados. Los controles *Hasiera*, *Bereizketa* y *Amaiera* permiten comparar los tres momentos con el mismo encuadre posterior. En CPU, las tres poses conservan el recuento de referencia: 113 elementos y 76 304 triángulos en t = 0,25, y 116 elementos y 78 152 triángulos en t = 0,59 y 0,79. [Escena del descenso](../../components/scenes/week18/Neck18.tsx) · [Pruebas de cinemática](../../tests/gland-descent18.test.ts)

En el tema 17 se puede abrir un corte anterior o posterior de la hemimandíbula y seguir, en el mismo instante, el cartílago de Meckel y el hueso que se forma en el mesénquima vecino. El plano marcado en el conjunto y la sección comparten coordenadas. Durante la osificación, una línea señala el borde de crecimiento activo. Los tejidos presentes se pueden seleccionar y la comparación vuelve al mismo corte al avanzar o retroceder. El mesénquima es un fondo esquemático. [Escena del primer arco](../../components/scenes/week17/Bones17.tsx) · [Visor del corte](../../components/scenes/week17/MeckelSectionViewer.tsx) · [Pruebas geométricas](../../tests/meckel-section17.test.ts)

Una alumna lee que la mandíbula se forma en el mesénquima que rodea al cartílago de Meckel. Abre esa parte de la frase y ve crecer un borde de hueso **al lado** del cartílago. Puede alternar dos momentos sin que cambie el encuadre, señalar de qué tejido procede el hueso y volver a la palabra que estaba leyendo. Si la imagen parece mostrar que el cartílago se endurece y se convierte en mandíbula, el paso necesita otra composición, aunque estén presentes todos los nombres correctos.

**Propuesta.** Conservar las dieciséis reglas de v3 y añadir cuatro criterios para que el alumno pueda observar, reconstruir y explicar las relaciones de los apuntes. Empezar con dos frases difíciles de los temas 17 y 18. La [dirección técnica de 3D y animación](#dirección-técnica-de-3d-y-animación) desarrolla dos entregas: el descenso glandular continuo y un corte explorable de la mandíbula. La v3 completa figura al final, con la fecha y el estado de su auditoría original.

## Qué cambia para quien estudia

El lector actual ya ilumina frases, sigue el paso y permite saltar desde una oración a la simulación. Una misma oración puede tener varios destinos. El lector da preferencia al paso activo o a uno de la misma etapa. Las preguntas de los dos ejemplos ya explican algunos errores concretos y el simulador ofrece repetir y volver. V3 ya pide predecir, dejar rastro, cerrar con un mapa y cuidar encuadre, tejido, luz y ritmo. V3.1 concreta **qué debe poder distinguir el alumno** con esos recursos. [Lector de apuntes](../../components/shell/NotesPanel.tsx) · [Reproducción y respuestas](../../components/shell/Player.tsx) · [Estándar v3](simulation-standard-v3.md)

| Criterio propuesto | Qué hace el equipo | Cómo se acepta |
|---|---|---|
| **C1. Cada afirmación encuentra su evidencia** | En una frase compuesta, se identifica qué hace cada tejido, respecto a qué estructura y en qué instante se aprecia. Si el texto define un nombre, basta la figura señalada. Una enumeración puede apuntar a una fila del mapa. El contexto histórico o terminológico se conserva como texto. | El revisor recorre **todas las afirmaciones del pasaje piloto** y abre cada una desde los apuntes. Puede señalar dónde se ve, leer su definición o reconocer la información que solo aporta el texto. Una relación pendiente de representar queda registrada para corregirla. |
| **C2. Se puede comparar sin perder la referencia** | Para el cambio difícil se eligen dos poses y, si el mecanismo lo requiere, una intermedia. Durante la comparación se mantienen proyección, escala, iluminación y un hito anatómico visible. El alumno alterna los estados a su ritmo. | Con la cámara quieta, explica qué cambió y respecto a qué. La silueta y el relieve de los tejidos siguen siendo legibles en tonos neutros. En vista estrecha los estados se alternan en el mismo espacio. |
| **C3. El error devuelve al instante que lo explica** | Una respuesta que revela una confusión concreta ofrece volver a mirar el detalle decisivo. Se conserva la elección inicial y después se ofrece una tarea breve en otra vista. | En el nuevo encuadre, con leyenda y nombres de respuesta ocultos, el alumno identifica las estructuras y explica la relación. Se puede distinguir una identificación acertada de una explicación acertada. |
| **C4. El alumno conserva el punto de lectura** | La explicación se abre desde el fragmento elegido. Al volver se restituyen frase, posición de lectura y foco. Los mandos de comparación aparecen solo mientras se usan. | Recorrido completo con toque y con teclado, incluido el regreso. Con movimiento reducido o sin WebGL, las poses ordenadas y su descripción permiten hacer la misma comparación. El texto accesible describe lo observable y preserva la pregunta. |

## Dos escenas listas para diseñar

### Tema 17 · ¿Qué tejido forma la mandíbula?

La oración `w17/2.2.1/p3/s2` reúne huesecillos, regresión del cartílago y osificación del tejido vecino. En `lehen-arkua-kartilagoak`, esa misma referencia aparece en los pasos 2, 4 y 6. El paso 3 explica la regresión citando oraciones contiguas. En el paso 6 actual cambian la cámara y los nombres. Mostrar la continuidad entre el extremo y los huesecillos es trabajo del piloto. Si se toma toda la frase como destino único, el alumno puede llegar a la mandíbula ya formada cuando buscaba su origen. [Frase original](../../content/notes-text/w17.ts) · [Pasos y pregunta](../../content/weeks/week17d.ts) · [Poses](../../components/scenes/week17/Bones17.tsx) · [Clip actual de la escena](../../public/reel/17-lehen-arkua-kartilagoak.mp4)

| Fragmento de la frase | Destino del piloto | Qué debe verse |
|---|---|---|
| «inguruko mesenkima hezurtzen baita» | Paso 2, `SB1[1]` | Un perfil de cartílago continuo y el frente óseo que aparece en el mesénquima vecino. Luz lateral suave y una pequeña sombra de contacto dibujan el límite. La escala de la comparación permanece fija para que pueda seguirse la separación entre ambos perfiles. |
| «kartilagoaren gainerako zatia desagertzen den» | Paso 3, `SB1[2]` | Al alternar las poses, retrocede la parte correspondiente del cartílago y persiste el perfil mandibular. Se sigue la identidad de cada tejido durante todo el cambio. |
| «kartilagoaren goiko muturretik» | Paso 6, `SB1[5]` | El detalle arranca con el extremo superior aún reconocible y termina con el martillo y el yunque según los apuntes. Una referencia del cráneo mantiene orientado el detalle. |

**Prueba del alumno.** Si elige «Hezurtu eta baraila bihurtzen da», la opción *Berriz ikusi* reabre la transición entre los pasos 2 y 3. Se congela el momento en el que todavía se ven el cartílago y el tejido que se osifica. La consigna es «Seinalatu hezurtzen ari den ehuna». Para la transferencia se usa un corte algo oblicuo, en tonos neutros, que conserve visibles los dos tejidos. El alumno señala el tejido que forma la mandíbula y, después, el extremo del cartílago del que proceden los dos huesecillos. Debe poder explicar ambos orígenes con sus palabras. Si los tejidos se confunden al quitar el naranja, se revisan geometría y luz antes de añadir etiquetas.

### Tema 18 · ¿Cómo puede terminar abajo la paratiroides que empieza arriba?

En `w18/1.2/p6/s3`, «harekin desplazatzen da» y «goiko paratiroide guruina gutxi desplazatzen da» describen dos movimientos de distinta magnitud. La etapa `guruinen-jaisketa` ya contiene origen, descenso, resultado y pregunta sobre la bolsa de origen. Su subtítulo, introducción, nombres y leyenda pueden revelar la respuesta antes del intento. En la predicción de v3 A6 el alumno ve las bolsas y su posición inicial. Se reserva el texto que resuelve el ejercicio hasta su respuesta o hasta que elija ver la explicación. [Frase original](../../content/notes-text/w18.ts) · [Etapa y respuestas](../../content/weeks/week18i.ts) · [Poses de descenso](../../components/scenes/week18/Neck18.tsx)

| Estado seleccionable | Composición y lectura esperada |
|---|---|
| **Hasiera** · paso 1, `SD[0]` | Vista posterior de un lado, con las bolsas 3.ª y 4.ª y el eje craneocaudal. La faringe proporciona una referencia de encuadre. El alumno identifica cuál de los dos primordios comienza más arriba. |
| **Tarteko unea** · paso 2, `SD[1]` | Misma cámara. Se aprecia qué primordio acompaña al timo y cuál se desplaza menos. Cada estructura conserva su profundidad y silueta. El cuello puede crecer dentro del encuadre. |
| **Amaiera** · paso 3, `SD[2]` | Se comparan ambas alturas en el mismo lado, ahora junto al tiroides. El cambio de orden vertical se lee sin dibujar trayectorias que se corten en el espacio ni un punto de fusión. |

**Prueba del alumno.** Ante «4. poltsatik», el botón *Berriz ikusi* recupera la elección y alterna origen y destino con el estado intermedio disponible. En la tarea siguiente el alumno parte de una vista posterior oblicua del tiroides, con las localizaciones superior e inferior distinguibles en tonos neutros. Señala el destino de la estructura que acompañó al timo, elige su bolsa de origen y explica por qué quedó más abajo. La clave, subtítulo, etiquetas y descripción accesible de la lámina de prueba se revisan juntos para que ninguno anticipe la respuesta. *Apunteetara itzuli* devuelve al fragmento del que partió.

## Dirección técnica de 3D y animación

**Primera entrega propuesta.** Un clip interactivo del descenso glandular, desde la vista posterior hasta la inversión de alturas. Se reproduce, se detiene en el instante de separación y se recorre hacia atrás con la misma precisión. El segundo hito será el corte explorable de Meckel. Los dos obligan a resolver problemas gráficos diferentes: la continuidad de un movimiento y la lectura del volumen que cambia.

### 1. Diagnóstico previo a la implementación del piloto

En el tema 18, `para3At` y `para4At` redondean al índice de un camino de 40 y 30 puntos respectivamente. Con las demás variables fijas, 301 valores equidistantes del descenso dan 40 y 30 índices distintos. Esto identifica una cuantización espacial en el modelo; su efecto en pantalla depende del encuadre y del tiempo de reproducción. El timo ya cambia la posición de su cabeza, eje y cola. Su cabeza acompaña a la paratiroides hasta `descend = 0.72` y después sigue otro tramo. Hay una comprobación bilateral concreta. La coordenada lateral del destino de la cabeza recibe dos veces el signo del lado. Al evaluar `descend = 1` y `meet = 1`, ambas cabezas terminan en x = +0,34 unidades de escena, mientras las colas conservan signos opuestos. Es un resultado de la fórmula. Antes de suavizar la curva, acordar con el docente si la convergencia final conserva dos destinos simétricos o alcanza el plano medio y fijar ese resultado en una prueba de ambos lados. En el tema 17 la mandíbula ya es una malla esculpida que se revela mediante recorte con espículas. El cartílago tiene geometría independiente y su eje se acorta durante la regresión. [Modelo faríngeo](../../components/scenes/week18/pharynx-model.ts) · [Modelo óseo](../../components/scenes/week17/bones-model.ts)

Recuento realizado en CPU sobre tres poses de la etapa actual. Se evaluó `poseAt(GlandDescent18.spec, t)`, se construyeron los elementos con `pharynxD(pose, opts)` y se sumó `mesh.idx.length / 3` para cada instancia.

| Tiempo normalizado de etapa | Elementos Item3 | Triángulos por índices |
|---|---:|---:|
| 0,25 | 113 | 76 304 |
| 0,59 | 116 | 78 152 |
| 0,79 | 116 | 78 152 |

El recuento incluye geometría aunque quede oculta. Visibilidad efectiva, llamadas de dibujo, FPS y coste GPU requieren mediciones independientes. El control de presupuesto geométrico de `perf-guard` cubre su lista de escenas de los temas 15 y 16. Si se aplicara el límite de 75 000 triángulos de esa prueba, la primera pose lo excedería en 1 304 y las otras dos en 3 152 cada una. Mantener el control de 15/16 intacto, registrar las escenas piloto de 17/18 como referencias independientes y fijar su presupuesto tras medirlas en tableta física. El renderizador Three/WebGL ya tiene sombreado propio de tejidos, trasluz en los bordes, oclusión ambiental opcional, selección de estructuras y proyección plana. Se mantienen sus topes nominales de presentación a 30 Hz y de dos millones de píxeles por búfer de imagen. [Renderizador](../../components/kit/three/gl.ts) · [Vista y selección](../../components/kit/three/Stage3D.tsx) · [Presupuesto de geometría](../../tests/perf-guard.test.ts) · [Política de renderizado](../../lib/three-d/render-policy.ts)

### 2. Tema 18 · Animar el acompañamiento y la separación

El artista aprueba primero tres siluetas por estructura: en el conjunto faríngeo se identifica el origen, en la vista de cuello se distinguen las dos alturas y en el detalle se reconoce el borde de cada glándula junto al tejido vecino. Para cada pose clave se dibujan el eje largo, el punto de proximidad y el perfil que mira a cámara. Rotación, espesor y deformación se animan cuando explican una de esas lecturas. La luz de contacto debe conservar la separación visible al pasar de la silueta del timo a la paratiroides.

El ingeniero muestrea una curva continua por **longitud de arco**. Una tabla precalculada convierte distancia recorrida en parámetro de curva e interpola dentro del tramo. Otra curva convierte el tiempo absoluto en distancia para graduar arranque, descenso y llegada. Durante el acompañamiento, la cabeza del timo y la glándula comparten una referencia local. En el desacople se empalman posición y velocidad de la cabeza, incluida la dirección tangente, respetando el desplazamiento posterior de cada estructura. Se calcula cada lado desde su marco anatómico y se compara con su pose contralateral reflejada cuando el modelo prescribe simetría.

**Plano de revisión.** Llegada al conjunto, pausa en los dos primordios, descenso con cámara inmóvil, separación y pausa final suficiente para alternar origen y destino. La cámara encuadra un hito faríngeo y el campo tiroideo durante toda la inversión. Probar muestras a ambos lados de `descend = 0.72` y reducir sucesivamente el intervalo: la discontinuidad de posición debe tender a cero y las derivadas temporales de la posición, calculadas justo antes y justo después del empalme, deben converger al mismo vector. Repetir la comprobación por separado en el lado izquierdo y en el derecho del modelo. Revisar el resultado también al retroceder, en ambos hemicuellos y a velocidad lenta. El cambio de altura relativa debe leerse con las dos trayectorias en su profundidad anatómica.

### 3. Tema 17 · Entrar en el espesor de la mandíbula en formación

Desde el conjunto se elige una estación sobre el eje de Meckel y se introduce un plano perpendicular a su tangente. La escena revela el cartílago, el mesénquima adyacente y el frente de osificación dentro de ese tejido. El frente avanza a través de la misma estación y adquiere espesor legible. El contorno, la normal de cada cara cortada y una luz lateral estable deben hacer reconocibles el límite del cartílago y el borde óseo, incluso en pausa y con materiales neutros. El docente valida qué espesor es esquemático y qué relación respalda la figura del curso. No se asignan dimensiones histológicas ni se añaden capas celulares sin fuente.

Para que el corte tenga una cara visible y seleccionable, precalcular en las estaciones aprobadas la intersección de cada tejido con el plano común. La malla mandibular base ya incluye el volumen adulto completo. Para cada pose hay que intersectar también el dominio visible que delimita `clip.grow` con sus espículas, o materializar en CPU el frente equivalente antes de cortar. La prueba de selección debe acertar en el hueso ya formado y devolver ausencia de hueso por delante del frente. Cerrar los contornos, conservar los huecos anatómicos y triangular la sección resultante con normales orientadas e identificador del tejido. La lámina y la selección usan esa misma superficie en la pose elegida. Como objetivo de aceptación a 1440 px de ancho y resolución interna fija, al reproyectar un hito del borde del corte en la vista general la distancia al punto correspondiente debe ser menor de dos píxeles de pantalla. Repetir al inicio, a mitad y al final de la osificación.

En escritorio, el plano marcado en la vista general alimenta el corte de detalle en el mismo instante. En móvil, *Osoa* y *Ebakidura* alternan una sola vista principal, conservando instante, estación y lado. Prueba de taller: congelar el frente a mitad de formación, señalar un mismo borde en las dos vistas y comprobar que el punto seleccionado sigue sobre ese borde al avanzar o retroceder. Antes de publicar se revisa también una incidencia oblicua, donde unos bordes sin espesor podrían desaparecer. [Escena del primer arco](../../components/scenes/week17/Bones17.tsx)

### 4. Cómo producir las mallas y las poses

- **Modelado.** Aprobar siluetas e hitos anatómicos antes de aumentar densidad. El artista entrega una fuente editable (por ejemplo, una escena de Blender), la malla base, sus poses objetivo y una hoja con unidades de escena, ejes, lateralidad, identificadores e hitos acordados. Convertir estos recursos fuera del navegador al formato de malla que ya consume el motor. Antes de integrarlos, verificar orientación y escala tras aplicar transformaciones, orden de los vértices en las poses compatibles, normales de superficie y siluetas superpuestas a las aprobadas en tres vistas. Para deformaciones continuas, partir de una malla de control y poses objetivo con correspondencia de vértices. Conservar los identificadores de estructura y derivar de la misma pose superficies visibles, volúmenes simplificados de selección, anclas y cortes. Un nivel de detalle inferior conserva el perfil, el contacto y los hitos que usa la pregunta. Cambiar de nivel en una pose quieta y volver a ella permite detectar desplazamientos y saltos de contorno.
- **Tiempo y memoria.** Extender la evaluación de pose existente. El tiempo absoluto determina geometría, cámara y sección. Cargar directamente el 60 %, avanzar hasta allí o volver desde el final debe reproducir los mismos hitos y la misma lámina plana. Precalcular longitudes, topología estática y poses de control. Si el perfil revela reconstrucciones costosas, usar el trabajador de geometría existente para los datos reutilizables y aprovechar `updateGeometry`, que reutiliza la geometría Three cuando coinciden los tamaños y enlaza las matrices inmutables de la nueva malla. Reservar una deformación en el sombreador para una segunda fase si el perfil lo justifica, con una representación equivalente en CPU para selección, oclusión y vista plana. [Actualización de geometría](../../components/kit/three/geometry.ts) · [Construcción fuera del hilo principal](../../lib/three-d/offthread.ts)
- **Unión real.** El paladar del tema 18 ya resuelve el cierre con una malla que comparte columnas y abre las caras por delante del frente. Es el siguiente reto tras los dos pilotos: en una sección fija, entregar imágenes antes del contacto, en el contacto y tras la unión. Se comprueba en la malla que hay dos bordes libres antes, continuidad de superficie después y ausencia de caras duplicadas o una hendidura residual. Una interpolación de poses con topología constante sirve para elevar las crestas; el cierre requiere conservar la conectividad que expone el modelo actual. [Modelo del paladar](../../components/scenes/week18/palate-model.ts)

### 5. Orden de producción y aceptación

1. **Aprobar el clip interactivo del 18.** Entregar una toma de la escena actual y otra del prototipo, con igual cámara, tamaño y recorrido temporal de comparación. El docente comprueba origen y destino con materiales de tejido y con materiales neutros, con oclusión ambiental activada y desactivada. Examinar también el vuelo de entrada a media trayectoria: ambos hitos deben quedar localizables al llegar y ninguna estructura cercana debe ocultar el acontecimiento. Validar las tres láminas estáticas y su selección por teclado.
2. **Perfilar antes de extender.** Ejecutar el mismo recorrido y secuencia de saltos en ordenador y tableta física, con igual resolución, navegador y condiciones de caché para cada par. Separar primera apertura de reproducción ya preparada. Registrar el percentil 95 del tiempo de trabajo activo en CPU (pose, geometría y envío de dibujo), junto al intervalo entre presentaciones. Este último incluye esperas del limitador de 30 Hz. Medir GPU por separado cuando exista temporización fiable. En pausa, verificar que cesan los dibujos después de estabilizarse la vista. Como criterio del piloto, corregir toda regresión reproducible que haga perder intervalos de presentación frente al control.
3. **Aprobar el corte del 17 y decidir la extensión.** Si aparece un límite de coste, reducir primero densidad de superficies lejanas, resolución de efectos o frecuencia de actualización de contexto estable. Repetir las pruebas de silueta, selección y contacto en la configuración reducida. El corte y el descenso deben superar tanto la revisión visual como las pruebas de transferencia del apartado siguiente antes de extender esta producción al bloque de bolsas y, después, al paladar.

## Qué hace falta para probarlo

1. **Autoría.** Para cada relación difícil, completar una línea reutilizable: **frase y fragmento literal · relación · etapa y paso · poses y referencia anatómica · error probable · evidencia para corregirlo · tarea en otra vista**. Revisar primero si el modelo permite ver el mecanismo desde el ángulo elegido. Un enlace a una estructura acabada resulta insuficiente para enseñar de qué tejido procede.
2. **Navegación.** Aprovechar los identificadores de oración, las referencias `notes` y los pasos existentes. Solo las frases ambiguas requieren destinos por fragmento. Para cada destino se eligen poses dentro del paso después de ver el modelo renderizado. El comienzo del paso puede corresponder todavía al desplazamiento de la cámara. Conservar el retorno en la sesión de lectura y reutilizar el panel y los controles contextuales. [Lector](../../components/shell/NotesPanel.tsx) · [Simulador](../../components/shell/Simulator.tsx)
3. **Calidad visual y técnica.** Revisar ilustraciones a tamaño real en escritorio a 1440 px, tableta y móvil a 390 px. En tableta y móvil se debe poder alternar estados y volver sin arrastrar el modelo ni tapar la zona que se compara. Probar movimiento reducido y la alternativa plana con las mismas consignas. Dos o tres poses del modelo pueden servir de láminas si conservan el detalle y la orientación. Mantener el límite de 30 Hz y el renderizado solo cuando algo cambia. Comparar en el mismo dispositivo los tiempos de fotograma y las pausas antes y después, incluido el coste de abrir la comparación por primera vez. Una pose detenida debe dejar de solicitar repintados. [Criterios de rendimiento y continuidad](3d-quality-bar.md)
4. **Ensayo docente.** Probar primero estas dos frases. La versión de control debe ofrecer el mismo contenido y cumplir las reglas v3 aplicables, incluida la predicción antes de revelar el desenlace (A6). Verificarlo en el recorrido del alumno. Si solo está disponible la escena actual con deuda, identificarla como línea base actual y limitar la comparación a esa versión. Con ocho alumnos como piloto exploratorio, asignar cuatro a T17 con v3 y T18 con v3.1, y cuatro a la asignación inversa. Alternar el orden de presentación dentro de cada grupo. Usar el mismo tiempo de estudio por escena, idéntica consigna de transferencia y láminas de dificultad comparable en las dos versiones. Registrar en una hoja anónima dos puntos posibles por escena. En T17 se obtiene el primero al señalar el mesénquima vecino y el extremo superior de Meckel. El segundo, al explicar que el primero se osifica para formar la mandíbula y del segundo proceden el martillo y el yunque. En T18 el primer punto exige identificar la tercera bolsa y la posición inferior final. El segundo requiere explicar que el primordio acompaña al timo y desciende más que el procedente de la cuarta bolsa. Anotar los aciertos parciales sin otorgarles el punto completo, la necesidad de pista y si se pudo volver al texto sin ayuda. Las respuestas se puntúan antes de conocer la versión.
5. **Decisión.** Como umbral provisional para otra ronda, exigir en cada escena que al menos tres de sus cuatro usuarios de v3.1 localicen y expliquen el mecanismo sin pista, que la puntuación total de transferencia supere a la de v3 en al menos una escena y que se mantenga o mejore en la otra. Registrar cada pérdida de orientación y corregir cualquier bloqueo de acceso o retorno antes de ampliar. Si ambos grupos ya alcanzan el máximo, revisar la dificultad de la tarea. Ocho participantes sirven para decidir qué iterar; la generalización a otros temas requiere otra ronda con material nuevo.

Si el piloto supera el umbral y la revisión de acceso, completar primero el bloque de bolsas faríngeas y descenso del tema 18 que ya prioriza la v3. Dar comparación propia a las afirmaciones cuyo mecanismo se perdería en una sola imagen o cuyo aspecto final permite dos interpretaciones. Las correspondencias estables pueden compartir una fila del mapa y las definiciones breves, una figura o un texto. Después, otro autor aplicará la ficha a un pasaje nuevo y un revisor intentará reconstruir la relación siguiendo solo sus indicaciones. Así se probará si el método también funciona fuera de las escenas que inspiraron la propuesta.

Tras la implementación local de ambos pilotos, quedan pendientes la medición en tableta física, el ensayo de comprensión con alumnos y la integración completa del recorrido desde cada fragmento de los apuntes y de vuelta al punto de lectura. El apéndice conserva las mediciones y el plan fechados el 23 de noviembre.

---

## Apéndice · Texto íntegro de la v3 original

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
