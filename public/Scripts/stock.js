const UMBRAL_STOCK_BAJO = 3;

async function cargarStock(){
    const repuesta = await fetch('/api/productos');
    const marcas = await repuesta.json();

    pintarLista(marcas);
    pintarStockBajo(marcas);
}

function pintarLista(marcas) {
    const contenedor = document.getElementById('lista-stock-contenido');

    contenedor.innerHTML = marcas.map(function (marca) {
        const saboresConStock = marca.sabores.filter(function (sabor) {
            return sabor.cantidad > 0;
        });

        if (saboresConStock.length === 0) return '';

        const filas = saboresConStock.map(function (sabor) {
            return `
                <li>
                    <div class="stock-item" data-nombre="${sabor.nombre.toLowerCase()}" data-marca="${marca.nombre.toLowerCase()}">
                        <p class="producto-nombre">${sabor.emoji_1 || ''} ${sabor.emoji_2 || ''} ${sabor.nombre} <span class="stock-cantidad">: ${sabor.cantidad}</span></p>
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

function pintarStockBajo(marcas) {
    const todosSabores = marcas.flatMap(function (marca) {
        return marca.sabores.map(function (sabor) {
            return { ...sabor, marca_nombre: marca.nombre };
        });
    });

    const stockBajo = todosSabores.filter(function (sabor) {
    return sabor.cantidad > 0 && sabor.cantidad < UMBRAL_STOCK_BAJO;
    });
    document.getElementById('badge-stock-bajo').textContent = stockBajo.length;

    const lista = document.getElementById('lista-stock-bajo');
    lista.innerHTML = stockBajo.map(function (sabor) {
        return `
            <li>
                <div class="stock-bajo-item">
                    <span class="material-symbols-rounded icono-cuadrado amarillo">warning</span>
                    <div class="stock-bajo-texto">
                        <p class="stock-bajo-nombre">${sabor.nombre} <span class="stock-bajo-marca">(${sabor.marca_nombre})</span></p>
                        <p class="stock-bajo-detalle">${sabor.cantidad} unidades restantes</p>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}

document.querySelector('.buscador input').addEventListener('input', function (evento) {
    const texto = evento.target.value.toLowerCase().trim();

    document.querySelectorAll('.stock-item').forEach(function (fila) {
        const coincide = fila.dataset.nombre.includes(texto) || fila.dataset.marca.includes(texto);
        fila.style.display = coincide ? 'flex' : 'none';
    });

    document.querySelectorAll('.marca-grupo').forEach(function (grupo) {
        const tieneVisibles = grupo.querySelectorAll('.stock-item:not([style*="display: none"])').length > 0;
        grupo.style.display = tieneVisibles ? 'block' : 'none';
    });
});

document.getElementById('toggle-cantidad').addEventListener('change', function (evento) {
    document.querySelectorAll('.stock-cantidad').forEach(function (span) {
        span.style.display = evento.target.checked ? 'none' : 'inline';
    });
});

document.querySelector('.btn-copiar').addEventListener('click', function () {
    const ocultarCantidad = document.getElementById('toggle-cantidad').checked;
    const marcas = document.querySelectorAll('.marca-grupo');

    let texto = '';
    marcas.forEach(function (marca) {
        const titulo = marca.querySelector('.marca-titulo').textContent.trim();
        texto += titulo + '\n';

        marca.querySelectorAll('.stock-item .producto-nombre').forEach(function (fila) {
            const nombre = fila.childNodes[0].textContent.trim();
            texto += ocultarCantidad ? nombre + '\n' : fila.textContent.trim() + '\n';
        });

        texto += '\n';
    });

    navigator.clipboard.writeText(texto.trim());
});

cargarStock();