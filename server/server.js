const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});