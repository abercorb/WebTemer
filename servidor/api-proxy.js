const express = require("express");
const router = express.Router();

const API_KEY = process.env.OPENWEATHER_KEY || "a7f577873f6d0180d28cda832841326c";

// Función auxiliar: obtener coordenadas de una ciudad
async function obtenerCoordenadas(ciudad) {
  const urlGeo =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    encodeURIComponent(ciudad) +
    "&limit=1&appid=" +
    API_KEY;

  const respuesta = await fetch(urlGeo);
  if (!respuesta.ok) {
    throw new Error("Error al buscar la ciudad");
  }

  const datos = await respuesta.json();
  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error("Ciudad no encontrada");
  }

  return {
    latitud: datos[0].lat,
    longitud: datos[0].lon,
  };
}

// Ruta: /proxy-aire/Madrid
router.get("/proxy-aire/:city", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la variable OPENWEATHER_KEY" });
  }

  const ciudad = req.params.city ? String(req.params.city).trim() : "";
  if (ciudad === "") {
    return res.status(400).json({ error: "Debes enviar una ciudad en la ruta" });
  }

  try {
    const { latitud, longitud } = await obtenerCoordenadas(ciudad);

    const urlAire =
      "https://api.openweathermap.org/data/2.5/air_pollution?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&appid=" +
      API_KEY;

    const respuestaAire = await fetch(urlAire);
    if (!respuestaAire.ok) {
      return res.status(500).json({ error: "Error al obtener datos de aire" });
    }

    const datosAire = await respuestaAire.json();
    const aqi = datosAire?.list?.[0]?.main?.aqi ?? null;
    const componentes = datosAire?.list?.[0]?.components ?? null;

    // Obtener también el pronóstico de calidad del aire
    const urlPronosticoAire =
      "https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&appid=" +
      API_KEY;

    const respPronosticoAire = await fetch(urlPronosticoAire);
    let pronosticoAire = [];
    if (respPronosticoAire.ok) {
      const datosPronosticoAire = await respPronosticoAire.json();
      pronosticoAire = datosPronosticoAire.list || [];
    }

    // Obtener también el historial de calidad del aire (últimas 24 horas)
    const ahora = Math.floor(Date.now() / 1000);
    const hace24Horas = ahora - 24 * 60 * 60;
    const urlHistorial =
      "https://api.openweathermap.org/data/2.5/air_pollution/history?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&start=" +
      hace24Horas +
      "&end=" +
      ahora +
      "&appid=" +
      API_KEY;

    const respHistorial = await fetch(urlHistorial);
    let historialAire = [];
    if (respHistorial.ok) {
      const datosHistorial = await respHistorial.json();
      historialAire = datosHistorial.list || [];
    }

    res.json({
      ciudad: ciudad,
      latitud: latitud,
      longitud: longitud,
      aqi: aqi,
      componentes: componentes,
      pronosticoAire: pronosticoAire,
      historialAire: historialAire,
    });
  } catch (error) {
    if (error.message === "Ciudad no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error en /proxy-aire:", error);
    res.status(500).json({ error: "No se pudo obtener los datos" });
  }
});

// Ruta: /proxy-temperatura/Madrid
router.get("/proxy-temperatura/:city", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la variable OPENWEATHER_KEY" });
  }

  const ciudad = req.params.city;
  if (ciudad === "") {
    return res.status(400).json({ error: "Debes enviar una ciudad en la ruta" });
  }

  try {
    const { latitud, longitud } = await obtenerCoordenadas(ciudad);

    const urlClima =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&appid=" +
      API_KEY +
      "&units=metric&lang=es";

    const respClima = await fetch(urlClima);
    const textoRespuesta = await respClima.text();

    if (!respClima.ok) {
      console.error("Error de OpenWeather (status " + respClima.status + "):", textoRespuesta.substring(0, 500));
      return res.status(500).json({
        error: "Error al obtener datos de temperatura",
        detalle: textoRespuesta.substring(0, 200),
      });
    }

    let datosClima;
    try {
      datosClima = JSON.parse(textoRespuesta);
    } catch (errorParseo) {
      console.error("Error al parsear JSON:", errorParseo);
      console.error("Respuesta recibida:", textoRespuesta.substring(0, 500));
      return res.status(500).json({
        error: "La API devolvió un formato inesperado",
        detalle: textoRespuesta.substring(0, 200),
      });
    }
    console.log("datosClima")
    console.log(datosClima)
    if (datosClima.cod && datosClima.cod !== 200) {
      return res.status(500).json({
        error: datosClima.message || "Error de la API de OpenWeather",
        codigo: datosClima.cod,
      });
    }

    const temperatura = datosClima?.main?.temp ?? null;
    const descripcion = datosClima?.weather?.[0]?.description ?? null;

    // Obtener también el pronóstico del tiempo
    const urlPronostico =
      "https://api.openweathermap.org/data/2.5/forecast?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&appid=" +
      API_KEY +
      "&units=metric&lang=es";

    const respPronostico = await fetch(urlPronostico);
    let pronostico = [];
    if (respPronostico.ok) {
      const datosPronostico = await respPronostico.json();
      pronostico = datosPronostico.list || [];
    }

    res.json({
      ciudad: ciudad,
      latitud: latitud,
      longitud: longitud,
      temperatura: temperatura,
      descripcion: descripcion,
      pronostico: pronostico,
    });
  } catch (error) {
    if (error.message === "Ciudad no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error en /proxy-temperatura:", error);
    res.status(500).json({ error: "No se pudo obtener la temperatura" });
  }
});

