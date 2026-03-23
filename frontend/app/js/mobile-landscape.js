/**
 * MS Manager – Mobile Landscape + Fullscreen Controller
 * 
 * Estrategia:
 *  1. Si el navegador soporta Screen Orientation API → lock('landscape')
 *  2. Si NO lo soporta o falla → rotación CSS -90°  (clase .force-landscape-active)
 *  3. Pantalla completa via Fullscreen API al primer toque del usuario.
 *
 * Se inyecta automáticamente un overlay #portrait-blocker con un botón
 * "Continuar en horizontal" que dispara el fullscreen + lock/rotate.
 */

(function () {
    'use strict';

    // Solo actuar en dispositivos táctiles / pantallas pequeñas
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
                     || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && window.innerWidth < 1200);

    if (!isMobile) return;

    /* ========================================
       1. Inyectar el overlay si no existe
       ======================================== */
    if (!document.getElementById('portrait-blocker')) {
        const blocker = document.createElement('div');
        blocker.id = 'portrait-blocker';
        blocker.innerHTML = `
            <span class="rotate-icon">📱↻</span>
            <p class="rotate-msg">CLICA<br>O PULSA PARA CONTINUAR</p>
            <button class="rotate-btn" id="landscape-go-btn">CONTINUAR EN HORIZONTAL</button>
        `;
        document.body.prepend(blocker);
    }

    /* ========================================
       2. Funciones auxiliares
       ======================================== */

    /** Intentar poner pantalla completa */
    function goFullscreen() {
        const el = document.documentElement;
        const rfs = el.requestFullscreen
            || el.webkitRequestFullscreen
            || el.msRequestFullscreen;
        if (rfs) {
            rfs.call(el).catch(() => { /* Silenciar errores */ });
        }
    }

    /** Intentar bloquear orientación a landscape */
    function lockLandscape() {
        if (screen.orientation && screen.orientation.lock) {
            return screen.orientation.lock('landscape').then(() => true).catch(() => false);
        }
        return Promise.resolve(false);
    }

    /** Fallback: rotar con CSS */
    function cssRotate() {
        document.documentElement.classList.add('force-landscape-active');
    }

    /** Comprobar si estamos en portrait */
    function isPortrait() {
        return window.innerHeight > window.innerWidth;
    }

    /* ========================================
       3. Botón principal – activa todo
       ======================================== */
    function activate() {
        // 1) Fullscreen
        goFullscreen();

        // 2) Intentar lock nativo, si falla → CSS rotate
        lockLandscape().then(locked => {
            if (!locked && isPortrait()) {
                cssRotate();
            }
        });

        // Ocultar el blocker
        const blocker = document.getElementById('portrait-blocker');
        if (blocker) blocker.style.display = 'none';
    }

    // Vincular al botón
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('landscape-go-btn');
        if (btn) btn.addEventListener('click', activate);
    });

    /* ========================================
       4. Escuchar cambios de orientación
       ======================================== */
    function onOrientationChange() {
        if (!isPortrait()) {
            // Ya estamos en landscape real → quitar CSS rotate si estaba
            document.documentElement.classList.remove('force-landscape-active');
            const blocker = document.getElementById('portrait-blocker');
            if (blocker) blocker.style.display = 'none';
        } else {
            // Volvieron a portrait
            const blocker = document.getElementById('portrait-blocker');
            if (blocker && !document.documentElement.classList.contains('force-landscape-active')) {
                blocker.style.display = 'flex';
            }
        }
    }

    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', onOrientationChange);

    /* ========================================
       5. Auto-activar si ya estamos en landscape
       ======================================== */
    if (!isPortrait()) {
        const blocker = document.getElementById('portrait-blocker');
        if (blocker) blocker.style.display = 'none';
    }

})();
