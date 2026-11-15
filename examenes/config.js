/* ============================================================
   CONFIGURACIÓN GENERAL · EXÁMENES DE PSEINT
   ------------------------------------------------------------
   Se carga antes de config-evaluacion.js / config-recuperatorio.js
   y antes de app.js.

   El canal de envío es el mismo del repositorio privado "inform".
   Cada examen define su propio id y su clave en los archivos
   config-evaluacion.js y config-recuperatorio.js.
   ============================================================ */

window.CONFIG = {
    // Valores por defecto; cada examen los reemplaza.
    CLAVE_ACCESO: 'pseint',
    UN_SOLO_INTENTO: false,

    EXAMEN: {
        id: 'pseint',
        titulo: 'PSeInt · Programación Estructurada',
        materia: 'Programación'
    },

    // 'ntfy' | 'proxy' | 'directo' | 'ninguno'
    MODO_ENVIO: 'ntfy',

    // --- Modo ntfy (canal cifrado) ---
    NTFY_TOPIC: 'py1-inform-7ae6582c6449a0fd',
    CLAVE_PUBLICA: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy4M/CjOEBBmnmgPc2B+yj5O55KOVGE7voIQ41DWI8OMuuQVNlWgzUPgTxW58x7hOW/my1uiUNbNZvm3oixTZJtBw8Lxi8rMVCv9gRArhU8QELEyY1EjB9VCYxZ0UysC1375+m+J757GB3nweSvjRY5esbKzvYOLwh7Lj+sRY6mNgygm/RkeQKhqQ2u/L+PkIVZ7J9evXDofKYP6MOayW6kM61wqFjh32pE5kjDwMkIBmX73BgTD2elxP8iIfvKhr+dqVgft93Gn9x21SxbF1/Ih0ObpCzzTzbMsl2MRiZKR7PndaO7Wtbt1MxbvtvrpV/nTct6bMx1Rl9amYxtsdRwIDAQAB',

    // --- Modo proxy (Apps Script) ---
    PROXY_URL: '',

    // --- Modo directo (bloqueado por GitHub en repos públicos) ---
    GITHUB: {
        owner: 'miusuariohoy',
        repo: 'inform',
        evento: 'resultado',
        token: ''
    }
};