// Ruta: /proxy-pronostico/Madrid
router.get("/proxy-pronostico/:city", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la variable OPENWEATHER_KEY" });
  }

  const ciudad = req.params.city ? String(req.params.city).trim() : "";
  if (ciudad === "") {
    return res.status(400).json({ error: "Debes enviar una ciudad en la ruta" });
  }

  try {
    const { latitud, longitud } = await obtenerCoordenadas(ciudad);

    const urlPronostico =
      "https://api.openweathermap.org/data/2.5/forecast?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&appid=" +
      API_KEY +
      "&units=metric&lang=es";

    const respuesta = await fetch(urlPronostico);
    if (!respuesta.ok) {
      return res.status(500).json({ error: "Error al obtener pronóstico" });
    }

    const datos = await respuesta.json();
    res.json({
      ciudad: ciudad,
      latitud: latitud,
      longitud: longitud,
      pronostico: datos.list || [],
    });
  } catch (error) {
    if (error.message === "Ciudad no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error en /proxy-pronostico:", error);
    res.status(500).json({ error: "No se pudo obtener el pronóstico" });
  }
});

// Ruta: /proxy-pronostico-aire/Madrid
router.get("/proxy-pronostico-aire/:city", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la variable OPENWEATHER_KEY" });
  }

  const ciudad = req.params.city ? String(req.params.city).trim() : "";
  if (ciudad === "") {
    return res.status(400).json({ error: "Debes enviar una ciudad en la ruta" });
  }

  try {
    const { latitud, longitud } = await obtenerCoordenadas(ciudad);

    const urlPronosticoAire =
      "https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&appid=" +
      API_KEY;

    const respuesta = await fetch(urlPronosticoAire);
    if (!respuesta.ok) {
      return res.status(500).json({ error: "Error al obtener pronóstico de aire" });
    }

    const datos = await respuesta.json();
    res.json({
      ciudad: ciudad,
      latitud: latitud,
      longitud: longitud,
      pronostico: datos.list || [],
    });
  } catch (error) {
    if (error.message === "Ciudad no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error en /proxy-pronostico-aire:", error);
    res.status(500).json({ error: "No se pudo obtener el pronóstico de aire" });
  }
});

// Ruta: /proxy-historial-aire/Madrid
router.get("/proxy-historial-aire/:city", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la variable OPENWEATHER_KEY" });
  }

  const ciudad = req.params.city ? String(req.params.city).trim() : "";
  if (ciudad === "") {
    return res.status(400).json({ error: "Debes enviar una ciudad en la ruta" });
  }

  try {
    const { latitud, longitud } = await obtenerCoordenadas(ciudad);

    // Historial de las últimas 24 horas (timestamp actual menos 24 horas)
    const ahora = Math.floor(Date.now() / 1000);
    const hace24Horas = ahora - 24 * 60 * 60;

    const urlHistorial =
      "https://api.openweathermap.org/data/2.5/air_pollution/history?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&start=" +
      hace24Horas +
      "&end=" +
      ahora +
      "&appid=" +
      API_KEY;

    const respuesta = await fetch(urlHistorial);
    if (!respuesta.ok) {
      return res.status(500).json({ error: "Error al obtener historial de aire" });
    }

    const datos = await respuesta.json();
    res.json({
      ciudad: ciudad,
      latitud: latitud,
      longitud: longitud,
      historial: datos.list || [],
    });
  } catch (error) {
    if (error.message === "Ciudad no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error en /proxy-historial-aire:", error);
    res.status(500).json({ error: "No se pudo obtener el historial de aire" });
  }
});

// Ruta: /proxy-direccion/Madrid
router.get("/proxy-direccion/:city", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la variable OPENWEATHER_KEY" });
  }

  const ciudad = req.params.city ? String(req.params.city).trim() : "";
  if (ciudad === "") {
    return res.status(400).json({ error: "Debes enviar una ciudad en la ruta" });
  }

  try {
    const { latitud, longitud } = await obtenerCoordenadas(ciudad);

    const urlReverse =
      "https://api.openweathermap.org/geo/1.0/reverse?lat=" +
      latitud +
      "&lon=" +
      longitud +
      "&limit=1&appid=" +
      API_KEY;

    const respuesta = await fetch(urlReverse);
    if (!respuesta.ok) {
      return res.status(500).json({ error: "Error al obtener dirección" });
    }

    const datos = await respuesta.json();
    const direccion = datos && datos.length > 0 ? datos[0] : null;

    res.json({
      ciudad: ciudad,
      latitud: latitud,
      longitud: longitud,
      direccion: direccion,
    });
  } catch (error) {
    if (error.message === "Ciudad no encontrada") {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error en /proxy-direccion:", error);
    res.status(500).json({ error: "No se pudo obtener la dirección" });
  }
});

// Alias para errores de tipeo
router.get("/proxy_peratura/:city", async (req, res) => {
  res.redirect(301, "/proxy-temperatura/" + encodeURIComponent(req.params.city));
});

// Exportar el router para que app.js lo use
module.exports = router;
