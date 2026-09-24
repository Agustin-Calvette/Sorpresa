/* ===========================================================
   LIGHTBOX - ver los regalos en pantalla completa 💗
   Al hacer clic en la imagen de un regalo, se abre a pantalla
   completa para leerlo con más comodidad.

   Funciona en index.html y en html/regalos.html sin cambiar el
   HTML: se activa solo en las imágenes que están dentro de las
   tarjetas de regalo (.carta-diseño).
   =========================================================== */

(function () {
    "use strict";

    // Imágenes que pueden ampliarse: las de dentro de las tarjetas
    var imagenes = document.querySelectorAll(".carta-diseño img");
    if (imagenes.length === 0) {
        return;
    }

    // ------------------ Crear la ventana (overlay) ------------------
    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Regalo en pantalla completa");

    // Botón de cerrar
    var botonCerrar = document.createElement("button");
    botonCerrar.className = "lightbox-cerrar";
    botonCerrar.type = "button";
    botonCerrar.setAttribute("aria-label", "Cerrar");
    botonCerrar.innerHTML = "&times;";

    // La imagen ampliada
    var imagenGrande = document.createElement("img");
    imagenGrande.className = "lightbox-imagen";
    imagenGrande.alt = "";

    // Flechas para pasar de un regalo a otro
    var botonAnterior = document.createElement("button");
    botonAnterior.className = "lightbox-flecha lightbox-anterior";
    botonAnterior.type = "button";
    botonAnterior.setAttribute("aria-label", "Regalo anterior");
    botonAnterior.innerHTML = "&#8249;";

    var botonSiguiente = document.createElement("button");
    botonSiguiente.className = "lightbox-flecha lightbox-siguiente";
    botonSiguiente.type = "button";
    botonSiguiente.setAttribute("aria-label", "Regalo siguiente");
    botonSiguiente.innerHTML = "&#8250;";

    // Texto con el nombre del regalo (el <h3> de la tarjeta, si existe)
    var titulo = document.createElement("p");
    titulo.className = "lightbox-titulo";

    overlay.appendChild(botonCerrar);
    overlay.appendChild(botonAnterior);
    overlay.appendChild(imagenGrande);
    overlay.appendChild(botonSiguiente);
    overlay.appendChild(titulo);

    // ------------------ Estado ------------------
    var indiceActual = 0;

    // ------------------ Abrir / cerrar ------------------

    // Coloca la imagen y el título de un regalo, sin animación.
    // Se usa internamente y también al abrir.
    function ponerContenido(indice) {
        indiceActual = (indice + imagenes.length) % imagenes.length;

        var img = imagenes[indiceActual];
        imagenGrande.alt = img.alt || "Regalo";

        // Si la tarjeta tiene un título (ej. "6 Meses"), lo mostramos
        var tarjeta = img.closest(".carta-diseño");
        var h3 = tarjeta ? tarjeta.querySelector("h3") : null;
        titulo.textContent = h3 ? h3.textContent.trim() : "";

        return img;
    }

    // Cambia de regalo CON animación: la imagen que entra lo hace desde el
    // lado contrario al que estás mirando. "direccion" es 1 (siguiente,
    // entra por la derecha) o -1 (anterior, entra por la izquierda).
    function mostrarConAnimacion(indice, direccion) {
        var img = ponerContenido(indice);

        // Reinicia la animación quitando y volviendo a poner la clase.
        // El "reflow" forzado (void offsetWidth) es necesario para que el
        // navegador note el cambio y vuelva a reproducir la animación.
        imagenGrande.classList.remove("lightbox-entra-izq", "lightbox-entra-der");
        void imagenGrande.offsetWidth;

        // La imagen nueva aún no se ha cargado: esperamos a que esté lista
        // para que la animación no muestre un hueco.
        function aplicar() {
            imagenGrande.src = img.src;
            imagenGrande.classList.add(
                direccion < 0 ? "lightbox-entra-izq" : "lightbox-entra-der"
            );
        }

        if (img.complete) {
            aplicar();
        } else {
            // Cargamos la nueva y aplicamos la animación al terminar
            imagenGrande.onload = aplicar;
            imagenGrande.onerror = aplicar;
        }
    }

    // Muestra sin animar (para la primera apertura del lightbox)
    function mostrar(indice) {
        var img = ponerContenido(indice);
        imagenGrande.classList.remove("lightbox-entra-izq", "lightbox-entra-der");
        imagenGrande.src = img.src;

        // Ocultar las flechas si solo hay una imagen
        var varias = imagenes.length > 1;
        botonAnterior.style.display = varias ? "" : "none";
        botonSiguiente.style.display = varias ? "" : "none";
    }

    function abrir(indice) {
        mostrar(indice);
        overlay.classList.add("lightbox-abierto");
        document.body.classList.add("con-lightbox");
        botonCerrar.focus();
    }

    function cerrar() {
        overlay.classList.remove("lightbox-abierto");
        document.body.classList.remove("con-lightbox");
        imagenGrande.classList.remove("lightbox-entra-izq", "lightbox-entra-der");
        // Se libera la imagen para no recargarla en cada apertura
        imagenGrande.src = "";
    }

    function estaAbierto() {
        return overlay.classList.contains("lightbox-abierto");
    }

    // ------------------ Eventos ------------------
    for (var i = 0; i < imagenes.length; i++) {
        (function (indice) {
            var img = imagenes[indice];
            img.classList.add("imagen-ampliable");
            img.setAttribute("tabindex", "0");
            img.setAttribute("role", "button");
            img.setAttribute("aria-label", "Ver este regalo en pantalla completa");

            img.addEventListener("click", function () {
                abrir(indice);
            });

            // También con Enter/Espacio, para quien navega con teclado
            img.addEventListener("keydown", function (evento) {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    abrir(indice);
                }
            });
        })(i);
    }

    botonCerrar.addEventListener("click", cerrar);
    botonAnterior.addEventListener("click", function (e) {
        e.stopPropagation();
        mostrarConAnimacion(indiceActual - 1, -1);
    });
    botonSiguiente.addEventListener("click", function (e) {
        e.stopPropagation();
        mostrarConAnimacion(indiceActual + 1, 1);
    });

    // Un clic en el fondo oscuro (no en la imagen) cierra
    overlay.addEventListener("click", function (evento) {
        if (evento.target === overlay) {
            cerrar();
        }
    });

    // Con el teclado: Esc cierra, flechas cambian de regalo
    document.addEventListener("keydown", function (evento) {
        if (!estaAbierto()) {
            return;
        }
        if (evento.key === "Escape") {
            cerrar();
        } else if (evento.key === "ArrowLeft") {
            mostrarConAnimacion(indiceActual - 1, -1);
        } else if (evento.key === "ArrowRight") {
            mostrarConAnimacion(indiceActual + 1, 1);
        }
    });

    // También se puede cerrar deslizando el dedo hacia abajo (celular)
    var yInicial = null;
    overlay.addEventListener("touchstart", function (evento) {
        yInicial = evento.touches[0].clientY;
    }, { passive: true });

    overlay.addEventListener("touchend", function (evento) {
        if (yInicial === null) {
            return;
        }
        var yFinal = evento.changedTouches[0].clientY;
        if (yFinal - yInicial > 90) {
            cerrar();
        }
        yInicial = null;
    }, { passive: true });

    document.body.appendChild(overlay);
})();