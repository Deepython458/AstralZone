const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'astralzone.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS marcas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    letra TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS sabores(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,
    emoji_1 TEXT,
    emoji_2 TEXT,
    FOREIGN KEY (marca_id) REFERENCES marcas(id)
    );
    `);

    module.exports = db;