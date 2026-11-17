/* ============================================================
   Evaluaciones por partes · PSeInt
   ------------------------------------------------------------
   Lógica común para la evaluación de la primera parte (temas
   1 a 6) y la de la segunda parte (temas 7 a 9).

   A diferencia de app.js, calcula el puntaje máximo a partir de
   las consignas que realmente tiene cada página:
   - cada .mc vale 1 punto;
   - cada .salida vale 0,5 puntos;
   - cada .codigo vale lo indicado en data-puntos (1 por defecto).
   ============================================================ */
(function () {
    'use strict';

    var cfg = window.CONFIG || {};
    var EXAMEN = cfg.EXAMEN || { id: 'pseint', titulo: 'PSeInt', materia: 'Programación' };

    var PUNTOS_MC = 1;
    var PUNTOS_SALIDA = 0.5;

    var CLAVE_ACCESO = 'eval_acceso_' + EXAMEN.id;
    var CLAVE_ENVIO = 'eval_' + EXAMEN.id + '_enviada_v1';

    var UN_SOLO_INTENTO = cfg.UN_SOLO_INTENTO !== false;
    var bloqueada = false;
    var enviando = false;
    var ultimoResultado = null;
    var ultimoPayload = null;

    var PARTES = { mc: [], salidas: [], codigos: [], max: 10, maxC: 0 };
    var MAX_PUNTOS = 10;

    /* ---------- Helpers DOM ---------- */
    function $(sel, raiz) { return (raiz || document).querySelector(sel); }
    function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

    /* ---------- Utilidades ---------- */
    function normalizar(texto) {
        return String(texto == null ? '' : texto)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[.,;:!?¡¿"']/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function formatear(n) {
        return Number.isInteger(n) ? String(n) : n.toFixed(1);
    }

    function redondear(n) {
        return Math.round(n * 10) / 10;
    }

    function numero(pregunta) {
        var el = pregunta.querySelector('.num-preg');
        return el ? el.textContent.trim() : '?';
    }

    function puntosCodigo(elemento) {
        var p = parseFloat(elemento.getAttribute('data-puntos'));
        return isNaN(p) ? 1 : p;
    }

    function fechaLegible(iso) {
        try {
            return new Date(iso).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { return ''; }
    }

    /* ---------- Puntaje máximo ---------- */
    function calcularPartes() {
        var mc = $$('.mc');
        var salidas = $$('.salida');
        var codigos = $$('.codigo');

        var maxC = 0;
        codigos.forEach(function (c) { maxC += puntosCodigo(c); });

        var max = mc.length * PUNTOS_MC + salidas.length * PUNTOS_SALIDA + maxC;

        return {
            mc: mc,
            salidas: salidas,
            codigos: codigos,
            max: redondear(max),
            maxC: redondear(maxC)
        };
    }

    function renderDesglose(pa, pb, pc) {
        var contenedor = $('#desglose');
        if (!contenedor) return;

        var partes = [];
        if (PARTES.mc.length) {
            partes.push('<span>Parte A: <b id="puntos-a">' + formatear(pa) + '</b> / ' +
                formatear(PARTES.mc.length * PUNTOS_MC) + '</span>');
        }
        if (PARTES.salidas.length) {
            partes.push('<span>Parte B: <b id="puntos-b">' + formatear(pb) + '</b> / ' +
                formatear(PARTES.salidas.length * PUNTOS_SALIDA) + '</span>');
        }
        if (PARTES.codigos.length) {
            partes.push('<span>Parte C: <b id="puntos-c">' + formatear(pc) + '</b> / ' +
                formatear(PARTES.maxC) + '</span>');
        }
        contenedor.innerHTML = partes.join('');
    }

    /* ---------- Evaluación ---------- */
    function evaluar() {
        var puntosA = 0, puntosB = 0, puntosC = 0;
        var erroresA = [], erroresB = [], erroresC = [];
        var lineas = [];
        var respuestas = { mc: {}, salidas: {}, codigo: {} };

        /* Parte A · opción múltiple */
        $$('.mc').forEach(function (pregunta) {
            var n = numero(pregunta);
            var correcta = pregunta.dataset.correcta;
            var marcada = pregunta.querySelector('input[type="radio"]:checked');
            var elegida = marcada ? marcada.value : null;

            pregunta.classList.remove('correcta', 'incorrecta');
            $$('.opciones label', pregunta).forEach(function (label) {
                label.classList.remove('opcion-correcta', 'opcion-elegida-mal');
            });

            var labelCorrecta = pregunta.querySelector('.opciones label[data-op="' + correcta + '"]');
            if (labelCorrecta) labelCorrecta.classList.add('opcion-correcta');

            var textoCorrecta = labelCorrecta ? labelCorrecta.textContent.trim() : correcta;
            var textoElegida = '(sin responder)';
            if (marcada) {
                var labelElegida = marcada.closest('label');
                textoElegida = labelElegida ? labelElegida.textContent.trim() : elegida;
            }

            var primero = pregunta.querySelector('input');
            if (primero) respuestas.mc[primero.name] = elegida || '';

            if (elegida === correcta) {
                puntosA += PUNTOS_MC;
                pregunta.classList.add('correcta');
            } else {
                pregunta.classList.add('incorrecta');
                erroresA.push(n);
                if (marcada) {
                    var labelMal = pregunta.querySelector('.opciones label[data-op="' + elegida + '"]');
                    if (labelMal) labelMal.classList.add('opcion-elegida-mal');
                }
            }

            lineas.push(n + ') Opción múltiple');
            lineas.push('   Respuesta: ' + textoElegida);
            lineas.push('   Correcta:  ' + textoCorrecta);
            lineas.push('   Resultado: ' + (elegida === correcta ? 'OK' : 'ERROR'));
        });

        /* Parte B · predicción de salidas */
        $$('.salida').forEach(function (pregunta) {
            var n = numero(pregunta);
            var aceptadas = pregunta.dataset.aceptadas.split('|').map(normalizar);
            var campo = pregunta.querySelector('input');
            var valor = normalizar(campo.value);
            var ok = aceptadas.indexOf(valor) !== -1;

            respuestas.salidas[campo.id] = campo.value;

            pregunta.classList.remove('correcta', 'incorrecta');
            if (ok) {
                puntosB += PUNTOS_SALIDA;
                pregunta.classList.add('correcta');
            } else {
                pregunta.classList.add('incorrecta');
                erroresB.push(valor === '' ? n + ' (sin responder)' : n);
            }

            lineas.push(n + ') Salida de programa');
            lineas.push('   Respuesta: ' + (campo.value.trim() || '(sin responder)'));
            lineas.push('   Esperada:  ' + pregunta.dataset.aceptadas.split('|')[0]);
            lineas.push('   Resultado: ' + (ok ? 'OK' : 'ERROR'));
        });

        /* Parte C · pseudocódigo */
        var ejercicios = cfg.EJERCICIOS || {};
        Object.keys(ejercicios).forEach(function (id) {
            var area = document.getElementById(id);
            var contenedor = document.getElementById('res-' + id);
            if (!area || !contenedor) return;

            var card = area.closest('.codigo');
            var puntosMax = card ? puntosCodigo(card) : 1;
            var codigo = area.value.toLowerCase();
            var checks = ejercicios[id];
            var aprobados = 0;

            respuestas.codigo[id] = area.value;

            var items = checks.map(function (check) {
                var paso = false;
                try { paso = check.f(codigo); } catch (e) { paso = false; }
                if (paso) aprobados++;
                return '<li class="' + (paso ? 'ok' : 'fail') + '">' +
                    (paso ? '✔' : '✘') + ' ' + check.d + '</li>';
            }).join('');

            var puntos = (aprobados / checks.length) * puntosMax;
            puntosC += puntos;

            var n = card ? numero(card) : id;
            if (puntos < puntosMax) {
                erroresC.push(n + ' (faltan requisitos)');
            }

            contenedor.innerHTML =
                '<strong class="puntos-code">' + formatear(redondear(puntos)) + ' / ' +
                formatear(puntosMax) + ' puntos</strong>' +
                '<ul>' + items + '</ul>';

            lineas.push(n + ') Ejercicio de código (' + formatear(redondear(puntos)) +
                ' / ' + formatear(puntosMax) + ' puntos)');
            checks.forEach(function (check) {
                var paso = false;
                try { paso = check.f(codigo); } catch (e) { paso = false; }
                lineas.push('   ' + (paso ? 'OK: ' : 'FALTA: ') + check.d);
            });
            lineas.push('   Código enviado:');
            area.value.split('\n').forEach(function (l) { lineas.push('   ' + l); });
        });

        var total = redondear(puntosA + puntosB + puntosC);

        $('#puntaje-total').textContent = formatear(total);
        $('#puntaje-max').textContent = formatear(MAX_PUNTOS);
        renderDesglose(puntosA, redondear(puntosB), redondear(puntosC));
        $('#barra-fill').style.width = (total / MAX_PUNTOS * 100) + '%';

        var proporcion = total / MAX_PUNTOS;
        var mensaje;
        if (proporcion >= 0.9) mensaje = '🌟 Excelente. Dominás los contenidos de esta parte.';
        else if (proporcion >= 0.7) mensaje = '✅ Muy bien. Tenés una base sólida; revisá los puntos marcados.';
        else if (proporcion >= 0.6) mensaje = '👍 Aprobado. Repasá los temas antes de avanzar.';
        else mensaje = '📚 A repasar. Volvé a la guía y practicá los ejercicios.';
        $('#mensaje').textContent = mensaje;
        $('#nota-resultado').style.display = 'block';

        var partesError = [];
        if (erroresA.length) partesError.push('Preguntas ' + erroresA.join(', '));
        if (erroresB.length) partesError.push('Salidas ' + erroresB.join(', '));
        if (erroresC.length) partesError.push('Código ' + erroresC.join(', '));
        var erroresTexto = partesError.join(' · ');

        var resumen = $('#resumen-errores');
        if (!erroresTexto) {
            resumen.className = 'resumen-errores sin-errores';
            resumen.innerHTML = '🎯 <b>Sin errores.</b> Respondiste todo correctamente.';
        } else {
            resumen.className = 'resumen-errores';
            resumen.innerHTML = '⚠️ <b>Errores a revisar:</b> ' + erroresTexto +
                '. Mirá la explicación de cada consigna marcada en rojo.';
        }

        $('.resultado').classList.add('visible');
        document.body.classList.add('calificado');

        return {
            total: total,
            puntosA: puntosA,
            puntosB: redondear(puntosB),
            puntosC: redondear(puntosC),
            erroresA: erroresA,
            erroresB: erroresB,
            erroresC: erroresC,
            erroresTexto: erroresTexto,
            detalle: lineas.join('\n'),
            respuestas: respuestas
        };
    }

    /* ---------- Datos del alumno ---------- */
    function datosAlumno() {
        return {
            apellido: $('#alumno-apellido').value.trim(),
            nombre: $('#alumno-nombre').value.trim(),
            curso: $('#alumno-curso').value.trim(),
            materia: ($('#alumno-materia').value.trim() || EXAMEN.materia)
        };
    }

    function validarAlumno() {
        var campos = ['#alumno-apellido', '#alumno-nombre', '#alumno-curso'];
        var faltan = false;
        campos.forEach(function (sel) {
            var el = $(sel);
            el.classList.remove('invalido');
            if (!el.value.trim()) {
                el.classList.add('invalido');
                faltan = true;
            }
        });
        if (faltan) {
            var aviso = $('#aviso-envio');
            aviso.className = 'aviso-envio error visible';
            aviso.innerHTML = '⚠️ Completá <b>apellido</b>, <b>nombre</b> y <b>curso</b> antes de enviar.';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }
        return true;
    }

    /* ---------- Payload ---------- */
    function construirPayload(res) {
        var a = datosAlumno();
        return {
            examen: EXAMEN.id,
            titulo: EXAMEN.titulo,
            materia: a.materia,
            apellido: a.apellido,
            nombre: a.nombre,
            curso: a.curso,
            nota: res.total,
            puntosA: res.puntosA,
            puntosB: res.puntosB,
            puntosC: res.puntosC,
            errores: res.erroresTexto || 'Sin errores',
            detalle: res.detalle,
            respuestas: res.respuestas,
            momento: new Date().toISOString(),
            navegador: navigator.userAgent,
            origen: location.href
        };
    }

    /* ---------- Envío ---------- */
    function enviarDirecto(payload) {
        var gh = cfg.GITHUB || {};
        if (!gh.token || gh.token.indexOf('PEGA') === 0) {
            return Promise.reject(new Error('Falta configurar el token en config.js'));
        }
        return fetch('https://api.github.com/repos/' + gh.owner + '/' + gh.repo + '/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': 'Bearer ' + gh.token,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: gh.evento || 'resultado',
                client_payload: payload
            })
        }).then(function (r) {
            if (r.status === 204) return true;
            return r.text().then(function (t) {
                throw new Error('GitHub ' + r.status + ': ' + t.slice(0, 200));
            });
        });
    }

    function enviarProxy(payload) {
        if (!cfg.PROXY_URL) {
            return Promise.reject(new Error('Falta configurar PROXY_URL en config.js'));
        }
        return fetch(cfg.PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); })
          .then(function (d) {
              if (!d || !d.ok) throw new Error((d && d.error) || 'El proxy rechazó el envío');
              return true;
          });
    }

    /* ---------- Modo ntfy: cifrado híbrido RSA + AES ---------- */
    function b64DeBuffer(buffer) {
        var bytes = new Uint8Array(buffer);
        var bin = '';
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }

    function bufferDeB64(texto) {
        var bin = atob(texto);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    function comprimir(datos) {
        if (!window.CompressionStream || !window.Response || !window.Blob) {
            return Promise.resolve({ datos: datos, z: 0 });
        }
        try {
            var flujo = new Blob([datos]).stream().pipeThrough(new window.CompressionStream('gzip'));
            return new Response(flujo).arrayBuffer().then(function (buffer) {
                return { datos: new Uint8Array(buffer), z: 1 };
            }).catch(function () {
                return { datos: datos, z: 0 };
            });
        } catch (e) {
            return Promise.resolve({ datos: datos, z: 0 });
        }
    }

    function cifrarPayload(payload) {
        if (!window.crypto || !window.crypto.subtle) {
            return Promise.reject(new Error('Este navegador no soporta cifrado (probá con HTTPS o Chrome/Firefox actualizado)'));
        }
        var datos = new TextEncoder().encode(JSON.stringify(payload));
        return comprimir(datos).then(function (paquete) {
            return window.crypto.subtle.importKey(
                'spki',
                bufferDeB64(cfg.CLAVE_PUBLICA),
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                false,
                ['encrypt']
            ).then(function (clavePublica) {
                return window.crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 }, true, ['encrypt']
                ).then(function (claveAes) {
                    var iv = window.crypto.getRandomValues(new Uint8Array(12));
                    return window.crypto.subtle.encrypt(
                        { name: 'AES-GCM', iv: iv }, claveAes, paquete.datos
                    ).then(function (cifrado) {
                        return window.crypto.subtle.exportKey('raw', claveAes).then(function (cruda) {
                            return window.crypto.subtle.encrypt(
                                { name: 'RSA-OAEP' }, clavePublica, cruda
                            ).then(function (claveCifrada) {
                                return {
                                    k: b64DeBuffer(claveCifrada),
                                    i: b64DeBuffer(iv),
                                    d: b64DeBuffer(cifrado),
                                    z: paquete.z
                                };
                            });
                        });
                    });
                });
            });
        });
    }

    function enviarNtfy(payload) {
        if (!cfg.NTFY_TOPIC || !cfg.CLAVE_PUBLICA) {
            return Promise.reject(new Error('Falta configurar el canal de envío en config.js'));
        }
        var copia = JSON.parse(JSON.stringify(payload));
        if (copia.detalle) copia.detalle = String(copia.detalle).slice(0, 6000);
        if (copia.respuestas && copia.respuestas.codigo) {
            Object.keys(copia.respuestas.codigo).forEach(function (k) {
                copia.respuestas.codigo[k] = String(copia.respuestas.codigo[k]).slice(0, 4000);
            });
        }
        return cifrarPayload(copia).then(function (sobre) {
            return fetch('https://ntfy.sh/' + encodeURIComponent(cfg.NTFY_TOPIC), {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(sobre)
            }).then(function (r) {
                if (!r.ok) throw new Error('El canal respondió ' + r.status);
                return true;
            });
        });
    }

    function enviar(payload) {
        var modo = cfg.MODO_ENVIO || 'ninguno';
        if (modo === 'ntfy') return enviarNtfy(payload);
        if (modo === 'directo') return enviarDirecto(payload);
        if (modo === 'proxy') return enviarProxy(payload);
        return Promise.reject(new Error('Envío desactivado (MODO_ENVIO = ninguno)'));
    }

    function mostrarEstadoEnvio(texto, clase) {
        var el = $('#estado-envio');
        el.className = 'estado-envio ' + (clase || '');
        el.innerHTML = texto;
    }

    /* ---------- Guardado local ---------- */
    function guardar(datos) {
        try { localStorage.setItem(CLAVE_ENVIO, JSON.stringify(datos)); } catch (e) { /* sin storage */ }
    }

    function leerGuardado() {
        try {
            var raw = localStorage.getItem(CLAVE_ENVIO);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function restaurar(d) {
        if (!d) return;
        if (d.alumno) {
            $('#alumno-apellido').value = d.alumno.apellido || '';
            $('#alumno-nombre').value = d.alumno.nombre || '';
            $('#alumno-curso').value = d.alumno.curso || '';
            $('#alumno-materia').value = d.alumno.materia || EXAMEN.materia;
        }
        var r = d.respuestas || {};
        Object.keys(r.mc || {}).forEach(function (name) {
            var radio = document.querySelector('input[name="' + name + '"][value="' + r.mc[name] + '"]');
            if (radio) radio.checked = true;
        });
        Object.keys(r.salidas || {}).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = r.salidas[id];
        });
        Object.keys(r.codigo || {}).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = r.codigo[id];
        });
    }

    function mostrarBotonOtra() {
        if ($('#btn-otra')) return;
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn btn-secundario';
        boton.id = 'btn-otra';
        boton.style.display = 'block';
        boton.style.marginTop = '12px';
        boton.textContent = '🔄 Hacer otra evaluación';
        boton.addEventListener('click', reiniciar);
        $('#aviso-envio').appendChild(boton);
    }

    function bloquear(mensaje) {
        bloqueada = true;

        var aviso = $('#aviso-envio');
        aviso.className = 'aviso-envio visible';
        aviso.innerHTML = mensaje;

        if (!UN_SOLO_INTENTO) {
            mostrarBotonOtra();
            return;
        }

        document.body.classList.add('enviada');
        $$('input, textarea').forEach(function (el) { el.disabled = true; });
        var corrige = $('#btn-corregir');
        var reinicia = $('#btn-reiniciar');
        if (corrige) corrige.style.display = 'none';
        if (reinicia) reinicia.style.display = 'none';
    }

    /* ---------- Corrección principal ---------- */
    function corregir() {
        if (bloqueada || enviando) return;
        if (!validarAlumno()) return;

        var aviso = UN_SOLO_INTENTO
            ? '¿Corregir y enviar la evaluación?\n\nTenés un solo intento: después de enviar no podrás cambiar tus respuestas.'
            : '¿Corregir y enviar la evaluación?\n\nEl resultado quedará registrado en el informe del docente.';
        if (!window.confirm(aviso)) return;

        var res = evaluar();
        var payload = construirPayload(res);
        ultimoResultado = res;
        ultimoPayload = payload;

        var registro = {
            alumno: datosAlumno(),
            total: res.total,
            puntosA: res.puntosA,
            puntosB: res.puntosB,
            puntosC: res.puntosC,
            erroresTexto: res.erroresTexto,
            respuestas: res.respuestas,
            momento: payload.momento
        };
        guardar(registro);

        var mensaje = UN_SOLO_INTENTO
            ? '🔒 <b>Evaluación enviada.</b> Tu nota es <b>' + formatear(res.total) +
              ' / ' + formatear(MAX_PUNTOS) + '</b>. No se puede volver a realizar ni modificar.'
            : '✅ <b>Evaluación enviada.</b> Tu nota es <b>' + formatear(res.total) +
              ' / ' + formatear(MAX_PUNTOS) + '</b>. Quedó registrada en el informe del docente.';
        bloquear(mensaje);

        mostrarEstadoEnvio('Enviando el resultado al informe del docente…');

        enviando = true;
        enviar(payload)
            .then(function () {
                mostrarEstadoEnvio('✅ Resultado guardado en el informe del docente.');
            })
            .catch(function (err) {
                var detalle = err && err.message ? err.message : 'Error desconocido';
                mostrarEstadoEnvio(
                    '⚠️ No se pudo guardar automáticamente (' + detalle + '). ' +
                    'Descargá el comprobante y entregalo al docente.',
                    'fail'
                );
                $('#enviar-fallback').classList.add('visible');
            })
            .finally(function () {
                enviando = false;
            });

        $('#resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ---------- Reinicio ---------- */
    function reiniciar() {
        if (enviando) return;
        if (bloqueada && UN_SOLO_INTENTO) return;
        if (!confirm('¿Borrar todas tus respuestas y empezar de nuevo?')) return;

        $$('input[type="radio"]').forEach(function (r) { r.checked = false; });
        $$('.salida input').forEach(function (i) { i.value = ''; });
        $$('.editor').forEach(function (t) { t.value = t.getAttribute('data-plantilla') || ''; });
        $$('.mc, .salida').forEach(function (q) { q.classList.remove('correcta', 'incorrecta'); });
        $$('.opciones label').forEach(function (l) { l.classList.remove('opcion-correcta', 'opcion-elegida-mal'); });
        $$('.resultado-codigo').forEach(function (r) { r.innerHTML = ''; });
        $$('.invalido').forEach(function (i) { i.classList.remove('invalido'); });

        $('#alumno-apellido').value = '';
        $('#alumno-nombre').value = '';
        $('#alumno-curso').value = '';
        $('#alumno-materia').value = EXAMEN.materia;

        bloqueada = false;
        document.body.classList.remove('enviada');
        $$('input, textarea').forEach(function (el) { el.disabled = false; });
        var corrige = $('#btn-corregir');
        var reinicia = $('#btn-reiniciar');
        if (corrige) corrige.style.display = '';
        if (reinicia) reinicia.style.display = '';
        var otra = $('#btn-otra');
        if (otra && otra.parentNode) otra.parentNode.removeChild(otra);

        ultimoResultado = null;
        ultimoPayload = null;
        try { localStorage.removeItem(CLAVE_ENVIO); } catch (e) { /* sin storage */ }

        document.body.classList.remove('calificado');
        $('.resultado').classList.remove('visible');
        $('#puntaje-total').textContent = '0';
        renderDesglose(0, 0, 0);
        $('#barra-fill').style.width = '0';
        $('#mensaje').textContent = 'Corregí la evaluación para ver tu puntaje.';
        $('#nota-resultado').style.display = 'none';
        $('#estado-envio').textContent = '';
        $('#estado-envio').className = 'estado-envio';
        $('#resumen-errores').innerHTML = '';
        $('#resumen-errores').className = 'resumen-errores';
        $('#enviar-fallback').classList.remove('visible');
        var aviso = $('#aviso-envio');
        aviso.className = 'aviso-envio';
        aviso.innerHTML = '';

        window.scrollTo({ top: 0, behavior: 'smooth' });
        var primero = $('#alumno-apellido');
        if (primero) primero.focus();
    }

    /* ---------- Comprobante ---------- */
    function textoComprobante() {
        if (!ultimoResultado) return '';
        var a = datosAlumno();
        var texto = 'EVALUACIÓN: ' + EXAMEN.titulo + ' (' + EXAMEN.id + ')\n' +
            'Apellido: ' + a.apellido + '\n' +
            'Nombre: ' + a.nombre + '\n' +
            'Curso: ' + a.curso + '\n' +
            'Materia: ' + a.materia + '\n' +
            'Fecha y hora: ' + fechaLegible(ultimoPayload ? ultimoPayload.momento : new Date().toISOString()) + '\n' +
            'NOTA: ' + formatear(ultimoResultado.total) + ' / ' + formatear(MAX_PUNTOS) + '\n';

        if (PARTES.mc.length) texto += 'Parte A: ' + formatear(ultimoResultado.puntosA) + ' / ' + formatear(PARTES.mc.length) + '\n';
        if (PARTES.salidas.length) texto += 'Parte B: ' + formatear(ultimoResultado.puntosB) + ' / ' + formatear(PARTES.salidas.length * PUNTOS_SALIDA) + '\n';
        if (PARTES.codigos.length) texto += 'Parte C: ' + formatear(ultimoResultado.puntosC) + ' / ' + formatear(PARTES.maxC) + '\n';

        return texto +
            'Errores: ' + (ultimoResultado.erroresTexto || 'Sin errores') + '\n\n' +
            ultimoResultado.detalle;
    }

    function copiar() {
        var texto = textoComprobante();
        if (!texto) return;
        var boton = $('#btn-copiar');
        function listo() {
            var original = boton.textContent;
            boton.textContent = '✅ Copiado';
            setTimeout(function () { boton.textContent = original; }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(listo).catch(copiarFallback);
        } else {
            copiarFallback();
        }
        function copiarFallback() {
            var ta = document.createElement('textarea');
            ta.value = texto;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); listo(); } catch (e) { /* nada */ }
            document.body.removeChild(ta);
        }
    }

    function descargar() {
        if (!ultimoPayload) return;
        var a = datosAlumno();
        var nombreArchivo = 'evaluacion-' + EXAMEN.id + '-' +
            (a.apellido + '-' + a.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() +
            '.json';
        var blob = new Blob([JSON.stringify(ultimoPayload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombreArchivo;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    /* ---------- Acceso ---------- */
    function mostrarApp() {
        $('#acceso').hidden = true;
        $('#app').hidden = false;
        $('#alumno-materia').value = EXAMEN.materia;
        var primero = $('#alumno-apellido');
        if (primero) primero.focus();
    }

    function iniciarAcceso() {
        try {
            if (sessionStorage.getItem(CLAVE_ACCESO) === '1') {
                mostrarApp();
                return;
            }
        } catch (e) { /* sin storage */ }

        $('#form-acceso').addEventListener('submit', function (ev) {
            ev.preventDefault();
            var valor = $('#clave').value.trim();
            if (valor === String(cfg.CLAVE_ACCESO)) {
                try { sessionStorage.setItem(CLAVE_ACCESO, '1'); } catch (e) { /* sin storage */ }
                $('#acceso-error').textContent = '';
                mostrarApp();
            } else {
                $('#acceso-error').textContent = 'Clave incorrecta. Volvé a intentar.';
                $('#clave').value = '';
                $('#clave').focus();
            }
        });
    }

    /* ---------- Arranque ---------- */
    function iniciar() {
        PARTES = calcularPartes();
        MAX_PUNTOS = PARTES.max;
        $('#puntaje-max').textContent = formatear(MAX_PUNTOS);
        renderDesglose(0, 0, 0);

        iniciarAcceso();

        $('#btn-corregir').addEventListener('click', corregir);
        $('#btn-reiniciar').addEventListener('click', reiniciar);
        $('#btn-imprimir').addEventListener('click', function () { window.print(); });
        $('#btn-copiar').addEventListener('click', copiar);
        $('#btn-descargar').addEventListener('click', descargar);

        var guardado = leerGuardado();
        if (guardado && UN_SOLO_INTENTO) {
            restaurar(guardado);
            var res = evaluar();
            ultimoResultado = res;
            ultimoPayload = construirPayload(res);
            bloquear('🔒 <b>Esta evaluación ya fue enviada</b>' +
                (guardado.momento ? ' el ' + fechaLegible(guardado.momento) : '') +
                ' con una nota de <b>' + formatear(guardado.total) + ' / ' + formatear(MAX_PUNTOS) + '</b>. ' +
                'Solo se puede realizar una vez por navegador. ' +
                'Si necesitás rendirla de nuevo, hablá con el docente.');
            setTimeout(function () {
                $('#resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else if (guardado) {
            try { localStorage.removeItem(CLAVE_ENVIO); } catch (e) { /* sin storage */ }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
