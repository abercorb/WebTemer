document.addEventListener("DOMContentLoaded", function () {
    // ============================================================
    // Variables y elementos del DOM
    // ============================================================
    const productosGrid = document.getElementById("productos_grid");
    const filtroCategoria = document.getElementById("filtro_categoria");
    const filtroMaterial = document.getElementById("filtro_material");
    const filtroPrecio = document.getElementById("filtro_precio");
    const btnLimpiarFiltros = document.getElementById("btn_limpiar_filtros");
    const contadorProductos = document.getElementById("contador_productos");
    const contadorFavoritos = document.getElementById("contador_favoritos");
    const btnVerFavoritos = document.getElementById("btn_ver_favoritos");
    const modalFavoritos = document.getElementById("modal_favoritos");
    const cerrarModal = document.getElementById("cerrar_modal");
    const listaFavoritos = document.getElementById("lista_favoritos");

    let todosLosProductos = [];
    let favoritos = cargarFavoritos();

    // ============================================================
    // Cargar productos desde el servidor
    // ============================================================
    async function cargarProductos() {
        try {
            const respuesta = await fetch("/productos");
            if (!respuesta.ok) {
                throw new Error("Error al cargar productos");
            }
            todosLosProductos = await respuesta.json();
            aplicarFiltros();
            actualizarContadorFavoritos();
        } catch (error) {
            console.error("Error:", error);
            productosGrid.innerHTML = `
        <div class="sin_resultados">
          <h3>Error al cargar el catálogo</h3>
          <p>Por favor, intenta recargar la página.</p>
        </div>
      `;
        }
    }

    // ============================================================
    // Renderizar productos en el grid
    // ============================================================
    function renderizarProductos(productos) {
        if (productos.length === 0) {
            productosGrid.innerHTML = `
        <div class="sin_resultados">
          <h3>No se encontraron productos</h3>
          <p>Prueba a cambiar los filtros de búsqueda.</p>
        </div>
      `;
            contadorProductos.textContent = "0 productos encontrados";
            return;
        }

        contadorProductos.textContent = `${productos.length} producto${productos.length !== 1 ? "s" : ""} encontrado${productos.length !== 1 ? "s" : ""}`;

        productosGrid.innerHTML = productos.map(producto => {
            const esFavorito = favoritos.includes(producto.id);
            const tieneDescuento = producto.descuento > 0;
            const precioFinal = tieneDescuento
                ? (producto.precio * (1 - producto.descuento / 100)).toFixed(2)
                : producto.precio.toFixed(2);

            return `
        <article class="producto_tarjeta ${producto.topSostenible ? 'top_sostenible' : ''} ${tieneDescuento ? 'con_descuento' : ''}" 
                 data-id="${producto.id}"
                 ${tieneDescuento ? `data-descuento="-${producto.descuento}%"` : ''}>
          <img src="${producto.imagen}" alt="${producto.nombre}" class="producto_imagen" 
               onerror="this.src='img/placeholder_producto.jpg'; this.onerror=null;">
          <div class="producto_contenido">
            <h3 class="producto_nombre">${producto.nombre}</h3>
            <p class="producto_descripcion">${producto.descripcion}</p>
            
            <div class="producto_etiquetas">
              ${producto.etiquetas.map(etiqueta =>
                `<span class="etiqueta etiqueta_${etiqueta}">${formatearEtiqueta(etiqueta)}</span>`
            ).join('')}
            </div>
            
            <div class="producto_co2">
              ${producto.co2Ahorrado} kg CO₂ ahorrado
            </div>
            
            <div class="producto_footer">
              <div>
                <span class="producto_precio">${precioFinal}€</span>
                ${tieneDescuento ? `<span class="producto_precio_original">${producto.precio.toFixed(2)}€</span>` : ''}
              </div>
              <button type="button" 
                      class="btn_favorito ${esFavorito ? 'activo' : ''}" 
                      data-id="${producto.id}"
                      aria-label="${esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                ${esFavorito ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </article>
      `;
        }).join('');

        // Añadir eventos a los botones de favoritos
        document.querySelectorAll('.btn_favorito').forEach(btn => {
            btn.addEventListener('click', toggleFavorito);
        });
    }

    // ============================================================
    // Formatear etiquetas para mostrar
    // ============================================================
    function formatearEtiqueta(etiqueta) {
        const etiquetas = {
            'reciclado': 'Reciclado',
            'organico': 'Orgánico',
            'km-cero': 'Km 0',
            'baja-huella': 'Baja huella',
            'duradero': 'Duradero'
        };
        return etiquetas[etiqueta] || etiqueta;
    }

    // ============================================================
    // Aplicar filtros
    // ============================================================
    function aplicarFiltros() {
        const categoria = filtroCategoria.value;
        const material = filtroMaterial.value;
        const precio = filtroPrecio.value;

        let productosFiltrados = [...todosLosProductos];
        console.log(productosFiltrados);
        // Filtrar por categoría
        if (categoria !== 'todas') {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
        }

        // Filtrar por material
        if (material !== 'todos') {
            productosFiltrados = productosFiltrados.filter(p => p.material === material);
        }

        // Filtrar por precio
        if (precio !== 'todos') {
            const [min, max] = precio.split('-').map(Number);
            productosFiltrados = productosFiltrados.filter(p => {
                const precioFinal = p.descuento > 0
                    ? p.precio * (1 - p.descuento / 100)
                    : p.precio;
                return precioFinal >= min && precioFinal <= max;
            });
        }

        renderizarProductos(productosFiltrados);
    }

    // ============================================================
    // Gestión de favoritos con localStorage
    // ============================================================
    function cargarFavoritos() {
        try {
            const guardados = localStorage.getItem('sporteco_favoritos');
            return guardados ? JSON.parse(guardados) : [];
        } catch (e) {
            console.error('Error al cargar favoritos:', e);
            return [];
        }
    }

    function guardarFavoritos() {
        try {
            localStorage.setItem('sporteco_favoritos', JSON.stringify(favoritos));
        } catch (e) {
            console.error('Error al guardar favoritos:', e);
        }
    }

    function toggleFavorito(evento) {
        const btn = evento.currentTarget;
        const id = parseInt(btn.dataset.id);

        if (favoritos.includes(id)) {
            favoritos = favoritos.filter(fav => fav !== id);
            btn.classList.remove('activo');
            btn.innerHTML = '♡';
            btn.setAttribute('aria-label', 'Añadir a favoritos');
        } else {
            favoritos.push(id);
            btn.classList.add('activo');
            btn.innerHTML = '♥';
            btn.setAttribute('aria-label', 'Quitar de favoritos');
        }

        guardarFavoritos();
        actualizarContadorFavoritos();
    }

    function actualizarContadorFavoritos() {
        contadorFavoritos.textContent = favoritos.length;
    }

    // ============================================================
    // Modal de favoritos
    // ============================================================
    function abrirModalFavoritos() {
        const productosFavoritos = todosLosProductos.filter(p => favoritos.includes(p.id));

        if (productosFavoritos.length === 0) {
            listaFavoritos.innerHTML = '<p>No tienes productos favoritos guardados.</p>';
        } else {
            listaFavoritos.innerHTML = productosFavoritos.map(producto => {
                const precioFinal = producto.descuento > 0
                    ? (producto.precio * (1 - producto.descuento / 100)).toFixed(2)
                    : producto.precio.toFixed(2);

                return `
          <div class="favorito_item" data-id="${producto.id}">
            <img src="${producto.imagen}" alt="${producto.nombre}"
                 onerror="this.src='img/placeholder_producto.jpg'; this.onerror=null;">
            <div class="favorito_info">
              <h3>${producto.nombre}</h3>
              <p>${precioFinal}€</p>
            </div>
            <button type="button" class="btn_quitar_favorito" data-id="${producto.id}">
              Quitar
            </button>
          </div>
        `;
            }).join('');

            // Eventos para quitar favoritos desde el modal
            listaFavoritos.querySelectorAll('.btn_quitar_favorito').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = parseInt(this.dataset.id);
                    favoritos = favoritos.filter(fav => fav !== id);
                    guardarFavoritos();
                    actualizarContadorFavoritos();

                    // Actualizar botón en el grid
                    const btnGrid = document.querySelector(`.btn_favorito[data-id="${id}"]`);
                    if (btnGrid) {
                        btnGrid.classList.remove('activo');
                        btnGrid.innerHTML = '♡';
                        btnGrid.setAttribute('aria-label', 'Añadir a favoritos');
                    }

                    // Actualizar modal
                    abrirModalFavoritos();
                });
            });
        }

        modalFavoritos.classList.add('modal_visible');
        modalFavoritos.setAttribute('aria-hidden', 'false');
    }

    function cerrarModalFavoritos() {
        modalFavoritos.classList.remove('modal_visible');
        modalFavoritos.setAttribute('aria-hidden', 'true');
    }

    // ============================================================
    // Limpiar filtros
    // ============================================================
    function limpiarFiltros() {
        filtroCategoria.value = 'todas';
        filtroMaterial.value = 'todos';
        filtroPrecio.value = 'todos';
        aplicarFiltros();
    }

    // ============================================================
    // Event Listeners
    // ============================================================
    filtroCategoria.addEventListener('change', aplicarFiltros);
    filtroMaterial.addEventListener('change', aplicarFiltros);
    filtroPrecio.addEventListener('change', aplicarFiltros);
    btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    btnVerFavoritos.addEventListener('click', abrirModalFavoritos);
    cerrarModal.addEventListener('click', cerrarModalFavoritos);

    // Cerrar modal al hacer clic fuera
    modalFavoritos.addEventListener('click', function (e) {
        if (e.target === modalFavoritos) {
            cerrarModalFavoritos();
        }
    });

    // Cerrar modal con Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalFavoritos.classList.contains('modal_visible')) {
            cerrarModalFavoritos();
        }
    });

    // ============================================================
    // Inicialización
    // ============================================================
    cargarProductos();
});
