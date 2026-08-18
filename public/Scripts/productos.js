document.querySelectorAll('.marca-card--header').forEach(function (header) {
    header.addEventListener('click', function () {
        const card = header.closest('.marca-card');
        card.classList.toggle('expandida');
    });
});