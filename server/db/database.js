const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'astralzone.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS marcas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        letra TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sabores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marca_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 0,
        emoji_1 TEXT,
        emoji_2 TEXT,
        FOREIGN KEY (marca_id) REFERENCES marcas(id)
    );

    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estado TEXT NOT NULL,
        total INTEGER NOT NULL,
        fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pedido_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        sabor_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
        FOREIGN KEY (sabor_id) REFERENCES sabores(id)
    );
    CREATE TABLE IF NOT EXISTS tandas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto_invertido INTEGER NOT NULL,
        fecha_inicio TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        activa INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cotizacion_dolar (
        tipo TEXT PRIMARY KEY,
        valor REAL NOT NULL,
        fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);
try {
    db.exec('ALTER TABLE marcas ADD COLUMN categoria_id INTEGER REFERENCES categorias(id);');
} catch (error) {

}

try {
    db.exec('ALTER TABLE pedidos ADD COLUMN tanda_id INTEGER REFERENCES tandas(id);');
} catch (error) {
   
}

module.exports = db;