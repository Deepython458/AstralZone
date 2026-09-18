const express = require('express');
const router = express.Router();
const db = require('../db/database');

async function obtenerBlue() {
    const respuesta = await fetch('https://dolarapi.com/v1/dolares/blue');
    const data = await respuesta.json();
    return data.venta;
}

async function obtenerUsdt() {
    const respuesta = await fetch('https://criptoya.com/api/usdt/ars/1');
    const data = await respuesta.json();

    const valoresVenta = Object.values(data).map(function (exchange) {
        return exchange.bid;
    });

    return Math.max(...valoresVenta);
}

function calcularDireccion(tipo, valorNuevo) {
    const anterior = db.prepare('SELECT valor FROM cotizacion_dolar WHERE tipo = ?').get(tipo);

    db.prepare(`
        INSERT INTO cotizacion_dolar (tipo, valor) VALUES (?, ?)
        ON CONFLICT(tipo) DO UPDATE SET valor = excluded.valor, fecha = CURRENT_TIMESTAMP
    `).run(tipo, valorNuevo);

    if (!anterior) return 'igual';
    if (valorNuevo > anterior.valor) return 'subio';
    if (valorNuevo < anterior.valor) return 'bajo';
    return 'igual';
}

router.get('/dolar', async function (req, res) {
    try {
        const [blue, usdt] = await Promise.all([obtenerBlue(), obtenerUsdt()]);

        const direccionBlue = calcularDireccion('blue', blue);
        const direccionUsdt = calcularDireccion('usdt', usdt);

        res.json({
            blue: { valor: Math.round(blue), direccion: direccionBlue },
            usdt: { valor: Math.round(usdt), direccion: direccionUsdt }
        });
    } catch (error) {
        res.status(502).json({ error: 'No se pudo obtener la cotización' });
    }
});

module.exports = router;