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

    function declaracion(codigo, nombre, tipo) {
        return new RegExp('definir\\s+[^;\\n]*\\b' + nombre + '\\b[^;\\n]*como\\s+' + tipo).test(codigo);
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
            { d: 'Declara nombre como Caracter', f: function (c) { return declaracionTexto(c, 'nombre'); } },
            { d: 'Declara edad como Entero', f: function (c) { return declaracion(c, 'edad', 'entero'); } },
            { d: 'Lee el nombre y la edad', f: function (c) { return leeDos(c, 'nombre', 'edad'); } },
            { d: 'Usa Si ... Entonces ... Sino ... FinSi', f: function (c) { return usaSiCompleto(c); } },
            { d: 'Compara la edad con 18', f: function (c) {
                return /edad\s*>=\s*18/.test(c) || /edad\s*>\s*17/.test(c) || /18\s*<=\s*edad/.test(c);
            } },
            { d: 'Muestra el nombre y los mensajes "mayor" y "menor"', f: function (c) {
                var nombreEnSalida = /escribir[^\n]*nombre[^\n]*(mayor|menor)/.test(c) ||
                                     /escribir[^\n]*(mayor|menor)[^\n]*nombre/.test(c);
                return nombreEnSalida && /mayor/.test(c) && /menor/.test(c);
            } }
        ],

        /* Actividad 2 · Mientras fijo de 10 vueltas + condicional + dos contadores. */
        c2: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara edad, mayores, menores e i como Entero', f: function (c) {
                return ['edad', 'mayores', 'menores', 'i'].every(function (n) {
                    return declaracion(c, n, 'entero');
                });
            } },
            { d: 'Inicializa mayores y menores en 0', f: function (c) {
                return /\bmayores\s*<-\s*0/.test(c) && /\bmenores\s*<-\s*0/.test(c);
            } },
            { d: 'Inicializa el contador i en 1', f: function (c) {
                return /\bi\s*<-\s*1\b/.test(c);
            } },
            { d: 'Repite con Mientras i <= 10', f: function (c) {
                return /mientras\s*\(?\s*i\s*(?:<=\s*10|<\s*11)\s*\)?/.test(c);
            } },
            { d: 'Lee una edad dentro del Mientras', f: function (c) {
                return /mientras[\s\S]*?\bleer\s+edad\b[\s\S]*?\bfinmientras\b/.test(c);
            } },
            { d: 'Usa Si/Sino y cuenta en mayores según la edad (16 o más)', f: function (c) {
                var condicion = '(?:\\(?\\s*edad\\s*>=\\s*16\\s*\\)?|' +
                                '\\(?\\s*edad\\s*>\\s*16\\s*\\)?|' +
                                '\\(?\\s*16\\s*<\\s*edad\\s*\\)?|' +
                                '\\(?\\s*edad\\s*>=\\s*17\\s*\\)?)';
                return usaSiCompleto(c) && incrementaDentroDeSi(c, condicion);
            } },
            { d: 'Cuenta en menores la rama del Sino', f: function (c) {
                return incrementaDentroDeSino(c, 'menores');
            } },
            { d: 'Incrementa i y cierra con FinMientras', f: function (c) {
                return /\bi\s*<-\s*i\s*\+\s*1\b/.test(c) && /finmientras/.test(c);
            } },
            { d: 'Muestra los totales de mayores y menores', f: function (c) {
                return /escribir[^;\n]*mayores/.test(c) && /escribir[^;\n]*menores/.test(c);
            } }
        ],

        /* Actividad 3 · SubProceso simple con parámetro y llamada. */
        c3: [
            { d: 'Declara SubProceso Saludar(nombre)', f: function (c) {
                return /subproceso\s+saludar\s*\(\s*nombre\s*\)/.test(c);
            } },
            { d: 'Cierra el subproceso con FinSubProceso', f: function (c) { return /finsubproceso/.test(c); } },
            { d: 'Muestra "Hola" con Escribir', f: function (c) {
                return /escribir[^\n]*hola/.test(c);
            } },
            { d: 'Incluye el parámetro nombre en el mensaje', f: function (c) {
                return /escribir[^\n]*\bnombre\b/.test(c);
            } },
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Llama a Saludar("Ana") desde el algoritmo principal', f: function (c) {
                return /saludar\s*\(\s*["']ana["']\s*\)/.test(c) && cierraAlgoritmo(c);
            } }
        ]
    };
})();
