document.querySelector('.btn-copiar').addEventListener('click', function () {
    const ocultarCantidad = document.getElementById('toggle-cantidad').checked;
    const marcas = document.querySelectorAll('.marca-grupo');

    let texto = '';

    marcas.forEach(function (marca) {
        const titulo = marca.querySelector('.marca-titulo').textContent.trim();
        texto += titulo + '\n';

        const filas = marca.querySelectorAll('.stock-item .producto-nombre');
        filas.forEach(function (fila) {
            const nombre = fila.childNodes[0].textContent.trim();
            texto += ocultarCantidad ? nombre + '\n' : fila.textContent.trim() + '\n';
        });

        texto += '\n';
    });

    navigator.clipboard.writeText(texto.trim());
});