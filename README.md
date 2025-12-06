# WebTemer - Monitor de Calidad del Aire

Aplicación web para consultar la calidad del aire y temperatura de diferentes ciudades.

## 📁 Estructura del proyecto

```
WebTemer/
├── cliente/
│   ├── css/
│   │   ├── index.css
│   │   └── perfil.css
│   ├── js/
│   │   ├── index.js
│   │   └── perfil.js
│   ├── index.html
│   └── perfil.html
└── servidor/
    ├── app.js              # Servidor principal (puerto 3001)
    ├── api-proxy.js        # Router para APIs de OpenWeather
    └── rutas-usuario.js    # Router para formulario de contacto
```

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install express
```

2. (Opcional) Configurar API Key de OpenWeather:
```bash
set OPENWEATHER_KEY=tu_api_key_aqui
```

## ▶️ Ejecutar el servidor

Desde la carpeta raíz del proyecto:

```bash
node servidor/app.js
```

El servidor estará disponible en: **http://localhost:3001**

## 📡 Rutas disponibles

### APIs de Clima (GET)
- `/proxy-aire/:city` - Calidad del aire actual
- `/proxy-temperatura/:city` - Temperatura actual
- `/proxy-pronostico/:city` - Pronóstico del tiempo
- `/proxy-pronostico-aire/:city` - Pronóstico de calidad del aire
- `/proxy-historial-aire/:city` - Historial de calidad del aire (24h)
- `/proxy-direccion/:city` - Información de ubicación

### Rutas de Usuario
- `POST /usuario/contacto` - Enviar formulario de contacto
- `GET /usuario/reportes` - Ver reportes enviados

## 🌐 Usar la aplicación

1. Abre `cliente/index.html` en tu navegador
2. Introduce una ciudad (ej: Valencia, Madrid, Barcelona)
3. Haz clic en "Ver Calidad Aire" o "Ver Temperatura"

## 🔑 API Key

El proyecto incluye una API key de demostración. Para uso en producción, obtén tu propia API key en:
https://openweathermap.org/api