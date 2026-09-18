function formatearMoneda(numero) {
    return '$ ' + Number(numero).toLocaleString('es-AR');
}

// ===== Tanda (saldo / inversión / ganancia) =====

let visible = true;
let valoresReales = { saldo: 0, inversion: 0, ganancia: 0 };

async function cargarTanda() {
    const respuesta = await fetch('/api/tanda/actual');
    const tanda = await respuesta.json();

    if (!tanda.existe) return;

    valoresReales = { saldo: tanda.saldo, inversion: tanda.monto_invertido, ganancia: tanda.ganancia };
    pintarMontos();
}

function pintarMontos() {
    document.getElementById('cash-mount').textContent = visible ? formatearMoneda(valoresReales.saldo) : '••••••';
    document.getElementById('monto-inversion').textContent = visible ? formatearMoneda(valoresReales.inversion) : '••••••';
    document.getElementById('monto-ganancia').textContent = visible ? formatearMoneda(valoresReales.ganancia) : '••••••';
}

document.getElementById('toggle-visibilidad').addEventListener('click', function () {
    visible = !visible;
    this.src = visible ? '/Material/visibility_on.png' : '/Material/visibility_off.png';
    pintarMontos();
});

// ===== Modal: Reiniciar Tanda =====

document.getElementById('btn-reiniciar-tanda').addEventListener('click', function () {
    document.getElementById('modal-tanda').classList.add('activo');
});

document.getElementById('form-tanda').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const monto = Number(document.getElementById('input-monto-inversion').value);

    await fetch('/api/tanda/reiniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_invertido: monto })
    });

    document.getElementById('form-tanda').reset();
    document.getElementById('modal-tanda').classList.remove('activo');
    cargarTanda();
});

// ===== Modal: Editar inversión (sin reiniciar tanda) =====

document.getElementById('btn-editar-inversion').addEventListener('click', function () {
    document.getElementById('input-editar-inversion').value = valoresReales.inversion;
    document.getElementById('modal-inversion').classList.add('activo');
});

document.getElementById('form-inversion').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const monto = Number(document.getElementById('input-editar-inversion').value);

    await fetch('/api/tanda/actual/monto', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_invertido: monto })
    });

    document.getElementById('modal-inversion').classList.remove('activo');
    cargarTanda();
});

// ===== Cerrar modales (genérico) =====

document.querySelectorAll('.modal-cerrar').forEach(function (boton) {
    boton.addEventListener('click', function () {
        boton.closest('.modal-overlay').classList.remove('activo');
    });
});

// ===== Dólar =====

async function cargarDolar() {
    const respuesta = await fetch('/api/dolar');
    const data = await respuesta.json();

    pintarDolar('usdt', data.usdt);
    pintarDolar('blue', data.blue);
}

function pintarDolar(tipo, info) {
    const contenedor = document.querySelector(`.panel-dolar--col[data-tipo="${tipo}"]`);
    const valorDiv = contenedor.querySelector('.panel-dolar--valor');

    valorDiv.classList.remove('subio', 'bajo');

    let icono = 'remove';
    if (info.direccion === 'subio') {
        icono = 'arrow_upward';
        valorDiv.classList.add('subio');
    }
    if (info.direccion === 'bajo') {
        icono = 'arrow_downward';
        valorDiv.classList.add('bajo');
    }

    valorDiv.innerHTML = `
        <span>$${info.valor}</span>
        <span class="material-symbols-rounded">${icono}</span>
    `;
}

// ===== Categorías =====

async function cargarCategorias() {
    const respuesta = await fetch('/api/categorias/ganancias');
    const categorias = await respuesta.json();

    const lista = document.querySelector('.panel-categorias ul');
    lista.innerHTML = categorias.map(function (categoria) {
        return `
            <li>
                <div class="categoria">
                    <div class="categoria-info">
                        <span class="material-symbols-rounded">deployed_code</span>
                        <p>${categoria.nombre}</p>
                    </div>
                    <p class="categoria-monto">${formatearMoneda(categoria.monto)}</p>
                </div>
            </li>
        `;
    }).join('');
}

// ===== Alertas =====

const UMBRAL_STOCK_BAJO = 5;

async function cargarAlertas() {
    const respuesta = await fetch('/api/productos');
    const marcas = await respuesta.json();

    const todosSabores = marcas.flatMap(function (marca) {
        return marca.sabores;
    });

    const stockBajo = todosSabores.filter(function (sabor) {
        return sabor.cantidad > 0 && sabor.cantidad < UMBRAL_STOCK_BAJO;
    });

    document.querySelector('.panel-alertas--titulo .badge').textContent = stockBajo.length;

    const ultimasCinco = stockBajo.slice(-5).reverse();

    const lista = document.querySelector('.panel-alertas ul');
    lista.innerHTML = ultimasCinco.map(function (sabor) {
        return `
            <li>
                <div class="alerta">
                    <span class="material-symbols-rounded icono-cuadrado amarillo">warning</span>
                    <div class="alerta-texto">
                        <p class="alerta-principal">${sabor.nombre} con stock bajo</p>
                        <p class="alerta-secundario">${sabor.cantidad} unidades restantes</p>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    inyectarAlertasTopbar(stockBajo.length);
}

function inyectarAlertasTopbar(cantidad) {
    const contenedor = document.getElementById('topbar-acciones');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <button class="btn-alertas-mobile" type="button" id="btn-alertas-mobile">
            <span class="material-symbols-rounded">notifications</span>
            ${cantidad > 0 ? `<span class="badge-alertas">${cantidad}</span>` : ''}
        </button>
    `;

    document.getElementById('btn-alertas-mobile').addEventListener('click', function () {
        document.getElementById('modal-alertas').classList.add('activo');
        document.querySelector('#modal-alertas .modal-alertas-contenido').innerHTML =
            document.querySelector('.panel-alertas ul').innerHTML;
    });
}

// ===== Últimas ventas =====

async function cargarUltimasVentas() {
    const respuesta = await fetch('/api/pedidos/recientes');
    const pedidos = await respuesta.json();

    const lista = document.getElementById('ultimas-ventas-lista');

    lista.innerHTML = pedidos.map(function (pedido) {
        const totalUnidades = pedido.items.reduce(function (suma, item) {
            return suma + item.cantidad;
        }, 0);

        const primerNombre = pedido.items[0] ? pedido.items[0].sabor_nombre : '';
        const extra = pedido.items.length > 1 ? ` +${pedido.items.length - 1}` : '';

        return `
            <li>
                <div class="iteam">
                    <div class="iteam-info">
                        <p>x${totalUnidades}</p>
                        <span class="material-symbols-rounded">deployed_code</span>
                        <p>${primerNombre}${extra}</p>
                    </div>
                    <div class="iteam-count">
                        <p>${formatearMoneda(pedido.total)}</p>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}

cargarTanda();
cargarDolar();
cargarCategorias();
cargarAlertas();
cargarUltimasVentas();