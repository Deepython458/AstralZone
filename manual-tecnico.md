# Manual Técnico — ASTRALZONE v1.0

## 1. Resumen del proyecto

ASTRALZONE es un dashboard de administración y venta (tipo POS) para un negocio de venta de vapes/e-liquids, organizado por categoría → marca → sabor, con control de stock, ventas, pedidos pendientes y seguimiento financiero por "tandas" de inversión.

## 2. Stack tecnológico

- **Frontend**: HTML, CSS y JavaScript puro (sin frameworks), organizado en archivos separados por responsabilidad.
- **Backend**: Node.js + Express.
- **Base de datos**: SQLite, mediante la librería `better-sqlite3` (API sincrónica).
- **Librerías externas**: ApexCharts (gráfico de ventas), Material Symbols (íconos), fuente vía Google Fonts.
- **APIs externas consumidas**: DolarApi.com (dólar blue) y CriptoYa (USDT).

## 3. Estructura de carpetas

```
AstralZone/
├── public/                      → raíz servida por Express
│   ├── index.html               → Dashboard (Inicio)
│   ├── sidebar.html             → Partial del menú lateral, cargado por fetch
│   ├── pages/
│   │   ├── vender.html
│   │   ├── stock.html
│   │   └── productos.html
│   ├── Style/
│   │   ├── variables.css        → colores/variables :root, compartidas
│   │   ├── componentes.css      → clases reutilizables entre páginas
│   │   ├── sidebar.css
│   │   ├── seccion.css          → layout de Inicio
│   │   ├── panel.css            → panel lateral de Inicio
│   │   ├── card.css             → tarjeta de crédito decorativa
│   │   ├── venta.css
│   │   ├── stock.css
│   │   └── productos.css
│   ├── Scripts/
│   │   ├── layout.js            → carga el sidebar + menú móvil
│   │   ├── animacion.js         → configuración de ApexCharts
│   │   ├── index.js
│   │   ├── vender.js
│   │   ├── stock.js
│   │   └── productos.js
│   └── Material/                → íconos e imágenes
│
├── server/
│   ├── server.js                → punto de entrada del backend
│   ├── db/
│   │   ├── database.js          → conexión + esquema (CREATE TABLE / migraciones)
│   │   └── astralzone.db        → archivo físico de la base de datos
│   └── routes/
│       ├── marcas.js            → incluye GET /productos
│       ├── sabores.js
│       ├── pedidos.js
│       ├── tanda.js
│       ├── categorias.js
│       └── dolar.js
│
├── package.json
└── node_modules/
```

**Regla de organización**: los estilos y scripts compartidos por varias páginas viven en `componentes.css`/`variables.css`; lo específico de una sola página vive en su propio archivo (`venta.css`, `stock.css`, etc.).

## 4. Modelo de datos (SQLite)

### `categorias`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER PK | |
| nombre | TEXT | Ej: "Vapes", "THC" |

### `marcas`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER PK | |
| nombre | TEXT | |
| letra | TEXT | Asignada automáticamente (A, B, C... AA, AB...) |
| categoria_id | INTEGER FK | → categorias.id |

### `sabores`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER PK | |
| marca_id | INTEGER FK | → marcas.id |
| nombre | TEXT | |
| cantidad | INTEGER | Stock actual |
| emoji_1, emoji_2 | TEXT | Emojis representativos |

### `tandas`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER PK | |
| monto_invertido | INTEGER | Capital invertido en esta ronda |
| fecha_inicio | TEXT | Automática |
| activa | INTEGER | 1 = tanda actual, 0 = cerrada. Solo una activa a la vez |

### `pedidos`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER PK | También funciona como "Pedido #N" |
| estado | TEXT | `confirmado` / `pendiente` / `cancelado` |
| total | INTEGER | Monto cargado manualmente en Vender |
| fecha | TEXT | Automática |
| tanda_id | INTEGER FK | → tandas.id (a qué tanda pertenece la venta) |

### `pedido_items`
| Columna | Tipo | Descripción |
|---|---|---|
| id | INTEGER PK | |
| pedido_id | INTEGER FK | → pedidos.id |
| sabor_id | INTEGER FK | → sabores.id |
| cantidad | INTEGER | Unidades de ese sabor en el pedido |

### `cotizacion_dolar`
| Columna | Tipo | Descripción |
|---|---|---|
| tipo | TEXT PK | `blue` / `usdt` |
| valor | REAL | Último valor consultado, para calcular si subió/bajó |
| fecha | TEXT | Automática |

**Migraciones**: como el proyecto creció con la base ya en uso, columnas como `tanda_id` y `categoria_id` se agregaron con `ALTER TABLE ... ADD COLUMN`, envuelto en `try/catch` en `database.js` para que no falle si la columna ya existe en ejecuciones posteriores.

## 5. Lógica de negocio clave

