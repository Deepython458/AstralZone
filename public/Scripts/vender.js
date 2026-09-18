let carrito = [];
let stockDisponible = {};

async function cargarProductos() {
    const respuesta = await fetch('/api/productos');
    const marcas = await respuesta.json();
    pintarListaProductos(marcas);
}

function pintarListaProductos(marcas) {
    const contenedor = document.getElementById('lista-productos-contenido');

    marcas.forEach(function (marca) {
        marca.sabores.forEach(function (sabor) {
            stockDisponible[sabor.id] = sabor.cantidad;
        });
    });

    contenedor.innerHTML = marcas.map(function (marca) {
        const saboresConStock = marca.sabores.filter(function (sabor) {
            return sabor.cantidad > 0;
        });

        if (saboresConStock.length === 0) return '';

        const filas = saboresConStock.map(function (sabor) {
            return `
                <li>
                    <div class="producto-item" data-sabor-id="${sabor.id}">
                        <input type="checkbox" class="producto-check">
                        <p class="producto-nombre">${sabor.emoji_1 || ''} ${sabor.emoji_2 || ''} ${sabor.nombre}</p>
                        <div class="cantidad-selector">
                            <button class="btn-cantidad btn-menos" type="button">-</button>
                            <span class="cantidad-valor">1</span>
                            <button class="btn-cantidad btn-mas" type="button">+</button>
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        return `
            <div class="marca-grupo">
                <p class="marca-titulo">${marca.nombre}</p>
                <ul>${filas}</ul>
            </div>
        `;
    }).join('');
}


function agregarAlCarrito(fila) {
    const saborId = fila.dataset.saborId;
    const nombre = fila.querySelector('.producto-nombre').textContent.trim();

    carrito.push({ sabor_id: saborId, nombre: nombre, cantidad: 1 });
}

function quitarDelCarrito(saborId) {
    carrito = carrito.filter(function (item) {
        return item.sabor_id !== saborId;
    });
}

function cambiarCantidad(saborId, delta) {
    const item = carrito.find(function (item) {
        return item.sabor_id === saborId;
    });

    if (!item) return;

    if (delta > 0 && item.cantidad >= stockDisponible[saborId]) {
        marcarLimite(saborId);
        return;
    }

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        quitarDelCarrito(saborId);
        const fila = document.querySelector(`.producto-item[data-sabor-id="${saborId}"]`);
        fila.querySelector('.producto-check').checked = false;
        fila.classList.remove('seleccionado');
        fila.querySelector('.cantidad-valor').textContent = 1;
    }
}

function marcarLimite(saborId) {
    document.querySelectorAll(`[data-sabor-id="${saborId}"] .cantidad-valor`).forEach(function (span) {
        span.classList.remove('limite');
        void span.offsetWidth;
        span.classList.add('limite');
    });
}

function actualizarEstadoBoton(saborId) {
    const item = carrito.find(function (item) {
        return item.sabor_id === saborId;
    });

    const cantidadActual = item ? item.cantidad : 0;
    const alLimite = cantidadActual >= stockDisponible[saborId];

    document.querySelectorAll(`[data-sabor-id="${saborId}"] .btn-mas`).forEach(function (boton) {
        boton.disabled = alLimite;
    });
}

function sincronizarVisual(saborId) {
    const item = carrito.find(function (item) {
        return item.sabor_id === saborId;
    });

    const valorMostrado = item ? item.cantidad : 1;
    document.querySelectorAll(`[data-sabor-id="${saborId}"] .cantidad-valor`).forEach(function (span) {
        span.textContent = valorMostrado;
    });

    pintarCarrito();
    actualizarEstadoBoton(saborId);
}

function pintarCarrito() {
    const lista = document.getElementById('carrito-lista');

    lista.innerHTML = carrito.map(function (item) {
        return `
            <li>
                <div class="carrito-item" data-sabor-id="${item.sabor_id}">
                    <p>${item.nombre}</p>
                    <div class="cantidad-selector">
                        <button class="btn-cantidad btn-menos" type="button">-</button>
                        <span class="cantidad-valor">${item.cantidad}</span>
                        <button class="btn-cantidad btn-mas" type="button">+</button>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}



document.getElementById('lista-productos-contenido').addEventListener('change', function (evento) {
    if (!evento.target.classList.contains('producto-check')) return;

    const fila = evento.target.closest('.producto-item');
    const saborId = fila.dataset.saborId;

    if (evento.target.checked) {
        fila.classList.add('seleccionado');
        agregarAlCarrito(fila);
    } else {
        fila.classList.remove('seleccionado');
        quitarDelCarrito(saborId);
        fila.querySelector('.cantidad-valor').textContent = 1;
    }

    pintarCarrito();
    actualizarEstadoBoton(saborId);
});

document.getElementById('lista-productos-contenido').addEventListener('click', function (evento) {
    const boton = evento.target.closest('.btn-cantidad');
    if (!boton) return;

    const fila = boton.closest('.producto-item');
    const saborId = fila.dataset.saborId;
    const delta = boton.classList.contains('btn-mas') ? 1 : -1;

    cambiarCantidad(saborId, delta);
    sincronizarVisual(saborId);
});



document.getElementById('carrito-lista').addEventListener('click', function (evento) {
    const boton = evento.target.closest('.btn-cantidad');
    if (!boton) return;

    const fila = boton.closest('.carrito-item');
    const saborId = fila.dataset.saborId;
    const delta = boton.classList.contains('btn-mas') ? 1 : -1;

    cambiarCantidad(saborId, delta);
    sincronizarVisual(saborId);
});



document.querySelectorAll('.btn-sugerencia').forEach(function (chip) {
    chip.addEventListener('click', function () {
        document.getElementById('total-input').value = chip.textContent;
    });
});



function obtenerTotalNumerico() {
    const texto = document.getElementById('total-input').value;
    return Number(texto.replace(/\D/g, ''));
}

async function enviarPedido(estado) {
    if (carrito.length === 0) {
        alert('Agregá al menos un sabor al carrito');
        return;
    }

    const total = obtenerTotalNumerico();

    const items = carrito.map(function (item) {
        return { sabor_id: item.sabor_id, cantidad: item.cantidad };
    });

    await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: estado, total: total, items: items })
    });

    reiniciarCarrito();
    cargarProductos();
    if (estado === 'pendiente') cargarPendientes();
}

