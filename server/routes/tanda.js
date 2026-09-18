const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/tanda/actual', function (req, res) {
    const tanda = db.prepare('SELECT * FROM tandas WHERE activa = 1').get();

    if (!tanda) {
        return res.json({ existe: false });
    }

    const resultado = db.prepare(
        "SELECT COALESCE(SUM(total), 0) AS saldo FROM pedidos WHERE tanda_id = ? AND estado = 'confirmado'"
    ).get(tanda.id);

    const saldo = resultado.saldo;
    const ganancia = Math.max(saldo - tanda.monto_invertido, 0);

    res.json({
        existe: true,
        id: tanda.id,
        monto_invertido: tanda.monto_invertido,
        saldo: saldo,
        ganancia: ganancia
    });
});

router.post('/tanda/reiniciar', function (req, res) {
    const { monto_invertido } = req.body;

    const reiniciar = db.transaction(function () {
        db.prepare('UPDATE tandas SET activa = 0 WHERE activa = 1').run();
        const resultado = db.prepare('INSERT INTO tandas (monto_invertido) VALUES (?)').run(monto_invertido);
        return resultado.lastInsertRowid;
    });

    const nuevaTandaId = reiniciar();
    res.json({ id: nuevaTandaId, monto_invertido: monto_invertido });
});

router.patch('/tanda/actual/monto', function (req, res) {
    const { monto_invertido } = req.body;

    const tandaActiva = db.prepare('SELECT * FROM tandas WHERE activa = 1').get();

    if (!tandaActiva) {
        return res.status(400).json({ error: 'No hay ninguna tanda activa' });
    }

    db.prepare('UPDATE tandas SET monto_invertido = ? WHERE id = ?').run(monto_invertido, tandaActiva.id);

    res.json({ id: tandaActiva.id, monto_invertido });
});

module.exports = router;