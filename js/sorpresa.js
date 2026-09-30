/* ===========================================================
   CAJA DE REGALO - sorpresita escondida 💗
   Al tocar la caja se abre (clase .caja-abierta), saltan unos
   corazones y aparece un mensaje. Al volver a tocarla se cierra.

   Se puede usar con ratón, con el dedo (celular) y con el teclado
   (Enter / Espacio), porque la caja es un <button> de verdad.
   =========================================================== */

(function () {
    "use strict";

    var caja = document.getElementById("caja-regalo");
    var contenedorCorazones = document.getElementById("caja-corazones");

    if (!caja) {
        return;
    }

    // Cuántos corazones salen disparados al abrir
    var NUM_CORAZONES = 12;

    // Imágenes de corazoncitos que ya tiene el proyecto (se eligen al azar)
    var CORAZONES = [
        "../img/elementos/corazoncito1.png",
        "../img/elementos/corazoncito2.png",
        "../img/elementos/corazoncito3.png",
        "../img/elementos/corazoncito4.png"
    ];

    // Crea los corazones una sola vez y los deja listos (invisibles)
    // para no tener que crearlos en cada apertura.
    function prepararCorazones() {
        if (!contenedorCorazones) {
            return;
        }
        contenedorCorazones.innerHTML = "";

        for (var i = 0; i < NUM_CORAZONES; i++) {
            var img = document.createElement("img");
            img.src = CORAZONES[i % CORAZONES.length];
            img.alt = "";
            img.className = "caja-corazon";

            // Ángulo y distancia repartidos en abanico alrededor de la caja
            var angulo = (i / NUM_CORAZONES) * 360 + (Math.random() * 20 - 10);
            var distancia = 70 + Math.random() * 70;

            img.style.setProperty("--angulo", angulo + "deg");
            img.style.setProperty("--distancia", distancia + "px");
            img.style.setProperty("--giro", (Math.random() * 60 - 30) + "deg");
            img.style.setProperty("--retraso", (Math.random() * 0.15) + "s");

            contenedorCorazones.appendChild(img);
        }
    }

    // Lanza (reinicia) la animación de los corazones
    function lanzarCorazones() {
        if (!contenedorCorazones) {
            return;
        }
        var corazones = contenedorCorazones.querySelectorAll(".caja-corazon");
        for (var i = 0; i < corazones.length; i++) {
            // Quitar y volver a poner la clase fuerza a repetir la animación
            corazones[i].classList.remove("caja-corazon-sale");
            void corazones[i].offsetWidth;
            corazones[i].classList.add("caja-corazon-sale");
        }
    }

    function estaAbierta() {
        return caja.classList.contains("caja-abierta");
    }

    function abrir() {
        caja.classList.add("caja-abierta");
        caja.setAttribute("aria-expanded", "true");
        caja.setAttribute("aria-label", "Cerrar la cajita");
        lanzarCorazones();
    }

    function cerrar() {
        caja.classList.remove("caja-abierta");
        caja.setAttribute("aria-expanded", "false");
        caja.setAttribute("aria-label", "Abrir la cajita de regalo");
    }

    // Alterna abrir / cerrar
    caja.addEventListener("click", function () {
        if (estaAbierta()) {
            cerrar();
        } else {
            abrir();
        }
    });

    // Con el teclado, el <button> ya dispara "click" con Enter y Espacio,
    // así que no hace falta más. Se prepara todo al cargar.
    caja.setAttribute("aria-label", "Abrir la cajita de regalo");
    prepararCorazones();
})();