function reiniciarCarrito() {
    carrito = [];
    document.getElementById('total-input').value = '';
    pintarCarrito();
}

document.getElementById('btn-vender').addEventListener('click', function () {
    enviarPedido('confirmado');
});

document.getElementById('btn-pendiente').addEventListener('click', function () {
    enviarPedido('pendiente');
});

document.getElementById('btn-reiniciar').addEventListener('click', function () {
    reiniciarCarrito();
    document.querySelectorAll('.producto-item.seleccionado').forEach(function (fila) {
        fila.classList.remove('seleccionado');
        fila.querySelector('.producto-check').checked = false;
        fila.querySelector('.cantidad-valor').textContent = 1;
    });
});



async function cargarPendientes() {
    const respuesta = await fetch('/api/pedidos/pendientes');
    const pedidos = await respuesta.json();

    const lista = document.getElementById('pendientes-lista');

    lista.innerHTML = pedidos.map(function (pedido) {
        const detalle = pedido.items.map(function (item) {
            return `${item.cantidad}x ${item.sabor_nombre}`;
        }).join(', ');

        return `
            <li>
                <div class="pendiente-item" data-pedido-id="${pedido.id}">
                    <div class="pendiente-info">
                        <p>Pedido #${pedido.id}</p>
                        <p class="pendiente-detalle">${detalle}</p>
                    </div>
                    <div class="pendiente-acciones">
                        <p class="pendiente-monto">$${pedido.total}</p>
                        <button class="btn-confirmar material-symbols-rounded" type="button">check</button>
                        <button class="btn-cancelar material-symbols-rounded" type="button">close</button>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}

document.getElementById('pendientes-lista').addEventListener('click', async function (evento) {
    const fila = evento.target.closest('.pendiente-item');
    if (!fila) return;

    const pedidoId = fila.dataset.pedidoId;

    if (evento.target.closest('.btn-confirmar')) {
        await fetch('/api/pedidos/' + pedidoId + '/confirmar', { method: 'PATCH' });
        cargarPendientes();
    }

    if (evento.target.closest('.btn-cancelar')) {
        await fetch('/api/pedidos/' + pedidoId + '/cancelar', { method: 'PATCH' });
        cargarPendientes();
        cargarProductos();
    }
});

cargarProductos();
cargarPendientes();