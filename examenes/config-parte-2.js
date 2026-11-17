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

        /* Actividad 1 · Bucle Para con paso 2. */
        c1: [
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Declara i como Entero', f: function (c) { return declaracion(c, 'i', 'entero'); } },
            { d: 'Usa un bucle Para con i', f: function (c) {
                return /para\s+i\s*<-/.test(c);
            } },
            { d: 'Comienza en 2', f: function (c) {
                return /para\s+i\s*<-\s*2\b/.test(c);
            } },
            { d: 'Termina en 10 (Hasta 10)', f: function (c) {
                return /para[^\n]*\bhasta\s*10\b/.test(c);
            } },
            { d: 'Avanza de 2 en 2 (Con Paso 2)', f: function (c) {
                return /para[^\n]*\bcon\s+paso\s+2\b/.test(c);
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
            { d: 'Declara numero y contador como Entero', f: function (c) {
                return declaracion(c, 'numero', 'entero') && declaracion(c, 'contador', 'entero');
            } },
            { d: 'Inicializa contador en 0', f: function (c) {
                return /\bcontador\s*<-\s*0\b/.test(c);
            } },
            { d: 'Usa Mientras con la condición numero <> 0', f: function (c) {
                return /mientras\s+\(?\s*numero\s*(<>|!=)\s*0/.test(c) ||
                       /mientras\s+\(?\s*numero\s*>\s*0/.test(c);
            } },
            { d: 'Lee numero dentro del Mientras', f: function (c) {
                return /mientras[\s\S]*?\bleer\s+numero\b[\s\S]*?\bfinmientras\b/.test(c);
            } },
            { d: 'Incrementa contador dentro del Mientras', f: function (c) {
                return /mientras[\s\S]*?\bcontador\s*<-\s*contador\s*\+\s*1[\s\S]*?\bfinmientras\b/.test(c);
            } },
            { d: 'No cuenta el 0: usa Si o lee el primer número antes del Mientras', f: function (c) {
                var conSi = /si[\s\S]*?\bcontador\s*<-\s*contador\s*\+\s*1[\s\S]*?\bfinsi\b/.test(c);
                var antes = /\bleer\s+numero\b[\s\S]*?\bmientras\b/.test(c);
                return conSi || antes;
            } },
            { d: 'Cierra con FinMientras y muestra el contador', f: function (c) {
                return /\bfinmientras\b[\s\S]*?escribir[^;\n]*\bcontador\b/.test(c);
            } }
        ],

        /* Actividad 3 · SubProceso con parámetro y dos llamadas. */
        c3: [
            { d: 'Declara SubProceso MostrarDoble(numero)', f: function (c) {
                return /subproceso\s+mostrardoble\s*\(\s*numero\s*\)/.test(c);
            } },
            { d: 'Cierra el subproceso con FinSubProceso', f: function (c) {
                return /\bfinsubproceso\b/.test(c);
            } },
            { d: 'Muestra el doble (numero * 2 o numero + numero)', f: function (c) {
                return /escribir[^\n]*numero\s*\*\s*2/.test(c) ||
                       /escribir[^\n]*numero\s*\+\s*numero/.test(c);
            } },
            { d: 'Empieza con Algoritmo (o Proceso) y cierra con FinAlgoritmo (o FinProceso)', f: function (c) { return cierraAlgoritmo(c); } },
            { d: 'Llama a MostrarDoble(5) desde el algoritmo principal', f: function (c) {
                return /mostrardoble\s*\(\s*5\s*\)/.test(c);
            } },
            { d: 'Llama a MostrarDoble(8) desde el algoritmo principal', f: function (c) {
                return /mostrardoble\s*\(\s*8\s*\)/.test(c);
            } }
        ]
    };
})();
