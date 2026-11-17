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
            { d: 'Declara nombre como Caracter', f: function (c) { return declaracionTexto(c, 'nombre'); } },
            { d: 'Declara precio como Real', f: function (c) { return declaracion(c, 'precio', 'real'); } },
            { d: 'Lee el nombre y el precio', f: function (c) { return leeDos(c, 'nombre', 'precio'); } },
            { d: 'Usa Si ... Entonces ... Sino ... FinSi', f: function (c) { return usaSiCompleto(c); } },
            { d: 'Compara el precio con 1000', f: function (c) {
                return /si\s+[^\n]*precio\s*(>=|>)\s*1000/.test(c) ||
                       /si\s+[^\n]*1000\s*(<=|<)\s*precio/.test(c);
            } },
            { d: 'Muestra el nombre con el mensaje "caro"', f: function (c) {
                return /escribir[^\n]*nombre[^\n]*caro/.test(c);
            } },
            { d: 'Muestra el nombre con el mensaje "económico"', f: function (c) {
                return /escribir[^\n]*nombre[^\n]*econ[oó]mic/.test(c);
            } }
        ],

        /* Actividad 2 · Contador sin bucles. */
        c2: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara nota1, nota2, nota3 y aprobados como Entero', f: function (c) {
                return ['nota1', 'nota2', 'nota3', 'aprobados'].every(function (n) {
                    return declaracion(c, n, 'entero');
                });
            } },
            { d: 'Inicializa aprobados en 0', f: function (c) { return /\baprobados\s*<-\s*0\b/.test(c); } },
            { d: 'Asigna las tres notas: 7, 3 y 9', f: function (c) {
                return /\bnota1\s*<-\s*7\b/.test(c) &&
                       /\bnota2\s*<-\s*3\b/.test(c) &&
                       /\bnota3\s*<-\s*9\b/.test(c);
            } },
            { d: 'Usa tres bloques Si ... FinSi', f: function (c) {
                return cuenta(c, /\bsi\b/g) >= 3 && cuenta(c, /\bfinsi\b/g) >= 3;
            } },
            { d: 'Cada Si compara una nota con 6 (mayor o igual)', f: function (c) {
                return cuenta(c, /si\s+[^\n]*nota[123]\s*>=\s*6/g) >= 3 ||
                       cuenta(c, /si\s+[^\n]*nota[123]\s*>\s*5\b/g) >= 3 ||
                       cuenta(c, /si\s+[^\n]*6\s*<=\s*nota[123]/g) >= 3;
            } },
            { d: 'Incrementa aprobados tres veces', f: function (c) {
                return cuenta(c, /aprobados\s*<-\s*aprobados\s*\+\s*1/g) >= 3;
            } },
            { d: 'Muestra el total con Escribir aprobados', f: function (c) {
                return /escribir[^;\n]*\baprobados\b/.test(c);
            } }
        ],

        /* Actividad 3 · Acumulador sin bucles. */
        c3: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara precio1, precio2, precio3 y total como Real', f: function (c) {
                return ['precio1', 'precio2', 'precio3', 'total'].every(function (n) {
                    return declaracion(c, n, 'real');
                });
            } },
            { d: 'Inicializa total en 0', f: function (c) { return /\btotal\s*<-\s*0\b/.test(c); } },
            { d: 'Asigna los tres precios: 100, 250.50 y 49.50', f: function (c) {
                return /\bprecio1\s*<-\s*100\b/.test(c) &&
                       /\bprecio2\s*<-\s*250[.,]50\b/.test(c) &&
                       /\bprecio3\s*<-\s*49[.,]50\b/.test(c);
            } },
            { d: 'Acumula precio1 en total', f: function (c) {
                return /\btotal\s*<-\s*total\s*\+\s*precio1\b/.test(c);
            } },
            { d: 'Acumula precio2 en total', f: function (c) {
                return /\btotal\s*<-\s*total\s*\+\s*precio2\b/.test(c);
            } },
            { d: 'Acumula precio3 en total', f: function (c) {
                return /\btotal\s*<-\s*total\s*\+\s*precio3\b/.test(c);
            } },
            { d: 'Muestra el total con Escribir', f: function (c) {
                return /escribir[^;\n]*\btotal\b/.test(c);
            } }
        ]
    };
})();
