const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta "cliente"
app.use(express.static(path.join(__dirname, "cliente")));

// ============================================================
// RUTA GET /productos - Devuelve la lista de productos
// ============================================================
app.get("/productos", (req, res) => {
    const rutaProductos = path.join(__dirname, "data", "productos.json");

    fs.readFile(rutaProductos, "utf-8", (error, datos) => {
        if (error) {
            console.error("Error al leer productos.json:", error);
            return res.status(500).json({ error: "No se pudo cargar el catálogo de productos" });
        }

        try {
            const productos = JSON.parse(datos);
            res.json(productos);
        } catch (parseError) {
            console.error("Error al parsear productos.json:", parseError);
            res.status(500).json({ error: "Error en el formato de datos" });
        }
    });
});

// ============================================================
// Ruta raíz - Sirve index.html
// ============================================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "cliente", "index.html"));
});

// ============================================================
// RUTA POST /contacto - Recibe consultas de contacto
// ============================================================
app.post("/contacto", (req, res) => {
    const { nombre, email, tema, mensaje } = req.body;

    // Validación básica
    if (!nombre || !email || !tema || !mensaje) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Crear objeto de consulta
    const consulta = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        nombre,
        email,
        tema,
        mensaje
    };

    // Guardar en archivo JSON
    const rutaContactos = path.join(__dirname, "data", "contactos.json");

    fs.readFile(rutaContactos, "utf-8", (error, datos) => {
        let contactos = [];
        if (!error) {
            try {
                contactos = JSON.parse(datos);
            } catch (e) {
                contactos = [];
            }
        }

        contactos.push(consulta);

        fs.writeFile(rutaContactos, JSON.stringify(contactos, null, 2), (error) => {
            if (error) {
                console.error("Error al guardar consulta:", error);
                return res.status(500).json({ error: "Error al guardar la consulta" });
            }

            console.log(`📩 Nueva consulta de ${nombre} (${email}) - Tema: ${tema}`);
            res.json({ mensaje: "Consulta recibida correctamente", id: consulta.id });
        });
    });
});

// ============================================================
// RUTA POST /perfil - Guarda perfil deportivo del usuario
// ============================================================
app.post("/perfil", (req, res) => {
    const { deporte, nivel, frecuencia, objetivos } = req.body;

    // Validación básica
    if (!deporte || !nivel || !frecuencia) {
        return res.status(400).json({ error: "Los campos principales son obligatorios" });
    }

    // Crear objeto de perfil
    const perfil = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        deporte,
        nivel,
        frecuencia,
        objetivos: objetivos || []
    };

    // Guardar en archivo JSON
    const rutaPerfiles = path.join(__dirname, "data", "perfiles.json");

    fs.readFile(rutaPerfiles, "utf-8", (error, datos) => {
        let perfiles = [];
        if (!error) {
            try {
                perfiles = JSON.parse(datos);
            } catch (e) {
                perfiles = [];
            }
        }

        perfiles.push(perfil);

        fs.writeFile(rutaPerfiles, JSON.stringify(perfiles, null, 2), (error) => {
            if (error) {
                console.error("Error al guardar perfil:", error);
                return res.status(500).json({ error: "Error al guardar el perfil" });
            }

            console.log(`🏃 Nuevo perfil deportivo: ${deporte} - ${nivel}`);
            res.json({ mensaje: "Perfil guardado correctamente", id: perfil.id });
        });
    });
});

// ============================================================
// RUTA GET /testimonios - Devuelve la lista de testimonios
// ============================================================
app.get("/testimonios", (req, res) => {
    const rutaTestimonios = path.join(__dirname, "data", "testimonios.json");

    fs.readFile(rutaTestimonios, "utf-8", (error, datos) => {
        if (error) {
            console.error("Error al leer testimonios.json:", error);
            return res.json([]);
        }

        try {
            const testimonios = JSON.parse(datos);
            res.json(testimonios);
        } catch (parseError) {
            console.error("Error al parsear testimonios.json:", parseError);
            res.json([]);
        }
    });
});

// ============================================================
// RUTA POST /testimonios - Guarda un nuevo testimonio
// ============================================================
app.post("/testimonios", (req, res) => {
    const { nombre, deporte, texto } = req.body;

    // Validación básica
    if (!nombre || !deporte || !texto) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Crear objeto de testimonio
    const testimonio = {
        id: Date.now(),
        nombre: nombre.length > 20 ? nombre.substring(0, 20) + "." : nombre,
        deporte,
        texto: texto.length > 150 ? texto.substring(0, 150) + "..." : texto,
        fecha: new Date().toISOString().split('T')[0]
    };

    // Guardar en archivo JSON
    const rutaTestimonios = path.join(__dirname, "data", "testimonios.json");

    fs.readFile(rutaTestimonios, "utf-8", (error, datos) => {
        let testimonios = [];
        if (!error) {
            try {
                testimonios = JSON.parse(datos);
            } catch (e) {
                testimonios = [];
            }
        }

        // Añadir al principio
        testimonios.unshift(testimonio);

        // Limitar a 20 testimonios
        if (testimonios.length > 20) {
            testimonios = testimonios.slice(0, 20);
        }

        fs.writeFile(rutaTestimonios, JSON.stringify(testimonios, null, 2), (error) => {
            if (error) {
                console.error("Error al guardar testimonio:", error);
                return res.status(500).json({ error: "Error al guardar el testimonio" });
            }

            console.log(`💬 Nuevo testimonio de ${nombre} - ${deporte}`);
            res.json({ mensaje: "Testimonio guardado correctamente", testimonio });
        });
    });
});

// ============================================================
// Iniciar servidor
// ============================================================
app.listen(PORT, () => {
    console.log(`✅ Servidor SportEco corriendo en http://localhost:${PORT}`);
    console.log(`📦 Catálogo de productos en http://localhost:${PORT}/productos`);
});
