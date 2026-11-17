/* ============================================================
   EVALUACIÓN · PRIMERA PARTE · TEMAS 1 A 6
   ------------------------------------------------------------
   Temas: programación estructurada, variables y tipos,
   Leer/Escribir, condicionales, contador y acumulador.
   Se carga después de config.js y antes de app-parte.js.
   ============================================================ */

window.CONFIG = window.CONFIG || {};

window.CONFIG.EXAMEN = {
    id: 'pseint-parte-1',
    titulo: 'Evaluación · Primera parte · Temas 1 a 6',
    materia: 'Programación'
};

/* Clave de acceso de la evaluación. */
window.CONFIG.CLAVE_ACCESO = 'pseint';

(function () {
    'use strict';

    /* ---------- Helpers de revisión estructural ---------- */

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

    function cierraAlgoritmo(codigo) {
        return /\b(algoritmo|proceso)\s+\w+/.test(codigo) &&
               /\b(finalgoritmo|finproceso)\b/.test(codigo);
    }

    function cuenta(codigo, re) {
        return (codigo.match(re) || []).length;
    }

    /* ---------- Requisitos de la Parte C ---------- */

    window.CONFIG.EJERCICIOS = {

        /* Actividad 1 · Variables + Leer + condicional. */
        c1: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara horas como Entero', f: function (c) { return declaracion(c, 'horas', 'entero'); } },
            { d: 'Lee las horas', f: function (c) { return /\bleer\s+horas\b/.test(c); } },
            { d: 'Usa Si ... Entonces ... Sino ... FinSi', f: function (c) { return usaSiCompleto(c); } },
            { d: 'Compara las horas con 40', f: function (c) {
                return /horas\s*>=\s*40/.test(c) || /horas\s*>\s*39/.test(c) || /40\s*<=\s*horas/.test(c);
            } },
            { d: 'Muestra los mensajes "Completo" y "Parcial"', f: function (c) {
                return /completo/i.test(c) && /parcial/i.test(c) && /escribir/.test(c);
            } }
        ],

        /* Actividad 2 · Contador sin bucles. */
        c2: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara e1, e2, e3 y adultos como Entero', f: function (c) {
                return ['e1', 'e2', 'e3', 'adultos'].every(function (n) {
                    return declaracion(c, n, 'entero');
                });
            } },
            { d: 'Inicializa adultos en 0', f: function (c) { return /\badultos\s*<-\s*0\b/.test(c); } },
            { d: 'Asigna las tres edades: 17, 20 y 15', f: function (c) {
                return /\be1\s*<-\s*17\b/.test(c) &&
                       /\be2\s*<-\s*20\b/.test(c) &&
                       /\be3\s*<-\s*15\b/.test(c);
            } },
            { d: 'Usa tres bloques Si ... FinSi', f: function (c) {
                return cuenta(c, /\bsi\b/g) >= 3 && cuenta(c, /\bfinsi\b/g) >= 3;
            } },
            { d: 'Cada Si compara una edad con 18 (mayor o igual)', f: function (c) {
                return cuenta(c, /si\s+[^\n]*e[123]\s*>=\s*18/g) >= 3 ||
                       cuenta(c, /si\s+[^\n]*e[123]\s*>\s*17\b/g) >= 3 ||
                       cuenta(c, /si\s+[^\n]*18\s*<=\s*e[123]/g) >= 3;
            } },
            { d: 'Incrementa adultos tres veces', f: function (c) {
                return cuenta(c, /adultos\s*<-\s*adultos\s*\+\s*1/g) >= 3;
            } },
            { d: 'Muestra el total con Escribir adultos', f: function (c) {
                return /escribir[^;\n]*\badultos\b/.test(c);
            } }
        ],

        /* Actividad 3 · Acumulador sin bucles. */
        c3: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara g1, g2, g3 y total como Real', f: function (c) {
                return ['g1', 'g2', 'g3', 'total'].every(function (n) {
                    return declaracion(c, n, 'real');
                });
            } },
            { d: 'Inicializa total en 0', f: function (c) { return /\btotal\s*<-\s*0\b/.test(c); } },
            { d: 'Asigna los tres gastos: 12.5, 7.5 y 20', f: function (c) {
                return /\bg1\s*<-\s*12[.,]5\b/.test(c) &&
                       /\bg2\s*<-\s*7[.,]5\b/.test(c) &&
                       /\bg3\s*<-\s*20\b/.test(c);
            } },
            { d: 'Acumula g1 en total', f: function (c) {
                return /\btotal\s*<-\s*total\s*\+\s*g1\b/.test(c);
            } },
            { d: 'Acumula g2 en total', f: function (c) {
                return /\btotal\s*<-\s*total\s*\+\s*g2\b/.test(c);
            } },
            { d: 'Acumula g3 en total', f: function (c) {
                return /\btotal\s*<-\s*total\s*\+\s*g3\b/.test(c);
            } },
            { d: 'Muestra el total con Escribir', f: function (c) {
                return /escribir[^;\n]*\btotal\b/.test(c);
            } }
        ]
    };
})();
