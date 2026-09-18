# Manual de Deploy — ASTRALZONE v1.0

## 1. Requisito clave: elegir el hosting correcto

ASTRALZONE usa **SQLite**, que guarda toda la base de datos en **un único archivo** (`server/db/astralzone.db`) dentro del propio proyecto.

**Esto funciona perfecto en:**
- Un VPS (servidor virtual privado) tradicional — DigitalOcean, Hetzner, un servidor propio, etc.
- Cualquier hosting donde tu aplicación Node corra como un **proceso persistente** (siempre encendido).

**Esto NO funciona en:**
- Hosting "serverless" (ej. Vercel para funciones, AWS Lambda) — estos entornos **borran el sistema de archivos** entre peticiones, así que perderías los datos guardados.

Si en algún momento migrás a un hosting serverless, primero hay que migrar la base de datos a un servicio externo (PostgreSQL, MySQL gestionado, etc.) — no es parte de este manual v1.0.

## 2. Requisitos previos en el servidor

- Node.js instalado (versión 20 o superior recomendada, la misma con la que se desarrolló).
- Acceso por SSH o consola al servidor.
- Un dominio (opcional para empezar; se puede usar la IP del servidor directamente al principio).

## 3. Preparar el proyecto para subir

Antes de copiar el proyecto al servidor:

1. **No subas `node_modules`** — se reinstala en el servidor con `npm install`, así evitás llevar archivos compilados para tu sistema operativo (Windows) que no van a funcionar en el servidor (generalmente Linux).
2. **No subas el archivo `astralzone.db`** si el servidor va a arrancar con una base limpia. Si en cambio querés **migrar tus datos actuales**, sí copiá ese archivo puntual (ver sección 6).
3. Confirmá que tu `package.json` tenga listadas las dependencias (`express`, `better-sqlite3`) — así `npm install` en el servidor las instala automáticamente.

Un archivo `.gitignore` (si usás Git para subir el código) debería excluir al menos:
```
node_modules/
server/db/astralzone.db
```

## 4. Subir el proyecto

Opciones típicas, elegí la que te resulte más cómoda:

- **Git**: subir el repositorio a GitHub/GitLab, y clonarlo directo en el servidor con `git clone`.
- **SCP/SFTP**: copiar la carpeta del proyecto directo por una conexión segura de archivos.

## 5. Instalar y correr en el servidor

Parado en la carpeta del proyecto, en el servidor:

```bash
npm install
node server/db/database.js
node server/server.js
```

El primer comando instala las dependencias. El segundo crea la base de datos y sus tablas si no existen. El tercero arranca el servidor.

**Importante**: `better-sqlite3` compila una parte nativa al instalarse. Si el servidor es Linux, esto normalmente no requiere pasos extra (no debería repetir el problema de Visual Studio que apareció en Windows durante el desarrollo) — pero si diera un error de compilación, revisá que el servidor tenga herramientas básicas de compilación (`build-essential` en Ubuntu/Debian).

## 6. Migrar tus datos actuales (si aplica)

Si ya cargaste marcas, sabores, categorías y tandas durante el desarrollo y querés llevarlos a producción:

1. Copiá el archivo `server/db/astralzone.db` de tu máquina de desarrollo al mismo path (`server/db/astralzone.db`) en el servidor, **antes** de correr `node server/server.js` por primera vez ahí.
2. No corras `node server/db/database.js` de forma que sobreescriba ese archivo — el script usa `CREATE TABLE IF NOT EXISTS`, así que si el archivo ya existe con tus datos, es seguro correrlo igual (no borra nada, solo confirma que las tablas estén).

## 7. Mantener el servidor corriendo permanentemente

Si cerrás la terminal SSH, el proceso de `node server/server.js` se corta. Para que quede corriendo de forma permanente, usá un gestor de procesos. El más común para Node es **PM2**:

```bash
npm install -g pm2
pm2 start server/server.js --name astralzone
pm2 save
pm2 startup
```

Esto mantiene el servidor corriendo en segundo plano, lo reinicia automáticamente si se cae, y lo vuelve a levantar si el servidor se reinicia.

## 8. Exponerlo al mundo (dominio + HTTPS)

Por defecto, `server.js` escucha en el puerto `3000`, accesible como `http://tu-servidor:3000`. Para tener una URL prolija con HTTPS, lo habitual es poner un **proxy reverso** delante (Nginx es el más común):

- Nginx recibe las peticiones en el puerto `80`/`443` (HTTP/HTTPS estándar) y las redirige internamente al `3000` donde corre tu app Node.
- Para HTTPS gratis, se suele usar **Certbot** (Let's Encrypt) junto con Nginx.

Esto es configuración estándar de servidor, no específica de ASTRALZONE — cualquier guía genérica de "Nginx reverse proxy para Node.js" aplica igual acá.

## 9. Backups

Como toda la base de datos vive en un solo archivo, hacer backup es tan simple como **copiar `server/db/astralzone.db`** periódicamente a otro lugar (otro servidor, un servicio de almacenamiento en la nube, etc.). Recomendado: automatizar esa copia con una tarea programada (cron) al menos una vez al día.

## 10. Variables de entorno (recomendación a futuro)

Actualmente el puerto (`3000`) está escrito directo en `server.js`. Para producción, es una buena práctica pasarlo a una variable de entorno, así podés cambiarlo sin tocar código:

```js
const PORT = process.env.PORT || 3000;
```

No es obligatorio para que funcione, pero facilita adaptarse a las reglas de puerto que exija tu hosting.

## 11. Checklist rápido antes de dar por terminado el deploy

- [ ] `npm install` corrido sin errores en el servidor
- [ ] La base de datos se creó (o migró) correctamente
- [ ] El servidor responde en el navegador desde afuera de tu red local
- [ ] Las 4 páginas cargan el sidebar y los datos reales correctamente
- [ ] PM2 (u otro gestor) configurado para que el servidor no se caiga al cerrar la terminal
- [ ] Backup del archivo `.db` programado
