// Este archivo maneja los botones y llama a nuestro proxy de Node.
// Objetivo: leer la ciudad, consultar /proxy-aire o /proxy-temperatura y mostrar el resultado.

const formulario = document.getElementById("ciudad-form");
const informacion = document.getElementById("informacion");
const btnAire = document.getElementById("btn-aire");
const btnTemperatura = document.getElementById("btn-temperatura");

// Evitar que el form recargue la página si alguien presiona Enter
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
});

btnAire.addEventListener("click", function () {
  const ciudad = leerCiudad();
  if (!ciudad) return;
  mostrarMensaje("Buscando calidad del aire...");
  consultarAire(ciudad);
});

btnTemperatura.addEventListener("click", function () {
  const ciudad = leerCiudad();
  if (!ciudad) return;
  mostrarMensaje("Buscando temperatura...");
  consultarTemperatura(ciudad);
});

function leerCiudad() {
  const datos = new FormData(formulario);
  const ciudad = datos.get("ciudad");
  if (!ciudad || ciudad.trim() === "") {
    mostrarError("Por favor escribe una ciudad.");
    return null;
  }
  return ciudad.trim();
}

function consultarAire(ciudad) {
  const url = "http://localhost:3001/proxy-aire/" + encodeURIComponent(ciudad);
  fetch(url)
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("Servidor respondió " + respuesta.status);
      }
      return respuesta.json();
    })
    .then(function (datos) {
      if (datos.error) {
        mostrarError(datos.error);
        return;
      }
      mostrarTarjetaAire(datos);
    })
    .catch(function (error) {
      console.error("Fallo la petición:", error);
      mostrarError("No se pudieron obtener los datos de aire: " + error.message);
    });
}

function consultarTemperatura(ciudad) {
  const url =
    "http://localhost:3001/proxy-temperatura/" +
    encodeURIComponent(ciudad);
  fetch(url)
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("Servidor respondió " + respuesta.status);
      }
      return respuesta.json();
    })
    .then(function (datos) {
      if (datos.error) {
        mostrarError(datos.error);
        return;
      }
      mostrarTarjetaTemperatura(datos);
    })
    .catch(function (error) {
      console.error("Fallo la petición:", error);
      mostrarError("No se pudieron obtener los datos de temperatura: " + error.message);
    });
}

// Función para mostrar mensajes simples
function mostrarMensaje(texto) {
  if (!informacion) return;
  informacion.innerHTML = '<div class="mensaje">' + texto + '</div>';
}

// Función para mostrar errores
function mostrarError(mensaje) {
  if (!informacion) return;
  informacion.innerHTML = '<div class="error">❌ ' + mensaje + '</div>';
}

// Función para mostrar tarjeta de calidad del aire
function mostrarTarjetaAire(datos) {
  const infoAqi = {
    1: { color: "#2ecc71", icon: "🟢", titulo: "Buena", texto: "Aire limpio, sin riesgos." },
    2: { color: "#f1c40f", icon: "🟡", titulo: "Razonable", texto: "Aceptable para la mayoría." },
    3: { color: "#e67e22", icon: "🟠", titulo: "Moderada", texto: "Grupos sensibles pueden notar molestias." },
    4: { color: "#e74c3c", icon: "🔴", titulo: "Mala", texto: "Puede afectar a cualquiera." },
    5: { color: "#9b59b6", icon: "🟣", titulo: "Muy Mala", texto: "Riesgo serio para la salud." },
  };

  const nivel = infoAqi[datos.aqi] || {
    color: "#7f8c8d",
    icon: "⚪",
    titulo: "Desconocido",
    texto: "AQI no disponible.",
  };

  const html = `
    <div class="tarjeta" style="background-color: ${nivel.color}">
      <div class="tarjeta-aire">
        <div class="aire-header">
          <h2>${datos.ciudad.toUpperCase()}</h2>
          <div class="coordenadas">${datos.latitud.toFixed(4)}, ${datos.longitud.toFixed(4)}</div>
        </div>
        <div class="aire-contenido">
          <div class="aire-icono">${nivel.icon}</div>
          <div class="aire-info">
            <div class="aire-titulo">${nivel.titulo}</div>
            <div class="aire-aqi">AQI: ${datos.aqi ?? "N/A"}</div>
            <div class="aire-texto">${nivel.texto}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  informacion.innerHTML = html;
  actualizarMapa(datos.latitud, datos.longitud, datos.ciudad);
}

// Función para actualizar el mapa con las coordenadas de la ciudad
function actualizarMapa(latitud, longitud, ciudad) {
  const mapaIframe = document.getElementById("mapa-iframe");
  if (!mapaIframe) return;

  // Usar el formato de búsqueda estándar de Google Maps
  // Buscamos por nombre de ciudad (más confiable que coordenadas en embed)
  const urlMapa =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(ciudad) +
    "&output=embed&hl=es&z=13";

  mapaIframe.src = urlMapa;
}

// Función para obtener el color de fondo según la temperatura
function obtenerColorTemperatura(temp) {
  if (temp === null || temp === undefined) {
    return "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)"; // Gris si no hay temperatura
  }

  // Escala de colores según temperatura
  if (temp < 0) {
    // Muy frío: Azul oscuro
    return "linear-gradient(135deg, #3498db 0%, #2980b9 100%)";
  } else if (temp < 10) {
    // Frío: Azul claro
    return "linear-gradient(135deg, #5dade2 0%, #3498db 100%)";
  } else if (temp < 18) {
    // Fresco: Verde azulado
    return "linear-gradient(135deg, #52c9dc 0%, #48b5c4 100%)";
  } else if (temp < 25) {
    // Agradable: Verde
    return "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
  } else if (temp < 30) {
    // Cálido: Verde claro/Amarillo
    return "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)";
  } else if (temp < 35) {
    // Calor: Naranja
    return "linear-gradient(135deg, #e67e22 0%, #d35400 100%)";
  } else {
    // Muy calor: Rojo
    return "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)";
  }
}

// Función para mostrar tarjeta de temperatura
function mostrarTarjetaTemperatura(datos) {
  const temperatura = datos.temperatura !== null ? datos.temperatura.toFixed(1) : "N/A";
  const descripcion = datos.descripcion || "No disponible";
  const colorFondo = obtenerColorTemperatura(datos.temperatura);

  const html = `
    <div class="tarjeta" style="background: ${colorFondo}">
      <div class="tarjeta-temperatura">
        <div class="temperatura-header">
          <h2>${datos.ciudad.toUpperCase()}</h2>
          <div class="coordenadas">${datos.latitud.toFixed(4)}, ${datos.longitud.toFixed(4)}</div>
        </div>
        <div class="temperatura-contenido">
          <div class="temperatura-icono">🌡️</div>
          <div class="temperatura-info">
            <div class="temperatura-valor">${temperatura}°C</div>
            <div class="temperatura-descripcion">${descripcion}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  informacion.innerHTML = html;
  actualizarMapa(datos.latitud, datos.longitud, datos.ciudad);
}