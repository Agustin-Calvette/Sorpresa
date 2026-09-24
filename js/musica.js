/* ===========================================================
   MÚSICA DE FONDO 💗
   Intenta que la canción suene sola al entrar a la página.

   IMPORTANTE: los navegadores (Chrome, Safari, Firefox) BLOQUEAN
   el audio automático si la persona no ha tocado la pantalla antes.
   Es una regla de ellos, no un fallo del código.

   Por eso este reproductor hace lo siguiente:
     1) Al cargar, intenta reproducir sola.
     2) Si el navegador la bloquea, se queda un botón flotante
        con un corazón para que la persona solo tenga que tocarlo.

   Coloca tu canción en audio/cancion.mp3 (mira audio/LEEME.txt).
   Para cambiar la canción o el volumen, toca los ajustes de abajo.
   =========================================================== */

(function () {
    "use strict";

    // ------------------ Ajustes ------------------
    var CANCION = "audio/cancion.mp3";
    var VOLUMEN = 0.45;          // de 0 (silencio) a 1 (máximo)
    var EMPEZAR_EN = 0;          // segundo en el que arranca la canción
    var RECORDAR = true;         // recordar si la persona apagó la música

    // La ruta cambia según la página: en html/regalos.html hay que
    // subir un nivel para llegar a audio/
    var enSubcarpeta = /\/html\//.test(window.location.pathname) ||
        /\\html\\/.test(window.location.pathname);
    var rutaCancion = (enSubcarpeta ? "../" : "") + CANCION;

    // ------------------ Recordar la preferencia ------------------
    var CLAVE = "sorpresa-musica-apagada";
    var musicaApagada = false;
    if (RECORDAR) {
        try {
            musicaApagada = window.localStorage.getItem(CLAVE) === "1";
        } catch (e) {
            musicaApagada = false;
        }
    }

    // ------------------ El elemento de audio ------------------
    var audio = document.createElement("audio");
    audio.src = rutaCancion;
    audio.loop = true;            // se repite sola
    audio.preload = "auto";
    audio.volume = VOLUMEN;

    // ------------------ El botón flotante ------------------
    var boton = document.createElement("button");
    boton.className = "boton-musica";
    boton.type = "button";
    boton.setAttribute("aria-label", "Música de fondo");

    // Corazón + las barritas de "sonando"
    boton.innerHTML =
        '<span class="musica-corazon" aria-hidden="true">&#10084;</span>' +
        '<span class="musica-barras" aria-hidden="true">' +
        '<i></i><i></i><i></i>' +
        "</span>";

    function pintarBoton(sonando) {
        boton.classList.toggle("musica-activa", sonando);
        boton.setAttribute(
            "aria-label",
            sonando ? "Pausar la música" : "Reproducir la música"
        );
    }

    // ------------------ Reproducir / pausar ------------------
    function reproducir() {
        var intento = audio.play();
        if (intento && typeof intento.then === "function") {
            intento.then(function () {
                pintarBoton(true);
            }).catch(function () {
                // El navegador la bloqueó: se queda el botón para que la toque
                pintarBoton(false);
                boton.classList.add("musica-atencion");
            });
        } else {
            pintarBoton(true);
        }
    }

    function pausar() {
        audio.pause();
        pintarBoton(false);
    }

    boton.addEventListener("click", function () {
        boton.classList.remove("musica-atencion");
        if (audio.paused) {
            musicaApagada = false;
            guardarPreferencia();
            reproducir();
        } else {
            musicaApagada = true;
            guardarPreferencia();
            pausar();
        }
    });

    function guardarPreferencia() {
        if (!RECORDAR) {
            return;
        }
        try {
            window.localStorage.setItem(CLAVE, musicaApagada ? "1" : "0");
        } catch (e) {
            // Si el navegador no deja guardar, no pasa nada
        }
    }

    // ------------------ Arranque ------------------
    function iniciar() {
        // Si ya hay otra pestaña sonando lo mismo, no la duplicamos
        if (audio.currentTime < EMPEZAR_EN) {
            audio.currentTime = EMPEZAR_EN;
        }

        document.body.appendChild(audio);
        document.body.appendChild(boton);

        // Al terminar de cargar los datos, quizá haya que saltar al segundo
        audio.addEventListener("loadedmetadata", function () {
            if (audio.currentTime < EMPEZAR_EN) {
                audio.currentTime = EMPEZAR_EN;
            }
        });

        // Reflejamos el estado real del audio en el botón
        audio.addEventListener("play", function () {
            pintarBoton(true);
        });
        audio.addEventListener("pause", function () {
            pintarBoton(false);
        });

        // Si la canción no existe todavía, avisamos en consola y no
        // mostramos el botón (así no queda un corazón inútil)
        audio.addEventListener("error", function () {
            boton.remove();
            console.warn(
                "No se encontró la música. Pon tu archivo en: " + rutaCancion
            );
        });

        if (musicaApagada) {
            pintarBoton(false);
            return;
        }

        // Primer intento: sola al entrar
        reproducir();

        // Segundo intento: el navegador deja sonar en el primer toque o
        // primer clic en la página. Con esto es muy probable que suene
        // sin que la persona haga nada especial.
        function intentarTrasInteraccion() {
            if (audio.paused && !musicaApagada) {
                reproducir();
            }
            document.removeEventListener("click", intentarTrasInteraccion);
            document.removeEventListener("touchstart", intentarTrasInteraccion);
            document.removeEventListener("keydown", intentarTrasInteraccion);
        }

        document.addEventListener("click", intentarTrasInteraccion);
        document.addEventListener("touchstart", intentarTrasInteraccion, { passive: true });
        document.addEventListener("keydown", intentarTrasInteraccion);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();