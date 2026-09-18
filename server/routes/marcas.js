const express = require('express');
const router = express.Router();
const db = require('../db/database');

function numeroALetra(numero){
    let letra = '';
    while (numero > 0){
        const resto = (numero - 1) % 26;
        letra = String.fromCharCode(65 + resto) + letra;
        numero = Math.floor((numero - 1) / 26);
    }
    return letra ;
}

router.post('/marcas', function (req, res) {
    const { nombre, categoria_id } = req.body;

    const cantidadActual = db.prepare('SELECT COUNT(*) AS total FROM marcas').get().total;
    const letra = numeroALetra(cantidadActual + 1);

    const insertar = db.prepare('INSERT INTO marcas (nombre, letra, categoria_id) VALUES (?, ?, ?)');
    const resultado = insertar.run(nombre, letra, categoria_id);

    res.json({ id: resultado.lastInsertRowid, nombre, letra, categoria_id });
});

router.get('/productos', function (req, res) {
    const marcas = db.prepare(`
        SELECT marcas.*, categorias.nombre AS categoria_nombre
        FROM marcas
        LEFT JOIN categorias ON marcas.categoria_id = categorias.id
    `).all();

    const resultado = marcas.map(function (marca) {
        const sabores = db.prepare('SELECT * FROM sabores WHERE marca_id = ?').all(marca.id);
        return {
            ...marca,
            sabores: sabores
        };
    });

    res.json(resultado);
});

router.patch('/marcas/:id/categoria', function (req, res) {
    const { id } = req.params;
    const { categoria_id } = req.body;

    db.prepare('UPDATE marcas SET categoria_id = ? WHERE id = ?').run(categoria_id, id);

    res.json({ id, categoria_id });
});

module.exports = router;