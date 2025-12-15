document.addEventListener("DOMContentLoaded", function () {
    const contenedorListaProductos = document.getElementById("lista_carrito");
    const contenedorPrincipalCompra = document.getElementById("compra_layout");
    const mensajeCestaVacia = document.getElementById("cesta_vacia");

    const etiquetaSubtotal = document.getElementById("resumen_subtotal");
    const etiquetaAhorro = document.getElementById("resumen_ahorro");
    const etiquetaTotal = document.getElementById("resumen_total");
    const etiquetaCo2Ahorrado = document.getElementById("resumen_co2");
    const contenedorCo2 = document.getElementById("co2_total_container");

    const botonTramitarPedido = document.getElementById("btn_tramitar");
    const modalExitoCompra = document.getElementById("modal_compra");
    const botonCerrarModalExito = document.getElementById("btn_cerrar_exito");

    let carritoCompras = obtenerCarritoDeAlmacenamiento();

    inicializarVistaCarrito();

    function inicializarVistaCarrito() {
        renderizarProductosCarrito();
        configurarBotonesGlobales();
    }

    function obtenerCarritoDeAlmacenamiento() {
        try {
            const datosGuardados = localStorage.getItem('sporteco_carrito');
            return datosGuardados ? JSON.parse(datosGuardados) : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    function guardarCarritoEnAlmacenamiento() {
        localStorage.setItem('sporteco_carrito', JSON.stringify(carritoCompras));
    }

    function renderizarProductosCarrito() {
        if (!carritoCompras || carritoCompras.length === 0) {
            mostrarEstadoVacio();
            return;
        }

        mostrarContenidoCarrito();
        generarHTMLListaProductos();
        actualizarResumenEconomicoYEcologico();
    }

    function mostrarEstadoVacio() {
        if (contenedorPrincipalCompra) contenedorPrincipalCompra.style.display = "none";
        if (mensajeCestaVacia) mensajeCestaVacia.style.display = "block";
    }

    function mostrarContenidoCarrito() {
        if (contenedorPrincipalCompra) contenedorPrincipalCompra.style.display = "flex";
        if (mensajeCestaVacia) mensajeCestaVacia.style.display = "none";
    }

    function generarHTMLListaProductos() {
        contenedorListaProductos.innerHTML = carritoCompras.map(crearHTMLItemCarrito).join('');
    }

    function crearHTMLItemCarrito(producto) {
        const precioBase = producto.precio;
        const tieneDescuento = producto.descuento > 0;
        const precioFinalUnitario = tieneDescuento
            ? precioBase * (1 - producto.descuento / 100)
            : precioBase;
        const subtotalProducto = precioFinalUnitario * producto.cantidad;

        return `
            <article class="carrito_item">
                <img src="${producto.imagen || 'img/placeholder_producto.jpg'}" 
                     alt="${producto.nombre}" 
                     class="carrito_img"
                     onerror="this.src='img/placeholder_producto.jpg'">
                
                <div class="carrito_info">
                    <h3>${producto.nombre}</h3>
                    <p class="carrito_precio_uni">
                        ${precioFinalUnitario.toFixed(2)}€ / ud.
                        ${tieneDescuento ? `<span style="text-decoration:line-through; font-size:0.8em; margin-left:5px">${precioBase.toFixed(2)}€</span>` : ''}
                    </p>
                </div>

                <div class="carrito_acciones">
                    <div class="carrito_cantidad">
                        <button class="btn_cantidad" onclick="cambiarCantidadProducto(${producto.id}, -1)">−</button>
                        <input type="text" readonly class="input_cantidad" value="${producto.cantidad}">
                        <button class="btn_cantidad" onclick="cambiarCantidadProducto(${producto.id}, 1)">+</button>
                    </div>
                    
                    <div class="carrito_subtotal">
                        ${subtotalProducto.toFixed(2)}€
                    </div>

                    <button class="btn_eliminar" onclick="eliminarProductoDelCarrito(${producto.id})" aria-label="Eliminar producto">
                        🗑️
                    </button>
                </div>
            </article>
        `;
    }

    function actualizarResumenEconomicoYEcologico() {
        let subtotalAcumulado = 0;
        let ahorroAcumulado = 0;
        let totalAcumulado = 0;
        let co2TotalAhorrado = 0;

        carritoCompras.forEach(producto => {
            const precioBaseTotal = producto.precio * producto.cantidad;
            const precioFinalTotal = (producto.descuento > 0
                ? producto.precio * (1 - producto.descuento / 100)
                : producto.precio) * producto.cantidad;

            subtotalAcumulado += precioBaseTotal;
            ahorroAcumulado += (precioBaseTotal - precioFinalTotal);
            totalAcumulado += precioFinalTotal;

            if (producto.co2Ahorrado) {
                co2TotalAhorrado += producto.co2Ahorrado * producto.cantidad;
            }
        });

        actualizarEtiquetasDOM(subtotalAcumulado, ahorroAcumulado, totalAcumulado, co2TotalAhorrado);
    }

    function actualizarEtiquetasDOM(subtotal, ahorro, total, co2) {
        if (etiquetaSubtotal) etiquetaSubtotal.textContent = subtotal.toFixed(2) + "€";
        if (etiquetaAhorro) etiquetaAhorro.textContent = "-" + ahorro.toFixed(2) + "€";
        if (etiquetaTotal) etiquetaTotal.textContent = total.toFixed(2) + "€";

        if (co2 > 0 && etiquetaCo2Ahorrado && contenedorCo2) {
            etiquetaCo2Ahorrado.textContent = co2.toFixed(1);
            contenedorCo2.style.display = "flex";
        } else if (contenedorCo2) {
            contenedorCo2.style.display = "none";
        }
    }

    window.cambiarCantidadProducto = function (idProducto, cambio) {
        const productoEncontrado = carritoCompras.find(p => p.id === idProducto);
        if (productoEncontrado) {
            productoEncontrado.cantidad += cambio;
            if (productoEncontrado.cantidad < 1) {
                productoEncontrado.cantidad = 1;
            }
            guardarCarritoEnAlmacenamiento();
            renderizarProductosCarrito();
        }
    };

    window.eliminarProductoDelCarrito = function (idProducto) {
        carritoCompras = carritoCompras.filter(p => p.id !== idProducto);
        guardarCarritoEnAlmacenamiento();
        renderizarProductosCarrito();
    };

    function configurarBotonesGlobales() {
        if (botonTramitarPedido) {
            botonTramitarPedido.addEventListener("click", procesarTramitePedido);
        }

        if (botonCerrarModalExito) {
            botonCerrarModalExito.addEventListener("click", function () {
                window.location.href = "index.html";
            });
        }
    }

    function procesarTramitePedido() {
        carritoCompras = [];
        guardarCarritoEnAlmacenamiento();
        if (modalExitoCompra) modalExitoCompra.style.display = "flex";
    }
});
