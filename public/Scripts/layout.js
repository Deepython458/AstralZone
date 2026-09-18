fetch('/sidebar.html')
    .then(function (respuesta) {
        return respuesta.text();
    })
    .then(function (html) {
        document.getElementById('sidebar-container').innerHTML = html;
        marcarLinkActivo();
        activarMenuMobile();
    });

function marcarLinkActivo() {
    const links = document.querySelectorAll('.sidebar-list--iteam[href]');

    links.forEach(function (link) {
        if (link.pathname === window.location.pathname) {
            link.id = 'Link-active';
        }
    });
}

function activarMenuMobile() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function abrir() {
        sidebar.classList.add('abierto');
        overlay.classList.add('activo');
    }

    function cerrar() {
        sidebar.classList.remove('abierto');
        overlay.classList.remove('activo');
    }

    document.getElementById('btn-hamburguesa').addEventListener('click', abrir);
    overlay.addEventListener('click', cerrar);

    document.querySelectorAll('.sidebar-list--iteam').forEach(function (link) {
        link.addEventListener('click', cerrar);
    });
}