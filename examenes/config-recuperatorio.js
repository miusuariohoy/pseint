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
            { d: 'Declara producto como Caracter', f: function (c) { return declaracionTexto(c, 'producto'); } },
            { d: 'Declara precio como Real', f: function (c) { return declaracion(c, 'precio', 'real'); } },
            { d: 'Lee el producto y el precio', f: function (c) { return leeDos(c, 'producto', 'precio'); } },
            { d: 'Usa Si ... Entonces ... Sino ... FinSi', f: function (c) { return usaSiCompleto(c); } },
            { d: 'Compara el precio con 1000', f: function (c) {
                return /precio\s*>\s*1000/.test(c) || /1000\s*<\s*precio/.test(c);
            } },
            { d: 'Muestra el producto y los mensajes "precio alto" y "precio accesible"', f: function (c) {
                var nombreEnSalida = /escribir[^\n]*producto[^\n]*(precio alto|precio accesible)/.test(c) ||
                                     /escribir[^\n]*(precio alto|precio accesible)[^\n]*producto/.test(c);
                return nombreEnSalida && /precio alto/.test(c) && /precio accesible/.test(c);
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
