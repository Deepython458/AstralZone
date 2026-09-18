const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/categorias', function (req, res) {
    const categorias = db.prepare('SELECT * FROM categorias').all();
    res.json(categorias);
});

router.post('/categorias', function (req, res) {
    const { nombre } = req.body;
    const insertar = db.prepare('INSERT INTO categorias (nombre) VALUES (?)');
    const resultado = insertar.run(nombre);
    res.json({ id: resultado.lastInsertRowid, nombre });
});
router.get('/categorias/ganancias', function (req, res) {
    const tandaActiva = db.prepare('SELECT id FROM tandas WHERE activa = 1').get();

    if (!tandaActiva) {
        return res.json([]);
    }

    const pedidos = db.prepare(`
        SELECT id, total FROM pedidos
        WHERE tanda_id = ? AND estado = 'confirmado'
    `).all(tandaActiva.id);

    const gananciasPorCategoria = {};

    pedidos.forEach(function (pedido) {
        const items = db.prepare(`
            SELECT pedido_items.cantidad, categorias.id AS categoria_id, categorias.nombre AS categoria_nombre
            FROM pedido_items
            JOIN sabores ON pedido_items.sabor_id = sabores.id
            JOIN marcas ON sabores.marca_id = marcas.id
            JOIN categorias ON marcas.categoria_id = categorias.id
            WHERE pedido_items.pedido_id = ?
        `).all(pedido.id);

        const totalUnidades = items.reduce(function (suma, item) {
            return suma + item.cantidad;
        }, 0);

        items.forEach(function (item) {
            const proporcion = item.cantidad / totalUnidades;
            const montoAsignado = pedido.total * proporcion;

            if (!gananciasPorCategoria[item.categoria_id]) {
                gananciasPorCategoria[item.categoria_id] = { nombre: item.categoria_nombre, monto: 0 };
            }

            gananciasPorCategoria[item.categoria_id].monto += montoAsignado;
        });
    });

    const resultado = Object.values(gananciasPorCategoria).map(function (categoria) {
        return { nombre: categoria.nombre, monto: Math.round(categoria.monto) };
    });

    res.json(resultado);
});
module.exports = router;