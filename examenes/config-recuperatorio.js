/* ============================================================
   RECUPERATORIO · PSEINT · PROGRAMACIÓN ESTRUCTURADA
   ------------------------------------------------------------
   Se carga después de config.js y antes de app.js.
   Mismos temas que la evaluación, distintas consignas.
   ============================================================ */

window.CONFIG = window.CONFIG || {};

window.CONFIG.EXAMEN = {
    id: 'pseint-recu-2026',
    titulo: 'Recuperatorio · PSeInt · Programación Estructurada',
    materia: 'Programación'
};

/* Clave de acceso del recuperatorio. */
window.CONFIG.CLAVE_ACCESO = 'pseint-recu';

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

    function incrementaDentroDeSi(codigo, condicion) {
        var re = new RegExp(
            'si\\s+' + condicion +
            '[\\s\\S]*?\\b([a-z_][a-z0-9_]*)\\s*<-\\s*\\1\\s*\\+\\s*1' +
            '[\\s\\S]*?finsi'
        );
        return re.test(codigo);
    }

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
            { d: 'Declara estatura como Real', f: function (c) { return declaracion(c, 'estatura', 'real'); } },
            { d: 'Lee la estatura', f: function (c) { return /\bleer\s+estatura\b/.test(c); } },
            { d: 'Usa Si ... Entonces ... Sino ... FinSi', f: function (c) { return usaSiCompleto(c); } },
            { d: 'Compara la estatura con 1.60', f: function (c) {
                return /estatura\s*<\s*1[.,]60/.test(c) || /1[.,]60\s*>\s*estatura/.test(c);
            } },
            { d: 'Muestra los mensajes "Baja" y "Alta"', f: function (c) {
                return /baja/i.test(c) && /alta/i.test(c) && /escribir/.test(c);
            } }
        ],

        /* Actividad 2 · Mientras de 6 vueltas + contador y acumulador. */
        c2: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara edad, mayores, suma e i como Entero', f: function (c) {
                return ['edad', 'mayores', 'suma', 'i'].every(function (n) {
                    return declaracion(c, n, 'entero');
                });
            } },
            { d: 'Inicializa mayores y suma en 0', f: function (c) {
                return /\bmayores\s*<-\s*0/.test(c) && /\bsuma\s*<-\s*0/.test(c);
            } },
            { d: 'Inicializa i en 1', f: function (c) { return /\bi\s*<-\s*1\b/.test(c); } },
            { d: 'Repite 6 vueltas con Mientras', f: function (c) {
                return /mientras\s*\(?\s*i\s*(?:<=\s*6|<\s*7)\s*\)?/.test(c);
            } },
            { d: 'Lee una edad dentro del Mientras', f: function (c) {
                return /mientras[\s\S]*?\bleer\s+edad\b[\s\S]*?\bfinmientras\b/.test(c);
            } },
            { d: 'Acumula todas las edades en suma', f: function (c) {
                return /\bsuma\s*<-\s*suma\s*\+\s*edad\b/.test(c);
            } },
            { d: 'Cuenta en mayores las edades mayores o iguales que 18', f: function (c) {
                var condicion = '(?:\\(?\\s*edad\\s*>=\\s*18\\s*\\)?|' +
                                '\\(?\\s*edad\\s*>\\s*17\\s*\\)?|' +
                                '\\(?\\s*18\\s*<=\\s*edad\\s*\\)?)';
                return incrementaDentroDeSi(c, condicion);
            } },
            { d: 'Incrementa i y cierra con FinMientras', f: function (c) {
                return /\bi\s*<-\s*i\s*\+\s*1\b/.test(c) && /finmientras/.test(c);
            } },
            { d: 'Muestra los totales de mayores y suma', f: function (c) {
                return /escribir[^;\n]*mayores/.test(c) && /escribir[^;\n]*suma/.test(c);
            } }
        ],

        /* Actividad 3 · SubProceso con parámetro y dos llamadas. */
        c3: [
            { d: 'Declara SubProceso MostrarMitad(numero)', f: function (c) {
                return /subproceso\s+mostrarmitad\s*\(\s*numero\s*\)/.test(c);
            } },
            { d: 'Cierra el subproceso con FinSubProceso', f: function (c) { return /finsubproceso/.test(c); } },
            { d: 'Muestra la mitad con el parámetro numero', f: function (c) {
                return /escribir[^\n]*\bnumero\b[^\n]*\/[^\n]*\b2\b/.test(c) ||
                       /escribir[^\n]*\bnumero\b[^\n]*\*[^\n]*0[.,]5/.test(c);
            } },
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Llama a MostrarMitad(8) desde el algoritmo principal', f: function (c) {
                return /mostrarmitad\s*\(\s*8\s*\)/.test(c);
            } },
            { d: 'Llama a MostrarMitad(10) desde el algoritmo principal', f: function (c) {
                return /mostrarmitad\s*\(\s*10\s*\)/.test(c);
            } }
        ]
    };
})();
