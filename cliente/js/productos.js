document.addEventListener("DOMContentLoaded", function () {
    const contenedorGridProductos = document.getElementById("productos_grid");
    const filtroCategoria = document.getElementById("filtro_categoria");
    const filtroMaterial = document.getElementById("filtro_material");
    const filtroPrecio = document.getElementById("filtro_precio");
    const botonLimpiarFiltros = document.getElementById("btn_limpiar_filtros");
    const contadorResultados = document.getElementById("contador_productos");

    const contadorFavoritos = document.getElementById("contador_favoritos");
    const botonVerFavoritos = document.getElementById("btn_ver_favoritos");
    const modalFavoritos = document.getElementById("modal_favoritos");
    const botonCerrarModal = document.getElementById("cerrar_modal");
    const contenedorListaFavoritos = document.getElementById("lista_favoritos");

    let inventarioProductos = [];
    let listaIdsFavoritos = obtenerFavoritosDeAlmacenamiento();
    let carritoCompras = obtenerCarritoDeAlmacenamiento();

    inicializarAplicacion();

    function inicializarAplicacion() {
        obtenerProductosDelServidor();
        configurarOyentesDeEventos();
    }

    async function obtenerProductosDelServidor() {
        try {
            const respuestaServidor = await fetch("/productos");
            if (!respuestaServidor.ok) {
                throw new Error("Error al cargar productos");
            }
            inventarioProductos = await respuestaServidor.json();
            aplicarFiltrosYRenderizar();
            actualizarContadorVisualFavoritos();
        } catch (error) {
            mostrarErrorCarga(error);
        }
    }

    function mostrarErrorCarga(error) {
        console.error("Error:", error);
        contenedorGridProductos.innerHTML = `
            <div class="sin_resultados">
                <h3>Error al cargar el catálogo</h3>
                <p>Por favor, intenta recargar la página.</p>
            </div>
        `;
    }

    function configurarOyentesDeEventos() {
        filtroCategoria.addEventListener('change', aplicarFiltrosYRenderizar);
        filtroMaterial.addEventListener('change', aplicarFiltrosYRenderizar);
        filtroPrecio.addEventListener('change', aplicarFiltrosYRenderizar);
        botonLimpiarFiltros.addEventListener('click', limpiarTodosLosFiltros);

        botonVerFavoritos.addEventListener('click', abrirModalDeFavoritos);
        botonCerrarModal.addEventListener('click', cerrarModalDeFavoritos);

        modalFavoritos.addEventListener('click', function (evento) {
            if (evento.target === modalFavoritos) {
                cerrarModalDeFavoritos();
            }
        });

        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape' && modalFavoritos.classList.contains('modal_visible')) {
                cerrarModalDeFavoritos();
            }
        });
    }

    function aplicarFiltrosYRenderizar() {
        const categoriaSeleccionada = filtroCategoria.value;
        const materialSeleccionado = filtroMaterial.value;
        const precioSeleccionado = filtroPrecio.value;

        let productosFiltrados = [...inventarioProductos];

        if (categoriaSeleccionada !== 'todas') {
            productosFiltrados = productosFiltrados.filter(producto => producto.categoria === categoriaSeleccionada);
        }

        if (materialSeleccionado !== 'todos') {
            productosFiltrados = productosFiltrados.filter(producto => producto.material === materialSeleccionado);
        }

        if (precioSeleccionado !== 'todos') {
            const [precioMinimo, precioMaximo] = precioSeleccionado.split('-').map(Number);
            productosFiltrados = productosFiltrados.filter(producto => {
                const precioCalculado = producto.descuento > 0
                    ? producto.precio * (1 - producto.descuento / 100)
                    : producto.precio;
                return precioCalculado >= precioMinimo && precioCalculado <= precioMaximo;
            });
        }

        renderizarProductosEnDOM(productosFiltrados);
    }

    function limpiarTodosLosFiltros() {
        filtroCategoria.value = 'todas';
        filtroMaterial.value = 'todos';
        filtroPrecio.value = 'todos';
        aplicarFiltrosYRenderizar();
    }

    function renderizarProductosEnDOM(listaProductos) {
        if (listaProductos.length === 0) {
            mostrarMensajeSinResultados();
            return;
        }

        contadorResultados.textContent = `${listaProductos.length} producto${listaProductos.length !== 1 ? "s" : ""} encontrado${listaProductos.length !== 1 ? "s" : ""}`;

        contenedorGridProductos.innerHTML = listaProductos.map(crearHTMLTarjetaProducto).join('');

        asignarEventosATarjetas();
    }

    function mostrarMensajeSinResultados() {
        contenedorGridProductos.innerHTML = `
            <div class="sin_resultados">
                <h3>No se encontraron productos</h3>
                <p>Prueba a cambiar los filtros de búsqueda.</p>
            </div>
        `;
        contadorResultados.textContent = "0 productos encontrados";
    }

    function crearHTMLTarjetaProducto(producto) {
        const esFavorito = listaIdsFavoritos.includes(producto.id);
        const tieneDescuento = producto.descuento > 0;
        const precioFinal = tieneDescuento
            ? (producto.precio * (1 - producto.descuento / 100)).toFixed(2)
            : producto.precio.toFixed(2);

        const etiquetasHTML = producto.etiquetas.map(etiqueta =>
            `<span class="etiqueta etiqueta_${etiqueta}">${obtenerNombreLegibleEtiqueta(etiqueta)}</span>`
        ).join('');

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
                    ${etiquetasHTML}
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
                    <button type="button" 
                            class="btn_carrito" 
                            data-id="${producto.id}"
                            aria-label="Añadir a la cesta">
                        Añadir
                    </button>
                </div>
            </div>
        </article>
        `;
    }

    function asignarEventosATarjetas() {
        document.querySelectorAll('.btn_favorito').forEach(boton => {
            boton.addEventListener('click', manejarClickFavorito);
        });

        document.querySelectorAll('.btn_carrito').forEach(boton => {
            boton.addEventListener('click', manejarClickAgregarCarrito);
        });
    }

    function obtenerNombreLegibleEtiqueta(claveEtiqueta) {
        const mapaEtiquetas = {
            'reciclado': 'Reciclado',
            'organico': 'Orgánico',
            'km-cero': 'Km 0',
            'baja-huella': 'Baja huella',
            'duradero': 'Duradero'
        };
        return mapaEtiquetas[claveEtiqueta] || claveEtiqueta;
    }

    function manejarClickFavorito(evento) {
        const boton = evento.currentTarget;
        const idProducto = parseInt(boton.dataset.id);

        if (listaIdsFavoritos.includes(idProducto)) {
            listaIdsFavoritos = listaIdsFavoritos.filter(id => id !== idProducto);
            boton.classList.remove('activo');
            boton.innerHTML = '♡';
            boton.setAttribute('aria-label', 'Añadir a favoritos');
        } else {
            listaIdsFavoritos.push(idProducto);
            boton.classList.add('activo');
            boton.innerHTML = '♥';
            boton.setAttribute('aria-label', 'Quitar de favoritos');
        }

        guardarFavoritosEnAlmacenamiento();
        actualizarContadorVisualFavoritos();
    }

    function manejarClickAgregarCarrito(evento) {
        const boton = evento.currentTarget;
        const idProducto = parseInt(boton.dataset.id);
        const productoEncontrado = inventarioProductos.find(p => p.id === idProducto);

        if (productoEncontrado) {
            const itemExistenteEnCarrito = carritoCompras.find(item => item.id === idProducto);

            if (itemExistenteEnCarrito) {
                itemExistenteEnCarrito.cantidad++;
            } else {
                carritoCompras.push({
                    id: productoEncontrado.id,
                    nombre: productoEncontrado.nombre,
                    precio: productoEncontrado.precio,
                    descuento: productoEncontrado.descuento,
                    imagen: productoEncontrado.imagen,
                    co2Ahorrado: productoEncontrado.co2Ahorrado,
                    cantidad: 1
                });
            }

            guardarCarritoEnAlmacenamiento();
            mostrarFeedbackVisualBoton(boton);
        }
    }

    function mostrarFeedbackVisualBoton(boton) {
        const textoOriginal = boton.textContent;
        boton.textContent = "¡Añadido!";
        boton.classList.add("agregado");
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.classList.remove("agregado");
        }, 1000);
    }

    function obtenerFavoritosDeAlmacenamiento() {
        try {
            const datosGuardados = localStorage.getItem('sporteco_favoritos');
            return datosGuardados ? JSON.parse(datosGuardados) : [];
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            return [];
        }
    }

    function guardarFavoritosEnAlmacenamiento() {
        try {
            localStorage.setItem('sporteco_favoritos', JSON.stringify(listaIdsFavoritos));
        } catch (error) {
            console.error('Error al guardar favoritos:', error);
        }
    }

    function actualizarContadorVisualFavoritos() {
        contadorFavoritos.textContent = listaIdsFavoritos.length;
    }

    function obtenerCarritoDeAlmacenamiento() {
        try {
            const datosGuardados = localStorage.getItem('sporteco_carrito');
            return datosGuardados ? JSON.parse(datosGuardados) : [];
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            return [];
        }
    }

    function guardarCarritoEnAlmacenamiento() {
        try {
            localStorage.setItem('sporteco_carrito', JSON.stringify(carritoCompras));
        } catch (error) {
            console.error('Error al guardar carrito:', error);
        }
    }

    function abrirModalDeFavoritos() {
        const objetosFavoritos = inventarioProductos.filter(producto => listaIdsFavoritos.includes(producto.id));

        if (objetosFavoritos.length === 0) {
            contenedorListaFavoritos.innerHTML = '<p>No tienes productos favoritos guardados.</p>';
        } else {
            contenedorListaFavoritos.innerHTML = objetosFavoritos.map(crearHTMLItemFavoritoModal).join('');
            asignarEventosBorrarFavoritoModal();
        }

        modalFavoritos.classList.add('modal_visible');
        modalFavoritos.setAttribute('aria-hidden', 'false');
    }

    function crearHTMLItemFavoritoModal(producto) {
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
    }

    function asignarEventosBorrarFavoritoModal() {
        contenedorListaFavoritos.querySelectorAll('.btn_quitar_favorito').forEach(boton => {
            boton.addEventListener('click', function () {
                const idProducto = parseInt(this.dataset.id);
                listaIdsFavoritos = listaIdsFavoritos.filter(id => id !== idProducto);
                guardarFavoritosEnAlmacenamiento();
                actualizarContadorVisualFavoritos();
                actualizarEstadoBotonGrid(idProducto);
                abrirModalDeFavoritos();
            });
        });
    }

    function actualizarEstadoBotonGrid(idProducto) {
        const botonEnGrid = document.querySelector(`.btn_favorito[data-id="${idProducto}"]`);
        if (botonEnGrid) {
            botonEnGrid.classList.remove('activo');
            botonEnGrid.innerHTML = '♡';
            botonEnGrid.setAttribute('aria-label', 'Añadir a favoritos');
        }
    }

    function cerrarModalDeFavoritos() {
        modalFavoritos.classList.remove('modal_visible');
        modalFavoritos.setAttribute('aria-hidden', 'true');
    }
});
