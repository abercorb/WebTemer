document.addEventListener("DOMContentLoaded", function () {
    const formularioContacto = document.getElementById("form_contacto");
    const formularioPerfil = document.getElementById("form_perfil");
    const mensajeExitoContacto = document.getElementById("exito_contacto");
    const mensajeExitoPerfil = document.getElementById("exito_perfil");
    const contenedorResumenPerfil = document.getElementById("resumen_perfil");
    const contenidoResumen = document.getElementById("resumen_contenido");
    const contenedorRecomendaciones = document.getElementById("recomendaciones");
    const formularioTestimonio = document.getElementById("form_testimonio");
    const contenedorListaTestimonios = document.getElementById("testimonios_lista");

    inicializarPagina();

    function inicializarPagina() {
        cargarTestimoniosDelServidor();
        configurarOyentesFormularios();
    }

    function configurarOyentesFormularios() {
        formularioContacto.addEventListener("submit", manejarEnvioContacto);
        formularioPerfil.addEventListener("submit", manejarEnvioPerfil);

        if (formularioTestimonio) {
            formularioTestimonio.addEventListener('submit', manejarEnvioTestimonio);
        }
    }

    async function manejarEnvioContacto(evento) {
        evento.preventDefault();
        limpiarMensajesError(formularioContacto);

        const nombre = document.getElementById("contacto_nombre").value.trim();
        const email = document.getElementById("contacto_email").value.trim();
        const tema = document.getElementById("contacto_tema").value;
        const mensaje = document.getElementById("contacto_mensaje").value.trim();

        if (!validarFormularioContacto(nombre, email, tema, mensaje)) {
            return;
        }

        try {
            await enviarDatosContacto({ nombre, email, tema, mensaje });
            formularioContacto.reset();
            formularioContacto.style.display = "none";
            mensajeExitoContacto.classList.remove("oculto");
        } catch (error) {
            console.error("Error envío contacto:", error);
            alert("Error al enviar el formulario. Inténtalo de nuevo.");
        }
    }

    function validarFormularioContacto(nombre, email, tema, mensaje) {
        let esValido = true;

        if (!nombre || nombre.length < 2) {
            mostrarErrorCampo("contacto_nombre", "error_nombre", "El nombre debe tener al menos 2 caracteres");
            esValido = false;
        }

        if (!email || !esEmailValido(email)) {
            mostrarErrorCampo("contacto_email", "error_email", "Introduce un email válido");
            esValido = false;
        }

        if (!tema) {
            mostrarErrorCampo("contacto_tema", "error_tema", "Selecciona un tema");
            esValido = false;
        }

        if (!mensaje || mensaje.length < 20) {
            mostrarErrorCampo("contacto_mensaje", "error_mensaje", "El mensaje debe tener al menos 20 caracteres");
            esValido = false;
        }

        return esValido;
    }

    async function enviarDatosContacto(datos) {
        const respuesta = await fetch("/contacto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (!respuesta.ok) throw new Error("Error en respuesta servidor");
        return respuesta;
    }

    async function manejarEnvioPerfil(evento) {
        evento.preventDefault();
        limpiarMensajesError(formularioPerfil);

        const deporte = document.getElementById("perfil_deporte").value;
        const nivel = document.getElementById("perfil_nivel").value;
        const frecuencia = document.getElementById("perfil_frecuencia").value;
        const objetivosSeleccionados = Array.from(
            formularioPerfil.querySelectorAll('input[name="objetivos"]:checked')
        ).map((checkbox) => checkbox.value);

        if (!validarFormularioPerfil(deporte, nivel, frecuencia)) {
            return;
        }

        try {
            await enviarDatosPerfil({ deporte, nivel, frecuencia, objetivos: objetivosSeleccionados });
            mensajeExitoPerfil.classList.remove("oculto");
            mostrarResumenYRecomendaciones(deporte, nivel, frecuencia, objetivosSeleccionados);
        } catch (error) {
            console.error("Error envío perfil:", error);
            alert("Error al guardar el perfil. Inténtalo de nuevo.");
        }
    }

    function validarFormularioPerfil(deporte, nivel, frecuencia) {
        let esValido = true;

        if (!deporte) {
            mostrarErrorCampo("perfil_deporte", "error_deporte", "Selecciona tu deporte principal");
            esValido = false;
        }
        if (!nivel) {
            mostrarErrorCampo("perfil_nivel", "error_nivel", "Selecciona tu nivel");
            esValido = false;
        }
        if (!frecuencia) {
            mostrarErrorCampo("perfil_frecuencia", "error_frecuencia", "Selecciona tu frecuencia");
            esValido = false;
        }

        return esValido;
    }

    async function enviarDatosPerfil(datos) {
        const respuesta = await fetch("/perfil", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (!respuesta.ok) throw new Error("Error en respuesta servidor");
        return respuesta;
    }

    function mostrarResumenYRecomendaciones(deporte, nivel, frecuencia, objetivos) {
        const mapaDeportes = {
            running: "Running",
            gym: "Gimnasio",
            senderismo: "Senderismo / Montaña",
            ciclismo: "Ciclismo",
            yoga: "Yoga / Pilates",
            natacion: "Natación",
            otro: "Otro",
        };
        const mapaNiveles = {
            principiante: "Principiante",
            intermedio: "Intermedio",
            avanzado: "Avanzado",
        };
        const mapaFrecuencias = {
            "1-2": "1-2 veces por semana",
            "3-4": "3-4 veces por semana",
            "5+": "5 o más veces por semana",
        };
        const mapaObjetivos = {
            salud: "Mejorar salud",
            rendimiento: "Mejorar rendimiento",
            huella: "Reducir huella ambiental",
            bienestar: "Bienestar mental",
        };

        contenidoResumen.innerHTML = `
            <p><strong>Deporte:</strong> ${mapaDeportes[deporte]}</p>
            <p><strong>Nivel:</strong> ${mapaNiveles[nivel]}</p>
            <p><strong>Frecuencia:</strong> ${mapaFrecuencias[frecuencia]}</p>
            ${objetivos.length > 0 ? `<p><strong>Objetivos:</strong> ${objetivos.map(o => mapaObjetivos[o]).join(", ")}</p>` : ""}
        `;

        generarRecomendaciones(deporte, objetivos);
        contenedorResumenPerfil.classList.remove("oculto");
    }

    function generarRecomendaciones(deporte, objetivos) {
        let textoHTML = "";

        if (deporte === "running" || deporte === "senderismo") {
            textoHTML = 'Te recomendamos ver nuestras <a href="productos.html">zapatillas EcoRun</a> y ropa técnica sostenible.';
        } else if (deporte === "gym" || deporte === "yoga") {
            textoHTML = 'Echa un vistazo a nuestra <a href="productos.html">esterilla de yoga reciclada</a> y accesorios de gym.';
        } else {
            textoHTML = 'Explora todo nuestro <a href="productos.html">catálogo de productos sostenibles</a>.';
        }

        if (objetivos.includes("huella")) {
            textoHTML += " Todos nuestros productos muestran el CO₂ ahorrado respecto a alternativas convencionales.";
        }

        contenedorRecomendaciones.innerHTML = `
            <h4>Recomendaciones para ti</h4>
            <p>${textoHTML}</p>
        `;
    }

    async function manejarEnvioTestimonio(evento) {
        evento.preventDefault();
        const nombre = document.getElementById('testimonio_nombre').value.trim();
        const deporte = document.getElementById('testimonio_deporte').value;
        const texto = document.getElementById('testimonio_texto').value.trim();

        if (nombre && deporte && texto) {
            try {
                await enviarTestimonio({ nombre, deporte, texto });
                formularioTestimonio.reset();
                cargarTestimoniosDelServidor();
            } catch (error) {
                console.error('Error envío testimonio:', error);
                alert("Error al guardar el testimonio.");
            }
        }
    }

    async function enviarTestimonio(datos) {
        const respuesta = await fetch("/testimonios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) throw new Error("Error en respuesta servidor");
        return respuesta;
    }

    async function cargarTestimoniosDelServidor() {
        try {
            const respuesta = await fetch("/testimonios");
            const listaTestimonios = await respuesta.json();

            if (listaTestimonios.length === 0) {
                mostrarTestimoniosVacios();
                return;
            }
            renderizarTestimonios(listaTestimonios);
        } catch (error) {
            console.error('Error al cargar testimonios:', error);
            contenedorListaTestimonios.innerHTML = '<p class="testimonios_vacio">Error al cargar testimonios.</p>';
        }
    }

    function mostrarTestimoniosVacios() {
        contenedorListaTestimonios.innerHTML = '<p class="testimonios_vacio">Sé el primero en compartir tu experiencia.</p>';
    }

    function renderizarTestimonios(testimonios) {
        contenedorListaTestimonios.innerHTML = testimonios.map(crearHTMLTestimonio).join('');
    }

    function crearHTMLTestimonio(testimonio) {
        const iniciales = testimonio.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        return `
            <article class="testimonio_card">
                <div class="testimonio_avatar">${iniciales}</div>
                <div class="testimonio_contenido">
                    <p class="testimonio_texto">${testimonio.texto}</p>
                    <div class="testimonio_autor">
                        <div class="testimonio_info">
                            <span class="testimonio_nombre">${testimonio.nombre}</span>
                            <span class="testimonio_deporte">${testimonio.deporte}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function esEmailValido(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function mostrarErrorCampo(campoId, errorId, mensaje) {
        const campoInput = document.getElementById(campoId);
        const elementoError = document.getElementById(errorId);
        campoInput.classList.add("invalido");
        elementoError.textContent = mensaje;
    }

    function limpiarMensajesError(formulario) {
        formulario.querySelectorAll(".invalido").forEach((elemento) => {
            elemento.classList.remove("invalido");
        });
        formulario.querySelectorAll(".error").forEach((elemento) => {
            elemento.textContent = "";
        });
    }
});
