const express = require('express');
const router = express.Router();
const db = require('../db/database');


router.post('/pedidos', function (req, res) {
    const { estado, total, items } = req.body;

    const tandaActiva = db.prepare('SELECT id FROM tandas WHERE activa = 1').get();

    if (!tandaActiva) {
        return res.status(400).json({ error: 'No hay ninguna tanda activa. Iniciá una tanda primero.' });
    }

    const crearPedidoCompleto = db.transaction(function () {
        const insertarPedido = db.prepare('INSERT INTO pedidos (estado, total, tanda_id) VALUES (?, ?, ?)');
        const resultadoPedido = insertarPedido.run(estado, total, tandaActiva.id);
        const pedidoId = resultadoPedido.lastInsertRowid;

        const insertarItem = db.prepare('INSERT INTO pedido_items (pedido_id, sabor_id, cantidad) VALUES (?, ?, ?)');
        const descontarStock = db.prepare('UPDATE sabores SET cantidad = MAX(cantidad - ?, 0) WHERE id = ?');

        items.forEach(function (item) {
            insertarItem.run(pedidoId, item.sabor_id, item.cantidad);
            descontarStock.run(item.cantidad, item.sabor_id);
        });

        return pedidoId;
    });

    const pedidoId = crearPedidoCompleto();
    res.json({ id: pedidoId, estado, total });
});
// Confirmar un pedido pendiente
router.patch('/pedidos/:id/confirmar', function (req, res) {
    const { id } = req.params;
    db.prepare("UPDATE pedidos SET estado = 'confirmado' WHERE id = ?").run(id);
    res.json({ id, estado: 'confirmado' });
});

// Cancelar un pedido pendiente (devuelve el stock)
router.patch('/pedidos/:id/cancelar', function (req, res) {
    const { id } = req.params;

    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);

    if (!pedido) {
        return res.status(404).json({ error: 'El pedido no existe' });
    }

    if (pedido.estado !== 'pendiente') {
        return res.status(400).json({ error: 'Solo se pueden cancelar pedidos pendientes' });
    }

    const cancelarYDevolver = db.transaction(function () {
        const items = db.prepare('SELECT * FROM pedido_items WHERE pedido_id = ?').all(id);
        const sumarStock = db.prepare('UPDATE sabores SET cantidad = cantidad + ? WHERE id = ?');

        items.forEach(function (item) {
            sumarStock.run(item.cantidad, item.sabor_id);
        });

        db.prepare("UPDATE pedidos SET estado = 'cancelado' WHERE id = ?").run(id);
    });

    cancelarYDevolver();
    res.json({ id, estado: 'cancelado' });
});

// Listar pedidos pendientes con su detalle
router.get('/pedidos/pendientes', function (req, res) {
    const pedidos = db.prepare("SELECT * FROM pedidos WHERE estado = 'pendiente'").all();

    const resultado = pedidos.map(function (pedido) {
        const items = db.prepare(`
            SELECT pedido_items.cantidad, sabores.nombre AS sabor_nombre, marcas.nombre AS marca_nombre
            FROM pedido_items
            JOIN sabores ON pedido_items.sabor_id = sabores.id
            JOIN marcas ON sabores.marca_id = marcas.id
            WHERE pedido_items.pedido_id = ?
        `).all(pedido.id);

        return { ...pedido, items: items };
    });

    res.json(resultado);
});

router.get('/pedidos/recientes', function (req, res) {
    const pedidos = db.prepare(
        "SELECT * FROM pedidos WHERE estado = 'confirmado' ORDER BY fecha DESC LIMIT 5"
    ).all();

    const resultado = pedidos.map(function (pedido) {
        const items = db.prepare(`
            SELECT pedido_items.cantidad, sabores.nombre AS sabor_nombre
            FROM pedido_items
            JOIN sabores ON pedido_items.sabor_id = sabores.id
            WHERE pedido_items.pedido_id = ?
        `).all(pedido.id);

        return { ...pedido, items: items };
    });

    res.json(resultado);
});

module.exports = router;