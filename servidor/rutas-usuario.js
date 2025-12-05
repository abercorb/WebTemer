const express = require("express");
const router = express.Router();

// Array en memoria para simular almacenamiento de reportes
// (en un proyecto real se usaría una base de datos)
let reportes = [];

/**
 * POST /usuario/contacto
 * Recibe los datos del formulario de perfil.html
 */
router.post("/contacto", (req, res) => {
  const { nombre, email, tipo, mensaje, acepto } = req.body || {};

  // Validación mínima en servidor (nunca fiarse solo del cliente)
  if (!nombre || !email || !mensaje || !acepto) {
    return res.status(400).json({
      ok: false,
      mensaje: "Faltan datos obligatorios o no se ha aceptado la política.",
    });
  }

  const nuevoReporte = {
    id: reportes.length + 1,
    nombre,
    email,
    tipo: tipo || "consulta",
    mensaje,
    fecha: new Date().toISOString(),
  };

  reportes.push(nuevoReporte);

  console.log("Nuevo reporte recibido:", nuevoReporte);

  return res.json({
    ok: true,
    mensaje: "Tu mensaje se ha recibido correctamente.",
    reporte: nuevoReporte,
  });
});

/**
 * GET /usuario/reportes
 * (Opcional) Devuelve la lista de reportes almacenados.
 */
router.get("/reportes", (req, res) => {
  res.json({ ok: true, reportes });
});

module.exports = router;