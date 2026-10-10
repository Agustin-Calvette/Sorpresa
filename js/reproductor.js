/* ===========================================================
   REPRODUCTOR CON LETRA SINCRONIZADA 💗
   Muestra la letra de la canción y va resaltando (y centrando) la
   línea que corresponde al momento exacto en el que va sonando el
   audio. Es decir, la letra "avanza sola" junto con la música.

   Además de la letra, este reproductor tiene sus propios controles
   (play/pausa, barra de progreso, tiempo y velocidad) para que se
   vea bonito en cualquier navegador, sin depender de los controles
   grises que trae por defecto.

   ¿Cómo se escribe la letra?
   Cada línea tiene un tiempo (en segundos) y su texto. El tiempo es
   desde cuántos segundos empieza a sonar esa línea:

       { time: 12, text: "Aquí va la letra que suena en el segundo 12" },

   Para cambiar la canción solo hay que editar la ruta del <audio>
   en el HTML (dentro de #reproductor) y ajustar estos tiempos.
   =========================================================== */

(function () {
    "use strict";

    // ------------------ La letra y sus tiempos ------------------
    // Cambia estos textos por la letra real de tu canción.
    var LETRA = [
        { time: 4,  text: "Amé tu forma de reír," },
        { time: 7,  text: "cuando yo te conocí," },
        { time: 9, text: "y tu manera de llorar," },
        { time: 13, text: "cuando algo iba mal." },
        { time: 15, text: "También amé tu sonreír," },
        { time: 18, text: "cuando eras muy feliz," },
        { time: 20, text: "y tu manera de ocultar" },
        { time: 23, text: "las ganas hoy de llorar." },
        { time: 25, text: "Sé que nada ya diré," },
        { time: 28, text: "es muy fácil de entender," },
        { time: 31, text: "mi manera de pensar" },
        { time: 34, text: "no me deja razonar." },
        { time: 36, text: "Si pudiera algo hacer," },
        { time: 39, text: "haría algo por tu bien," },
        { time: 42, text: "solo te deseo abrazar," },
        { time: 43, text: "jamás te voy a olvidar. 💕" }
    ];

    // ------------------ Referencias del HTML ------------------
    var audio = document.getElementById("audio-musica");
    var contenedor = document.getElementById("lyrics");

    // Si esta página no tiene el reproductor, no hacemos nada.
    if (!audio || !contenedor) {
        return;
    }

    // Los controles del reproductor (están en el HTML, junto al audio)
    var botonPlay = document.getElementById("rp-play");
    var barra = document.getElementById("rp-barra");
    var relleno = document.getElementById("rp-relleno");
    var tiempoActual = document.getElementById("rp-tiempo");
    var duracion = document.getElementById("rp-duracion");
    var botonReiniciar = document.getElementById("rp-reiniciar");
    var velocidad = document.getElementById("rp-velocidad");

    var indiceActual = -1;
    var lineas = [];

    // ------------------ Dibujar las líneas ------------------
    LETRA.forEach(function (item, index) {
        var p = document.createElement("p");
        p.id = "line-" + index;
        p.className = "line";
        p.textContent = item.text;
        // Guardamos el índice para no tener que leerlo del id al hacer clic.
        p.setAttribute("data-index", index);
        contenedor.appendChild(p);
        lineas.push(p);
    });

    // ------------------ Sincronizar con el audio ------------------
    // Cada vez que el audio avanza, buscamos qué línea toca.
    audio.addEventListener("timeupdate", function () {
        var t = audio.currentTime;
        var activa = -1;

        for (var i = 0; i < LETRA.length; i++) {
            if (t >= LETRA[i].time) {
                activa = i;
            } else {
                break; // los tiempos van en orden, ya no hace falta seguir
            }
        }

        if (activa === indiceActual) {
            return; // seguimos en la misma línea: no hay nada que hacer
        }

        // Apagamos la línea anterior (si había una)
        if (indiceActual !== -1 && lineas[indiceActual]) {
            lineas[indiceActual].classList.remove("active");
        }

        // Encendemos y centramos la línea nueva
        if (activa !== -1 && lineas[activa]) {
            lineas[activa].classList.add("active");
            centrarLinea(lineas[activa]);
        }

        indiceActual = activa;
    });

    // Centra la línea activa dentro del recuadro de la letra.
    // En vez de scrollIntoView (que arrastra toda la página), movemos
    // solo el scroll interno del contenedor: así la página no salta.
    function centrarLinea(linea) {
        // Posición de la línea medida DENTRO del contenedor (independiente
        // del scroll que tenga ahora mismo), para que el cálculo sea estable.
        // Dentro del área con scroll, el padding-top del contenedor también
        // cuenta como desplazamiento, así que lo restamos.
        var paddingTop = parseFloat(getComputedStyle(contenedor).paddingTop) || 0;
        var posicionLinea = linea.offsetTop - contenedor.offsetTop - paddingTop;

        // Queremos que la línea quede en el centro del recuadro visible.
        var destino = posicionLinea - contenedor.clientHeight / 2 + linea.offsetHeight / 2;

        // Nunca por debajo de 0 ni por encima del scroll máximo posible:
        // así, al empezar la canción, la primera línea no "salta" al fondo.
        var scrollMaximo = contenedor.scrollHeight - contenedor.clientHeight;
        if (destino < 0) {
            destino = 0;
        }
        if (destino > scrollMaximo) {
            destino = scrollMaximo;
        }

        contenedor.scrollTo({ top: destino, behavior: "smooth" });
    }

    // ------------------ Bonus: clic en una línea salta a ese punto ------------
    // Si la persona toca una línea de la letra, el audio salta a ese momento.
    contenedor.addEventListener("click", function (evento) {
        var objetivo = evento.target.closest(".line");
        if (!objetivo) {
            return;
        }
        var indice = parseInt(objetivo.getAttribute("data-index"), 10);
        if (!isNaN(indice) && LETRA[indice]) {
            audio.currentTime = LETRA[indice].time;
            var intento = audio.play();
            if (intento && typeof intento.catch === "function") {
                intento.catch(function () {});
            }
        }
    });

    // ------------------ Controles propios ------------------
    function formatearTiempo(segundos) {
        if (!isFinite(segundos) || segundos < 0) {
            return "0:00";
        }
        var total = Math.floor(segundos);
        var min = Math.floor(total / 60);
        var seg = total % 60;
        return min + ":" + (seg < 10 ? "0" : "") + seg;
    }

    function pintarProgreso() {
        if (!barra) {
            return;
        }
        var duracionTotal = audio.duration || 0;
        var avance = duracionTotal ? (audio.currentTime / duracionTotal) * 100 : 0;
        if (relleno) {
            relleno.style.width = avance + "%";
        }
        barra.setAttribute("aria-valuenow", Math.round(avance));
        if (tiempoActual) {
            tiempoActual.textContent = formatearTiempo(audio.currentTime);
        }
        if (duracion) {
            duracion.textContent = formatearTiempo(duracionTotal);
        }
    }

    function pintarPlay() {
        if (!botonPlay) {
            return;
        }
        var sonando = !audio.paused && !audio.ended;
        botonPlay.classList.toggle("rp-sonando", sonando);
        botonPlay.setAttribute("aria-label", sonando ? "Pausar" : "Reproducir");
        botonPlay.innerHTML = sonando
            ? '<span class="rp-icono" aria-hidden="true">&#10074;&#10074;</span>'
            : '<span class="rp-icono" aria-hidden="true">&#9654;</span>';
    }

    if (botonPlay) {
        botonPlay.addEventListener("click", function () {
            if (audio.paused || audio.ended) {
                var intento = audio.play();
                if (intento && typeof intento.catch === "function") {
                    intento.catch(function () {});
                }
            } else {
                audio.pause();
            }
        });
    }

    // Clic (o arrastre) sobre la barra para saltar a ese momento
    if (barra) {
        function saltarPorPosicion(clienteX) {
            var caja = barra.getBoundingClientRect();
            if (!caja.width || !audio.duration) {
                return;
            }
            var proporcion = (clienteX - caja.left) / caja.width;
            proporcion = Math.max(0, Math.min(1, proporcion));
            audio.currentTime = proporcion * audio.duration;
            pintarProgreso();
        }

        barra.addEventListener("click", function (evento) {
            saltarPorPosicion(evento.clientX);
        });

        barra.addEventListener("keydown", function (evento) {
            if (!audio.duration) {
                return;
            }
            if (evento.key === "ArrowRight") {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            } else if (evento.key === "ArrowLeft") {
                audio.currentTime = Math.max(0, audio.currentTime - 5);
            }
        });
    }

    if (botonReiniciar) {
        botonReiniciar.addEventListener("click", function () {
            audio.currentTime = 0;
            pintarProgreso();
        });
    }

    if (velocidad) {
        velocidad.addEventListener("change", function () {
            audio.playbackRate = parseFloat(velocidad.value) || 1;
        });
    }

    audio.addEventListener("loadedmetadata", pintarProgreso);
    audio.addEventListener("timeupdate", pintarProgreso);
    audio.addEventListener("durationchange", pintarProgreso);
    audio.addEventListener("play", pintarPlay);
    audio.addEventListener("pause", pintarPlay);
    audio.addEventListener("ended", pintarPlay);

    pintarProgreso();
    pintarPlay();
})();
