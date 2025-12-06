const express = require("express");
const app = express();

// CORS: permitir peticiones desde cualquier origen
app.use(function (_req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Middleware para parsear JSON (necesario para rutas-usuario)
app.use(express.json());

// Importar routers
const apiProxyRouter = require("./api-proxy.js");
const rutasUsuarioRouter = require("./rutas-usuario.js");

// Montar routers
app.use("/", apiProxyRouter); // Rutas de proxy (proxy-aire, proxy-temperatura, etc.)
app.use("/usuario", rutasUsuarioRouter); // Rutas de usuario (contacto, reportes)

// Manejar rutas no encontradas (404)
app.use(function (req, res) {
    res.status(404).json({ error: "Ruta no encontrada: " + req.path });
});

// Arrancar el servidor
const PUERTO = process.env.PORT || 3001;
app.listen(PUERTO, () => {
    console.log("🚀 Servidor escuchando en http://localhost:" + PUERTO);
    console.log("📡 Rutas disponibles:");
    console.log("   - /proxy-aire/:city");
    console.log("   - /proxy-temperatura/:city");
    console.log("   - /proxy-pronostico/:city");
    console.log("   - /proxy-pronostico-aire/:city");
    console.log("   - /proxy-historial-aire/:city");
    console.log("   - /proxy-direccion/:city");
    console.log("   - /usuario/contacto (POST)");
    console.log("   - /usuario/reportes (GET)");
});