### Tandas y ganancia
- El `saldo` de la tanda activa es la suma de `total` de todos los `pedidos` con `estado = 'confirmado'` de esa tanda.
- La `ganancia` es `MAX(saldo - monto_invertido, 0)` — nunca negativa.
- "Reiniciar Tanda" cierra la tanda activa (`activa = 0`) y crea una nueva con el monto indicado. El saldo arranca de cero; el histórico de tandas anteriores no se borra.
- El monto invertido de la tanda activa puede editarse sin resetear el saldo (`PATCH /api/tanda/actual/monto`).

### Pedidos (ventas)
- **Vender** (directo): crea el pedido con `estado = 'confirmado'`, descuenta stock inmediatamente.
- **Pendiente**: crea el pedido con `estado = 'pendiente'`, descuenta stock igual (reserva).
- **Confirmar** un pendiente: cambia a `'confirmado'`, no toca stock (ya se había descontado).
- **Cancelar** un pendiente: devuelve el stock descontado y cambia a `'cancelado'`. Protegido contra doble cancelación y contra cancelar pedidos inexistentes.
- La creación y cancelación de pedidos usan `db.transaction(...)` para garantizar que los cambios (cabecera + items + stock) se apliquen todos juntos o ninguno.

### Ganancias por categoría
- Como el precio se carga manualmente por pedido completo (no por sabor individual), el monto de cada venta se reparte **proporcionalmente** entre las categorías involucradas, según la cantidad de unidades de cada una.
- Se calcula solo sobre pedidos confirmados de la tanda activa.

### Stock bajo / alertas
- Umbral fijo definido como constante (`UMBRAL_STOCK_BAJO = 5`) en el frontend.
- Un sabor con cantidad 0 no se considera "alerta" (se excluye), ya que directamente no aparece en las listas de Vender/Stock.

## 6. Rutas de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Marcas con sus sabores anidados (y `categoria_nombre`) |
| POST | `/api/marcas` | Crea marca (letra automática) |
| PATCH | `/api/marcas/:id/categoria` | Cambia la categoría de una marca |
| POST | `/api/sabores` | Crea sabor |
| PATCH | `/api/sabores/:id/cantidad` | Ajusta stock (`delta: +1/-1`), nunca baja de 0 |
| DELETE | `/api/sabores/:id` | Elimina un sabor |
| GET | `/api/categorias` | Lista categorías |
| POST | `/api/categorias` | Crea categoría |
| GET | `/api/categorias/ganancias` | Ganancias repartidas por categoría (tanda activa) |
| POST | `/api/pedidos` | Crea pedido (confirmado o pendiente) con sus items |
| GET | `/api/pedidos/pendientes` | Pedidos pendientes con detalle |
| GET | `/api/pedidos/recientes` | Últimos 5 pedidos confirmados |
| PATCH | `/api/pedidos/:id/confirmar` | Confirma un pendiente |
| PATCH | `/api/pedidos/:id/cancelar` | Cancela y devuelve stock |
| GET | `/api/tanda/actual` | Saldo, inversión y ganancia de la tanda activa |
| POST | `/api/tanda/reiniciar` | Cierra la tanda activa y abre una nueva |
| PATCH | `/api/tanda/actual/monto` | Edita el monto invertido sin reiniciar |
| GET | `/api/dolar` | Cotización blue/USDT + dirección (subió/bajó/igual) |

## 7. Patrones de frontend usados

- **Renderizado dinámico**: cada página pide sus datos con `fetch` y genera el HTML con template literals (`` `<li>...${variable}...</li>` ``), en vez de tener contenido fijo.
- **Delegación de eventos**: los listeners se ponen en el contenedor padre (ej. `.marca-card--header` para todas las tarjetas), no en cada elemento individual, porque estos se crean dinámicamente.
- **Estado en memoria**: el carrito de Vender vive como un array JS (`carrito`) mientras se arma, y se "pinta" en el DOM cada vez que cambia — no se sincroniza contra el servidor hasta confirmar la venta.
- **`data-*` como puente HTML↔JS**: `data-sabor-id`, `data-marca-id`, `data-pedido-id` permiten que el JS sepa a qué registro corresponde cada elemento visual.
- **Modales genéricos**: `.modal-overlay` / `.modal-panel` reutilizables en todas las páginas, con la misma lógica de abrir/cerrar (`classList.add/remove('activo')`).

## 8. Responsive

Breakpoint único en `768px`. Estrategia principal:
- Sidebar fijo en desktop → menú hamburguesa deslizante en móvil (`position: fixed` + clase `.abierto`).
- Reordenamiento de bloques con la propiedad CSS `order` dentro de contenedores flex, sin duplicar HTML.
- Paneles secundarios (alertas de Inicio) se ocultan y se accede a ellos por un ícono en la barra superior móvil, que abre un modal con el mismo contenido.
- `box-sizing: border-box` global — evita que `padding`/`border` desborden el `width: 100%` en pantallas angostas.
