/* ===========================================================
   "COSAS QUE AMO DE TI" 💗
   Cincuenta tarjetas numeradas que aparecen una por una al bajar
   por la página, con un pequeño retraso entre ellas para que se
   lean en orden.

   Se usa IntersectionObserver: cada tarjeta se muestra cuando entra
   en pantalla. El CSS solo las oculta cuando este script arranca
   (clase .js-activo), así que si el JS no carga se ven igualmente.
   =========================================================== */

(function () {
    "use strict";

    var lista = document.querySelector(".amo-lista");
    var tarjetas = document.querySelectorAll(".amo-tarjeta");

    if (!lista || !tarjetas.length) {
        return;
    }

    // A partir de aquí, el CSS puede ocultarlas para animarlas.
    document.documentElement.classList.add("js-activo");

    // Si el navegador no tiene IntersectionObserver, se muestran ya.
    if (!("IntersectionObserver" in window)) {
        lista.classList.add("amo-sin-animacion");
        return;
    }

    // ------------------------------------------------------------------
    // El retraso se acumula POR TANDA, no por tarjeta: con 50 tarjetas,
    // darle a cada una 160 ms más que la anterior haría esperar muchos
    // segundos. En su lugar, el contador se reinicia cada cierto número
    // de tarjetas para que el ritmo se vea fluido de principio a fin.
    // ------------------------------------------------------------------
    var POR_TANDA = 5;
    var PASO = 120;          // ms entre tarjeta y tarjeta dentro de la tanda
    var contador = 0;

    function mostrar(tarjeta) {
        if (tarjeta.classList.contains("amo-visible")) {
            return;
        }

        var posicionEnTanda = contador % POR_TANDA;
        contador++;

        tarjeta.style.transitionDelay = (posicionEnTanda * PASO) + "ms";
        tarjeta.classList.add("amo-visible");
    }

    var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) {
                return;
            }
            mostrar(entrada.target);
            observador.unobserve(entrada.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    });

    for (var t = 0; t < tarjetas.length; t++) {
        observador.observe(tarjetas[t]);

        // Red de seguridad: si una tarjeta ya está en pantalla al cargar
        // (o el observer no dispara por lo que sea), se muestra igual.
        (function (tarjeta) {
            setTimeout(function () {
                var r = tarjeta.getBoundingClientRect();
                var enPantalla = r.top < (window.innerHeight || 0) && r.bottom > 0;
                if (enPantalla) {
                    mostrar(tarjeta);
                }
            }, 300);
        })(tarjetas[t]);
    }
})();