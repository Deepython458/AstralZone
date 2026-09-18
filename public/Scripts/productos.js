async function cargarProductos() {
    const respuesta = await fetch('/api/productos');
    const marcas = await respuesta.json();

    const contenedor = document.getElementById('productos-grid');
    const tarjetaNueva = document.getElementById('btn-nueva-marca');

    marcas.forEach(function (marca) {
        const tarjeta = crearTarjetaMarca(marca);
        contenedor.insertBefore(tarjeta, tarjetaNueva);
    });

    activarDespliegue();
}

function crearFilaSaborHTML(sabor) {
    return `
        <li>
            <div class="sabor-item" data-sabor-id="${sabor.id}">
                <p>${sabor.emoji_1 || ''} ${sabor.emoji_2 || ''} ${sabor.nombre}</p>
                <div class="cantidad-selector">
                    <button class="btn-cantidad btn-menos" type="button">-</button>
                    <span class="cantidad-valor">${sabor.cantidad}</span>
                    <button class="btn-cantidad btn-mas" type="button">+</button>
                </div>
            </div>
        </li>
    `;
}

function crearTarjetaMarca(marca) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'marca-card';
    tarjeta.dataset.marcaId = marca.id;

    const listaSabores = marca.sabores.map(crearFilaSaborHTML).join('');

    tarjeta.innerHTML = `
        <div class="marca-card--header">
            <p class="marca-card--nombre">${marca.nombre}</p>
            <span class="material-symbols-rounded marca-card--chevron">expand_more</span>
        </div>
        <div class="marca-card--sabores">
            <ul>${listaSabores}</ul>
            <button class="btn-agregar-sabor" type="button">
                <span class="material-symbols-rounded">add</span> Agregar sabor
            </button>
        </div>
    `;

    return tarjeta;
}

function activarDespliegue() {
    document.querySelectorAll('.marca-card--header').forEach(function (header) {
        header.addEventListener('click', function () {
            const card = header.closest('.marca-card');
            card.classList.toggle('expandida');
        });
    });
}

// ===== Modal: Nueva marca =====

document.getElementById('btn-nueva-marca').addEventListener('click', function () {
    document.getElementById('modal-marca').classList.add('activo');
});

document.getElementById('form-marca').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('input-marca-nombre').value;
    const categoria_id = document.getElementById('input-marca-categoria').value;

    const respuesta = await fetch('/api/marcas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, categoria_id })
    });

    const nuevaMarca = await respuesta.json();
    nuevaMarca.sabores = [];

    const tarjeta = crearTarjetaMarca(nuevaMarca);
    const contenedor = document.getElementById('productos-grid');
    contenedor.insertBefore(tarjeta, document.getElementById('btn-nueva-marca'));
    activarDespliegue();

    document.getElementById('form-marca').reset();
    document.getElementById('modal-marca').classList.remove('activo');
});

// ===== Modal: Nuevo sabor =====

let marcaIdActual = null;

document.getElementById('productos-grid').addEventListener('click', function (evento) {
    if (evento.target.closest('.btn-agregar-sabor')) {
        const tarjeta = evento.target.closest('.marca-card');
        marcaIdActual = tarjeta.dataset.marcaId;
        document.getElementById('modal-sabor').classList.add('activo');
    }
});

document.getElementById('form-sabor').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('input-sabor-nombre').value;
    const cantidad = Number(document.getElementById('input-sabor-cantidad').value);
    const emoji_1 = document.getElementById('input-sabor-emoji1').value;
    const emoji_2 = document.getElementById('input-sabor-emoji2').value;

    const respuesta = await fetch('/api/sabores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marca_id: marcaIdActual, nombre, cantidad, emoji_1, emoji_2 })
    });

    const nuevoSabor = await respuesta.json();

    const tarjeta = document.querySelector(`.marca-card[data-marca-id="${marcaIdActual}"]`);
    const lista = tarjeta.querySelector('.marca-card--sabores ul');
    lista.insertAdjacentHTML('beforeend', crearFilaSaborHTML(nuevoSabor));

    document.getElementById('form-sabor').reset();
    document.getElementById('modal-sabor').classList.remove('activo');
});

// ===== Cerrar modales =====

document.querySelectorAll('.modal-cerrar').forEach(function (boton) {
    boton.addEventListener('click', function () {
        boton.closest('.modal-overlay').classList.remove('activo');
    });
});

document.getElementById('productos-grid').addEventListener('click', async function (evento) {
    const boton = evento.target.closest('.btn-cantidad');
    if (!boton) return;

    const fila = boton.closest('.sabor-item');
    const saborId = fila.dataset.saborId;
    const delta = boton.classList.contains('btn-mas') ? 1 : -1;

    const respuesta = await fetch('/api/sabores/' + saborId + '/cantidad', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: delta })
    });

    const saborActualizado = await respuesta.json();
    fila.querySelector('.cantidad-valor').textContent = saborActualizado.cantidad;
});

async function cargarCategorias() {
    const respuesta = await fetch('/api/categorias');
    const categorias = await respuesta.json();

    const select = document.getElementById('input-marca-categoria');
    select.innerHTML = categorias.map(function (categoria) {
        return `<option value="${categoria.id}">${categoria.nombre}</option>`;
    }).join('');
}

document.getElementById('btn-nueva-categoria').addEventListener('click', function () {
    document.getElementById('modal-categoria').classList.add('activo');
});

document.getElementById('form-categoria').addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('input-categoria-nombre').value;

    await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
    });

    await cargarCategorias();

    document.getElementById('form-categoria').reset();
    document.getElementById('modal-categoria').classList.remove('activo');
});

cargarCategorias();
cargarProductos();