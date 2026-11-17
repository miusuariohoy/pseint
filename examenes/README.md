# Exámenes de PSeInt · Evaluación, recuperatorio y por partes

Cuatro instancias con el **mismo temario**, pero con **consignas distintas**. Las
actividades Cambian de contexto (temperatura, notas, estaturas, jornadas, gastos,
múltiplos…), no de tema. Ninguna pregunta o programa se repite entre instancias.

| Instancia | Consignas | Puntaje | Clave | Identificador |
| --- | --- | --- | --- | --- |
| Evaluación completa | 12 (5 MC + 4 salidas + 3 programas) | 10 | `pseint` | `pseint-eval-2026` |
| Recuperatorio | 12 (5 MC + 4 salidas + 3 programas) | 10 | `pseint-recu` | `pseint-recu-2026` |
| Primera parte · Temas 1 a 6 | 12 (5 MC + 4 salidas + 3 programas) | 10 | `pseint` | `pseint-parte-1` |
| Segunda parte · Temas 7 a 9 | 11 (6 MC + 2 salidas + 3 programas) | 10 | `pseint` | `pseint-parte-2` |

La corrección es automática, muestra explicaciones y guarda el resultado en el
informe del docente. La evaluación completa y el recuperatorio usan `app.js`; las
dos partes usan `app-parte.js`, que calcula el puntaje según las consignas
realmente presentes.

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Portal con enlaces a las cuatro instancias. La clave docente no está enlazada. |
| `evaluacion.html` | Evaluación completa. |
| `recuperatorio.html` | Recuperatorio completo. |
| `parte-1.html` | Evaluación de los temas 1 a 6. |
| `parte-2.html` | Evaluación de los temas 7 a 9. |
| `config-evaluacion.js` | Identificador, clave y requisitos de la Parte C de la evaluación. |
| `config-recuperatorio.js` | Identificador, clave y requisitos de la Parte C del recuperatorio. |
| `config-parte-1.js` | Identificador, clave y requisitos de la Parte C de la primera parte. |
| `config-parte-2.js` | Identificador, clave y requisitos de la Parte C de la segunda parte. |
| `clave-docente.html` | Respuestas, soluciones, rúbrica y errores frecuentes de las cuatro instancias. |
| `config.js` | Configuración general y canal de envío de resultados (`ntfy`). |
| `app.js` | Motor de acceso, corrección, envío y comprobante de_evaluación_y_recuperatorio. |
| `app-parte.js` | Motor de acceso, corrección y envío de las evaluaciones por parte. |
| `examenes.css` | Estilos propios del portal y de las páginas nuevas. |
| `styles.css` | Estética general compartida. |

La carpeta es **autocontenida**: no depende de archivos de otro repositorio, así que puede publicarse sola.

## Publicación

La carpeta se publica junto con la guía de PSeInt en GitHub Pages:

```text
https://miusuariohoy.github.io/pseint/examenes/
```

Desde el portal se llega a las cuatro instancias. El material docente queda en
`clave-docente.html`, pero **no está enlazado desde el portal**. El docente lo abre
con la URL directa:

```text
https://miusuariohoy.github.io/pseint/examenes/clave-docente.html
```

Ese archivo contiene las respuestas y las soluciones. Si el sitio es público, no lo
enlaces ni lo difundas antes de rendir.

## Cambiar las claves

Editá estas líneas:

```js
// config-evaluacion.js
window.CONFIG.CLAVE_ACCESO = 'pseint';

// config-recuperatorio.js
window.CONFIG.CLAVE_ACCESO = 'pseint-recu';

// config-parte-1.js y config-parte-2.js
window.CONFIG.CLAVE_ACCESO = 'pseint';
```

La clave es una barrera blanda: se valida en el navegador. No uses contraseñas
reales ni datos sensibles.

## Cambiar preguntas y actividades

- **Parte A:** cada `<article class="pregunta mc" data-correcta="a">` tiene la opción correcta en `data-correcta` (`a`, `b`, `c` o `d`). Las opciones se marcan con `data-op`.
- **Parte B:** cada `<article class="pregunta salida" data-aceptadas="...">` acepta una o varias respuestas separadas por `|`. El corrector normaliza mayúsculas, acentos, comas y espacios.
- **Parte C:** cada actividad tiene un `textarea` con `id` (`c1`, `c2`, `c3`) y un contenedor `res-c1`, etc. Los requisitos se definen en `window.CONFIG.EJERCICIOS` dentro del `config-*.js` correspondiente.

Cada requisito es un objeto:

```js
{ d: 'Texto que ve el alumno', f: function (codigo) { return /patron/.test(codigo); } }
```

El código se recibe en minúsculas. La nota de la actividad es proporcional a la
cantidad de requisitos cumplidos.

Si cambiás una actividad, actualizá también:

1. El requisito en el `config-*.js`.
2. La solución de referencia dentro de `<details class="solucion">` en el HTML.
3. El mapa de temas y los ejemplos de la tabla de criterios del mismo HTML.
4. La descripción de esa instancia en `index.html`.
5. La clave y la solución en `clave-docente.html`.

## Importante sobre la corrección

El corrector revisa la **estructura** del pseudocódigo con expresiones regulares.
**No ejecuta** el programa. Por eso:

- Se controlan declaraciones, estructuras, contadores, acumuladores y llamadas.
- Una solución alternativa válida puede no coincidir exactamente con los patrones; en ese caso, el docente puede revisar el código manualmente.
- Las soluciones de referencia se muestran después de corregir, no antes.

## Resultados

Las páginas cargan `config.js`, que ya tiene configurado el envío cifrado a `ntfy`
y el canal del informe. Cada envío incluye el identificador de la instancia
(`pseint-eval-2026`, `pseint-recu-2026`, `pseint-parte-1` o `pseint-parte-2`), así
que el informe del docente puede separarlas.

Si no querés enviar resultados, cambiá en `config.js`:

```js
MODO_ENVIO: 'ninguno'
```

En ese caso, el alumno puede descargar el comprobante en JSON desde la pantalla de resultado.

## Reiniciar una prueba

Para probar varias veces en la misma computadora:

1. En la pantalla de resultado, usá **Hacer otra evaluación**.
2. O borrá las claves de `localStorage` desde la consola del navegador:

```js
localStorage.removeItem('eval_pseint-eval-2026_enviada_v1');
localStorage.removeItem('eval_pseint-recu-2026_enviada_v1');
localStorage.removeItem('eval_pseint-parte-1_enviada_v1');
localStorage.removeItem('eval_pseint-parte-2_enviada_v1');
```

También podés borrar `sessionStorage` para volver a pedir la clave:

```js
sessionStorage.clear();
```

## Verificación rápida

- Abrir `index.html` y comprobar los cuatro enlaces.
- Entrar a cada evaluación con su clave; una clave incorrecta debe ser rechazada.
- Responder todo bien y corregir: debe dar 10/10 en las cuatro instancias.
- Dejar una actividad de código vacía: debe descontar 1 punto.
- Comparar las cuatro instancias: no deben repetirse enunciados ni soluciones.
- Revisar la consola del navegador: no debe haber errores de JavaScript.

## Temario común

1. Algoritmos y programación estructurada.
2. Variables y tipos de datos.
3. Leer / Escribir.
4. Condicionales.
5. Mientras.
6. Para.
7. Contador.
8. Acumulador.
9. Subprocesos.

La evaluación completa y el recuperatorio cubren los 9 temas. La primera parte
trabaja los temas 1 a 6 y la segunda, los temas 7 a 9.
