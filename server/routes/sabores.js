const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { route } = require('./marcas');

router.post('/sabores', function (req, res){
    const { marca_id, nombre, cantidad, emoji_1, emoji_2} = req.body

    const insertar = db.prepare(
        'INSERT INTO sabores (marca_id, nombre, cantidad, emoji_1, emoji_2) VALUES (?, ?, ?, ?, ?)'
    );
    const resultado = insertar.run(marca_id, nombre, cantidad, emoji_1, emoji_2);

    res.json({
        id: resultado.lastInsertRowid,
        marca_id,
        nombre,
        cantidad,
        emoji_1,
        emoji_2
    });
});

router.patch('/sabores/:id/cantidad', function (req, res) {
    const { delta } = req.body;
    const { id } = req.params;

    const actualizar = db.prepare('UPDATE sabores SET cantidad = MAX(cantidad + ?, 0) WHERE id = ?');
    actualizar.run(delta, id);

    const sabor = db.prepare('SELECT * FROM sabores WHERE id = ?').get(id);
    res.json(sabor);
});

router.delete('/sabores/:id', function (req, res) {
    const { id } = req.params;

    const eliminar = db.prepare('DELETE FROM sabores WHERE id = ?');
    eliminar.run(id);

    res.json({ eliminado: true, id: id });
});

module.exports = router;