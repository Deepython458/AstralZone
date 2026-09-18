const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const marcasRoutes = require('./routes/marcas');
app.use('/api', marcasRoutes);

const saboresRoutes = require('./routes/sabores');
app.use('/api', saboresRoutes);

const pedidosRoutes = require('./routes/pedidos');
app.use('/api', pedidosRoutes);

const tandaRoutes = require('./routes/tanda');
app.use('/api', tandaRoutes);

const categoriasRoutes = require('./routes/categorias');
app.use('/api', categoriasRoutes);

const dolarRoutes = require('./routes/dolar');
app.use('/api', dolarRoutes);

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});


