document.addEventListener("DOMContentLoaded", function () {
    // ============================================================
    // Elementos del DOM
    // ============================================================
    const formContacto = document.getElementById("form_contacto");
    const formPerfil = document.getElementById("form_perfil");
    const exitoContacto = document.getElementById("exito_contacto");
    const exitoPerfil = document.getElementById("exito_perfil");
    const resumenPerfil = document.getElementById("resumen_perfil");
    const resumenContenido = document.getElementById("resumen_contenido");
    const recomendaciones = document.getElementById("recomendaciones");
    const formTestimonio = document.getElementById("form_testimonio");
    const testimoniosLista = document.getElementById("testimonios_lista");

    // Cargar testimonios al iniciar
    cargarTestimonios();


    // ============================================================
    // Validación del formulario de contacto
    // ============================================================
    formContacto.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Limpiar errores previos
        limpiarErrores(formContacto);

        // Obtener valores
        const nombre = document.getElementById("contacto_nombre").value.trim();
        const email = document.getElementById("contacto_email").value.trim();
        const tema = document.getElementById("contacto_tema").value;
        const mensaje = document.getElementById("contacto_mensaje").value.trim();

        let esValido = true;

        // Validar nombre
        if (!nombre) {
            mostrarError("contacto_nombre", "error_nombre", "El nombre es obligatorio");
            esValido = false;
        } else if (nombre.length < 2) {
            mostrarError("contacto_nombre", "error_nombre", "El nombre debe tener al menos 2 caracteres");
            esValido = false;
        }

        // Validar email
        if (!email) {
            mostrarError("contacto_email", "error_email", "El email es obligatorio");
            esValido = false;
        } else if (!validarEmail(email)) {
            mostrarError("contacto_email", "error_email", "Introduce un email válido");
            esValido = false;
        }

        // Validar tema
        if (!tema) {
            mostrarError("contacto_tema", "error_tema", "Selecciona un tema");
            esValido = false;
        }

        // Validar mensaje
        if (!mensaje) {
            mostrarError("contacto_mensaje", "error_mensaje", "El mensaje es obligatorio");
            esValido = false;
        } else if (mensaje.length < 20) {
            mostrarError("contacto_mensaje", "error_mensaje", "El mensaje debe tener al menos 20 caracteres");
            esValido = false;
        }

        if (!esValido) return;

        // Enviar al servidor
        try {
            const respuesta = await fetch("/contacto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, tema, mensaje }),
            });

            if (respuesta.ok) {
                formContacto.reset();
                formContacto.style.display = "none";
                exitoContacto.classList.remove("oculto");
            } else {
                alert("Error al enviar el formulario. Inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión. Inténtalo de nuevo.");
        }
    });

    // ============================================================
    // Validación del formulario de perfil deportivo
    // ============================================================
    formPerfil.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Limpiar errores previos
        limpiarErrores(formPerfil);

        // Obtener valores
        const deporte = document.getElementById("perfil_deporte").value;
        const nivel = document.getElementById("perfil_nivel").value;
        const frecuencia = document.getElementById("perfil_frecuencia").value;
        const objetivos = Array.from(
            formPerfil.querySelectorAll('input[name="objetivos"]:checked')
        ).map((cb) => cb.value);

        let esValido = true;

        // Validar deporte
        if (!deporte) {
            mostrarError("perfil_deporte", "error_deporte", "Selecciona tu deporte principal");
            esValido = false;
        }

        // Validar nivel
        if (!nivel) {
            mostrarError("perfil_nivel", "error_nivel", "Selecciona tu nivel");
            esValido = false;
        }

        // Validar frecuencia
        if (!frecuencia) {
            mostrarError("perfil_frecuencia", "error_frecuencia", "Selecciona tu frecuencia");
            esValido = false;
        }

        if (!esValido) return;

        // Enviar al servidor
        try {
            const respuesta = await fetch("/perfil", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deporte, nivel, frecuencia, objetivos }),
            });

            if (respuesta.ok) {
                exitoPerfil.classList.remove("oculto");
                mostrarResumenPerfil(deporte, nivel, frecuencia, objetivos);
            } else {
                alert("Error al guardar el perfil. Inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión. Inténtalo de nuevo.");
        }
    });

    // ============================================================
    // Funciones auxiliares
    // ============================================================
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function mostrarError(campoId, errorId, mensaje) {
        const campo = document.getElementById(campoId);
        const error = document.getElementById(errorId);
        campo.classList.add("invalido");
        error.textContent = mensaje;
    }

    function limpiarErrores(formulario) {
        formulario.querySelectorAll(".invalido").forEach((el) => {
            el.classList.remove("invalido");
        });
        formulario.querySelectorAll(".error").forEach((el) => {
            el.textContent = "";
        });
    }

    function mostrarResumenPerfil(deporte, nivel, frecuencia, objetivos) {
        const deporteTexto = {
            running: "Running",
            gym: "Gimnasio",
            senderismo: "Senderismo / Montaña",
            ciclismo: "Ciclismo",
            yoga: "Yoga / Pilates",
            natacion: "Natación",
            otro: "Otro",
        };

        const nivelTexto = {
            principiante: "Principiante",
            intermedio: "Intermedio",
            avanzado: "Avanzado",
        };

        const frecuenciaTexto = {
            "1-2": "1-2 veces por semana",
            "3-4": "3-4 veces por semana",
            "5+": "5 o más veces por semana",
        };

        const objetivosTexto = {
            salud: "Mejorar salud",
            rendimiento: "Mejorar rendimiento",
            huella: "Reducir huella ambiental",
            bienestar: "Bienestar mental",
        };

        // Mostrar resumen
        resumenContenido.innerHTML = `
      <p><strong>Deporte:</strong> ${deporteTexto[deporte]}</p>
      <p><strong>Nivel:</strong> ${nivelTexto[nivel]}</p>
      <p><strong>Frecuencia:</strong> ${frecuenciaTexto[frecuencia]}</p>
      ${objetivos.length > 0 ? `<p><strong>Objetivos:</strong> ${objetivos.map((o) => objetivosTexto[o]).join(", ")}</p>` : ""}
    `;

        // Generar recomendaciones
        let recomendacionTexto = "";

        if (deporte === "running" || deporte === "senderismo") {
            recomendacionTexto = 'Te recomendamos ver nuestras <a href="productos.html">zapatillas EcoRun</a> y ropa técnica sostenible.';
        } else if (deporte === "gym" || deporte === "yoga") {
            recomendacionTexto = 'Echa un vistazo a nuestra <a href="productos.html">esterilla de yoga reciclada</a> y accesorios de gym.';
        } else {
            recomendacionTexto = 'Explora todo nuestro <a href="productos.html">catálogo de productos sostenibles</a>.';
        }

        if (objetivos.includes("huella")) {
            recomendacionTexto += " Todos nuestros productos muestran el CO₂ ahorrado respecto a alternativas convencionales.";
        }

        recomendaciones.innerHTML = `
      <h4>Recomendaciones para ti</h4>
      <p>${recomendacionTexto}</p>
    `;

        resumenPerfil.classList.remove("oculto");
    }

    // ============================================================
    // Gestión de testimonios (API del servidor)
    // ============================================================

    async function cargarTestimonios() {
        try {
            const respuesta = await fetch("/testimonios");
            const testimonios = await respuesta.json();

            if (testimonios.length === 0) {
                testimoniosLista.innerHTML = '<p class="testimonios_vacio">Sé el primero en compartir tu experiencia.</p>';
                return;
            }

            testimoniosLista.innerHTML = testimonios.map(t => {
                const iniciales = t.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                return `
                    <article class="testimonio_card">
                        <div class="testimonio_avatar">${iniciales}</div>
                        <div class="testimonio_contenido">
                            <p class="testimonio_texto">${t.texto}</p>
                            <div class="testimonio_autor">
                                <div class="testimonio_info">
                                    <span class="testimonio_nombre">${t.nombre}</span>
                                    <span class="testimonio_deporte">${t.deporte}</span>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (error) {
            console.error('Error al cargar testimonios:', error);
            testimoniosLista.innerHTML = '<p class="testimonios_vacio">Error al cargar testimonios.</p>';
        }
    }

    // Event listener para formulario de testimonio
    if (formTestimonio) {
        formTestimonio.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nombre = document.getElementById('testimonio_nombre').value.trim();
            const deporte = document.getElementById('testimonio_deporte').value;
            const texto = document.getElementById('testimonio_texto').value.trim();

            if (nombre && deporte && texto) {
                try {
                    const respuesta = await fetch("/testimonios", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nombre, deporte, texto })
                    });

                    if (respuesta.ok) {
                        formTestimonio.reset();
                        cargarTestimonios(); // Recargar lista
                    } else {
                        alert("Error al guardar el testimonio.");
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert("Error de conexión.");
                }
            }
        });
    }
});

