/* ============================================================
   EVALUACIÓN · PSEINT · PROGRAMACIÓN ESTRUCTURADA
   ------------------------------------------------------------
   Se carga después de config.js y antes de app.js.
   Define el examen, la clave, el valor de cada actividad de la
   Parte C y los requisitos que se revisan en cada una.
   ============================================================ */

window.CONFIG = window.CONFIG || {};

window.CONFIG.EXAMEN = {
    id: 'pseint-eval-2026',
    titulo: 'Evaluación · PSeInt · Programación Estructurada',
    materia: 'Programación'
};

/* Clave de acceso de la evaluación. */
window.CONFIG.CLAVE_ACCESO = 'pseint';

/* Parte C: 3 actividades de 1 punto cada una (total 3). */
window.CONFIG.PUNTOS_EJERCICIO = 1;

(function () {
    'use strict';

    /* ---------- Helpers de revisión estructural ---------- */

    /* Acepta la variable dentro de un "Definir ... Como <tipo>", ya sea sola
       o junto con otras, y tolera un error de tipeo menor en el nombre
       (por ejemplo "menore" por "menores"). */
    function declaracion(codigo, nombre, tipo) {
        var re = new RegExp('definir([^;\\n]*)como\\s+' + tipo, 'g');
        var m;
        while ((m = re.exec(codigo)) !== null) {
            var nombres = m[1].split(',').map(function (s) {
                return s.replace(/[^a-z0-9_]/g, '');
            });
            for (var k = 0; k < nombres.length; k++) {
                var d = nombres[k];
                if (d === nombre) return true;
                if (nombre.length > 2 && Math.abs(d.length - nombre.length) <= 2 &&
                    (d.indexOf(nombre) === 0 || nombre.indexOf(d) === 0)) return true;
            }
        }
        return false;
    }

    function declaracionTexto(codigo, nombre) {
        return new RegExp('definir\\s+[^;\\n]*\\b' + nombre + '\\b[^;\\n]*como\\s+(caracter|cadena)').test(codigo);
    }

    function leeDos(codigo, a, b) {
        var lineas = codigo.match(/\bleer\b[^;\n]*/g) || [];
        var leeA = false;
        var leeB = false;
        lineas.forEach(function (linea) {
            if (new RegExp('\\b' + a + '\\b').test(linea)) leeA = true;
            if (new RegExp('\\b' + b + '\\b').test(linea)) leeB = true;
        });
        return leeA && leeB;
    }

    function usaSiCompleto(codigo) {
        return /\bsi\s+[^\n]*\bentonces\b/.test(codigo) &&
               /\bsino\b/.test(codigo) &&
               /\bfinsi\b/.test(codigo);
    }

    /* Algoritmo y Proceso son equivalentes en PSeInt. */
    function cierraAlgoritmo(codigo) {
        return /\b(algoritmo|proceso)\s+\w+/.test(codigo) &&
               /\b(finalgoritmo|finproceso)\b/.test(codigo);
    }

    /* Busca un Si con la condición indicada y un incremento +1 dentro del bloque. */
    function incrementaDentroDeSi(codigo, condicion) {
        var re = new RegExp(
            'si\\s+' + condicion +
            '[\\s\\S]*?\\b([a-z_][a-z0-9_]*)\\s*<-\\s*\\1\\s*\\+\\s*1' +
            '[\\s\\S]*?finsi'
        );
        return re.test(codigo);
    }

    /* Busca un incremento +1 dentro de la rama Sino. */
    function incrementaDentroDeSino(codigo, nombre) {
        var re = new RegExp(
            'sino[\\s\\S]*?\\b' + nombre + '\\s*<-\\s*' + nombre + '\\s*\\+\\s*1' +
            '[\\s\\S]*?finsi'
        );
        return re.test(codigo);
    }

    /* ---------- Requisitos de la Parte C ---------- */

    window.CONFIG.EJERCICIOS = {

        /* Actividad 1 · Variables + Leer + condicional. */
        c1: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara temperatura como Real', f: function (c) { return declaracion(c, 'temperatura', 'real'); } },
            { d: 'Lee la temperatura', f: function (c) { return /\bleer\s+temperatura\b/.test(c); } },
            { d: 'Usa Si ... Entonces ... Sino ... FinSi', f: function (c) { return usaSiCompleto(c); } },
            { d: 'Compara la temperatura con 30', f: function (c) {
                return /temperatura\s*>=\s*30/.test(c) || /temperatura\s*>\s*29/.test(c) ||
                       /30\s*<=\s*temperatura/.test(c);
            } },
            { d: 'Muestra los mensajes "Alta" y "Normal"', f: function (c) {
                return /alta/i.test(c) && /normal/i.test(c) && /escribir/.test(c);
            } }
        ],

        /* Actividad 2 · Mientras de 5 vueltas + contador y acumulador. */
        c2: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara nota, aprobadas, suma e i como Entero', f: function (c) {
                return ['nota', 'aprobadas', 'suma', 'i'].every(function (n) {
                    return declaracion(c, n, 'entero');
                });
            } },
            { d: 'Inicializa aprobadas y suma en 0', f: function (c) {
                return /\baprobadas\s*<-\s*0/.test(c) && /\bsuma\s*<-\s*0/.test(c);
            } },
            { d: 'Inicializa i en 1', f: function (c) { return /\bi\s*<-\s*1\b/.test(c); } },
            { d: 'Repite 5 vueltas con Mientras', f: function (c) {
                return /mientras\s*\(?\s*i\s*(?:<=\s*5|<\s*6)\s*\)?/.test(c);
            } },
            { d: 'Lee una nota dentro del Mientras', f: function (c) {
                return /mientras[\s\S]*?\bleer\s+nota\b[\s\S]*?\bfinmientras\b/.test(c);
            } },
            { d: 'Acumula todas las notas en suma', f: function (c) {
                return /\bsuma\s*<-\s*suma\s*\+\s*nota\b/.test(c);
            } },
            { d: 'Cuenta en aprobadas las notas mayores o iguales que 6', f: function (c) {
                var condicion = '(?:\\(?\\s*nota\\s*>=\\s*6\\s*\\)?|' +
                                '\\(?\\s*nota\\s*>\\s*5\\s*\\)?|' +
                                '\\(?\\s*6\\s*<=\\s*nota\\s*\\)?)';
                return incrementaDentroDeSi(c, condicion);
            } },
            { d: 'Incrementa i y cierra con FinMientras', f: function (c) {
                return /\bi\s*<-\s*i\s*\+\s*1\b/.test(c) && /finmientras/.test(c);
            } },
            { d: 'Muestra los totales de aprobadas y suma', f: function (c) {
                return /escribir[^;\n]*aprobadas/.test(c) && /escribir[^;\n]*suma/.test(c);
            } }
        ],

        /* Actividad 3 · SubProceso con parámetro y dos llamadas. */
        c3: [
            { d: 'Declara SubProceso MostrarCuadrado(numero)', f: function (c) {
                return /subproceso\s+mostrarcuadrado\s*\(\s*numero\s*\)/.test(c);
            } },
            { d: 'Cierra el subproceso con FinSubProceso', f: function (c) { return /finsubproceso/.test(c); } },
            { d: 'Muestra el cuadrado con el parámetro numero', f: function (c) {
                return /escribir[^\n]*\bnumero\b[^\n]*\*[^\n]*\bnumero\b/.test(c) ||
                       /escribir[^\n]*\bnumero\s*\^\s*2\b/.test(c);
            } },
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Llama a MostrarCuadrado(3) desde el algoritmo principal', f: function (c) {
                return /mostrarcuadrado\s*\(\s*3\s*\)/.test(c);
            } },
            { d: 'Llama a MostrarCuadrado(4) desde el algoritmo principal', f: function (c) {
                return /mostrarcuadrado\s*\(\s*4\s*\)/.test(c);
            } }
        ]
    };
})();
