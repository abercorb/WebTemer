function validarEmail(valor) {
  // Expresión muy básica para validar formato de correo
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(valor);
}

function limpiarErrores() {
  const errores = document.querySelectorAll(".error");
  for (let i = 0; i < errores.length; i++) {
    errores[i].textContent = "";
  }

  const campos = document.querySelectorAll(".campo-error");
  for (let j = 0; j < campos.length; j++) {
    campos[j].classList.remove("campo-error");
  }
}

function mostrarError(idCampo, mensaje) {
  const spanError = document.getElementById("error-" + idCampo);
  const campo = document.getElementById(idCampo);

  if (spanError) {
    spanError.textContent = mensaje;
  }
  if (campo) {
    campo.classList.add("campo-error");
  }
}

function recogerDatosFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    email: document.getElementById("email").value.trim(),
    tipo: document.getElementById("tipo").value,
    mensaje: document.getElementById("mensaje").value.trim(),
    acepto: document.getElementById("acepto").checked,
  };
}

function validarFormulario(datos) {
  let esValido = true;

  if (datos.nombre.length < 2) {
    mostrarError("nombre", "Introduce un nombre válido (mínimo 2 caracteres).");
    esValido = false;
  }

  if (!validarEmail(datos.email)) {
    mostrarError("email", "Introduce un correo electrónico válido.");
    esValido = false;
  }

  if (datos.mensaje.length < 5) {
    mostrarError("mensaje", "El mensaje es demasiado corto.");
    esValido = false;
  }

  if (!datos.acepto) {
    mostrarError("acepto", "Debes aceptar la política de privacidad.");
    esValido = false;
  }

  return esValido;
}

function enviarDatosAlServidor(datos) {
  const estadoEnvio = document.getElementById("estado-envio");
  estadoEnvio.textContent = "Enviando...";

  // Enviar mediante fetch al backend Node (ruta definida en rutas-usuario.js)
  fetch("/usuario/contacto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  })
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return respuesta.json();
    })
    .then(function (json) {
      estadoEnvio.textContent = json.mensaje || "Mensaje enviado correctamente.";
      document.getElementById("form-contacto").reset();
    })
    .catch(function (error) {
      console.error(error);
      estadoEnvio.textContent =
        "Se ha producido un error al enviar el formulario. Inténtalo de nuevo.";
    });
}

// Asociar comportamiento al cargar la página
window.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-contacto");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Evita envío por defecto

    limpiarErrores();

    const datos = recogerDatosFormulario();

    if (validarFormulario(datos)) {
      enviarDatosAlServidor(datos);
    }
  });
});