/* ============================================================
   EVALUACIÓN · SEGUNDA PARTE · TEMAS 7 A 9
   ------------------------------------------------------------
   Temas: bucle Para, bucle Mientras y subprocesos.
   Evaluación corta y sencilla: 6 opciones múltiples, 2 salidas
   y 3 actividades de pseudocódigo. Total: 10 puntos.
   Se carga después de config.js y antes de app-parte.js.
   ============================================================ */

window.CONFIG = window.CONFIG || {};

window.CONFIG.EXAMEN = {
    id: 'pseint-parte-2',
    titulo: 'Evaluación · Segunda parte · Temas 7 a 9',
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

    function cierraAlgoritmo(codigo) {
        return /\b(algoritmo|proceso)\s+\w+/.test(codigo) &&
               /\b(finalgoritmo|finproceso)\b/.test(codigo);
    }

    /* ---------- Requisitos de la Parte C ---------- */

    window.CONFIG.EJERCICIOS = {

        /* Actividad 1 · Bucle Para con paso 3. */
        c1: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara i como Entero', f: function (c) { return declaracion(c, 'i', 'entero'); } },
            { d: 'Usa un bucle Para con i', f: function (c) {
                return /para\s+i\s*<-/.test(c);
            } },
            { d: 'Comienza en 3', f: function (c) {
                return /para\s+i\s*<-\s*3\b/.test(c);
            } },
            { d: 'Termina en 12 (Hasta 12)', f: function (c) {
                return /para[^\n]*\bhasta\s*12\b/.test(c);
            } },
            { d: 'Avanza de 3 en 3 (Con Paso 3)', f: function (c) {
                return /para[^\n]*\bcon\s+paso\s+3\b/.test(c);
            } },
            { d: 'Muestra i dentro del bucle', f: function (c) {
                return /para[\s\S]*?\bescribir[^\n]*\bi\b[\s\S]*?finpara/.test(c);
            } },
            { d: 'Cierra el bucle con FinPara', f: function (c) {
                return /\bfinpara\b/.test(c);
            } }
        ],

        /* Actividad 2 · Mientras con centinela 0 y contador. */
        c2: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara temperatura y cantidad como Entero', f: function (c) {
                return declaracion(c, 'temperatura', 'entero') && declaracion(c, 'cantidad', 'entero');
            } },
            { d: 'Inicializa cantidad en 0', f: function (c) {
                return /\bcantidad\s*<-\s*0\b/.test(c);
            } },
            { d: 'Inicializa temperatura con un valor distinto de 0', f: function (c) {
                return /\btemperatura\s*<-\s*[1-9]\d*\b/.test(c);
            } },
            { d: 'Usa Mientras con la condición temperatura <> 0', f: function (c) {
                return /mientras\s+\(?\s*temperatura\s*(<>|!=)\s*0/.test(c);
            } },
            { d: 'Lee temperatura dentro del Mientras', f: function (c) {
                return /mientras[\s\S]*?\bleer\s+temperatura\b[\s\S]*?\bfinmientras\b/.test(c);
            } },
            { d: 'Cuenta en cantidad las temperaturas mayores que 30', f: function (c) {
                return /si[\s\S]*?temperatura\s*>\s*30[\s\S]*?\bcantidad\s*<-\s*cantidad\s*\+\s*1[\s\S]*?\bfinsi\b/.test(c);
            } },
            { d: 'Cierra con FinMientras y muestra la cantidad', f: function (c) {
                return /\bfinmientras\b[\s\S]*?escribir[^;\n]*\bcantidad\b/.test(c);
            } }
        ],

        /* Actividad 3 · SubProceso con parámetro y dos llamadas. */
        c3: [
            { d: 'Declara SubProceso MostrarTriple(numero)', f: function (c) {
                return /subproceso\s+mostrartriple\s*\(\s*numero\s*\)/.test(c);
            } },
            { d: 'Cierra el subproceso con FinSubProceso', f: function (c) {
                return /\bfinsubproceso\b/.test(c);
            } },
            { d: 'Muestra el triple (numero * 3 o numero + numero + numero)', f: function (c) {
                return /escribir[^\n]*numero\s*\*\s*3/.test(c) ||
                       /escribir[^\n]*numero\s*\+\s*numero\s*\+\s*numero/.test(c);
            } },
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Llama a MostrarTriple(2) desde el algoritmo principal', f: function (c) {
                return /mostrartriple\s*\(\s*2\s*\)/.test(c);
            } },
            { d: 'Llama a MostrarTriple(5) desde el algoritmo principal', f: function (c) {
                return /mostrartriple\s*\(\s*5\s*\)/.test(c);
            } }
        ]
    };
})();
