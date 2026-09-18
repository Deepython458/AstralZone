# Manual de Usuario — ASTRALZONE v1.0

## Introducción

ASTRALZONE es tu panel de administración para manejar ventas, stock y productos desde una sola pantalla. Este manual explica qué hace cada sección y cómo usarla en el día a día.

## Acceso

Ingresá a la dirección donde esté publicado el sistema desde tu navegador (computadora o celular). El sistema se adapta automáticamente a pantallas chicas: en celular vas a ver un botón de menú (☰) arriba a la izquierda para acceder a las secciones.

---

## 1. Inicio

Es la pantalla principal, el resumen de tu negocio.

- **Saldo Disponible**: la plata acumulada por ventas confirmadas en la tanda actual. El ícono del ojo al lado te permite ocultar los montos (útil si alguien más está mirando la pantalla).
- **Inversión del mes / Ganancias del mes**: cuánto invertiste en esta tanda, y cuánto llevás ganado (la plata que superó esa inversión).
- **Atajos rápidos**:
  - *Cobrar venta*: te lleva directo a Vender.
  - *Nuevo producto*: te lleva a Productos.
  - *Reiniciar Tanda*: cierra la ronda actual y arranca una nueva — te pide el monto invertido nuevo. Usalo cuando compres mercadería nueva y quieras volver a medir la ganancia desde cero.
  - *Inversión*: te permite corregir el monto invertido de la tanda actual **sin** reiniciarla (por ejemplo, si sumaste más capital a mitad de camino).
- **Ventas**: gráfico con la evolución de ventas.
- **Última venta**: las 5 ventas confirmadas más recientes.
- **Panel lateral** (en celular, se accede tocando la campana 🔔 arriba):
  - *Dólar Hoy*: cotización de venta del USDT y el dólar blue, con flecha verde (bajó, bueno para vos) o roja (subió).
  - *Resumen rápido*: ganancias acumuladas por categoría de producto.
  - *Alertas*: sabores con poco stock (menos de 5 unidades). Los que llegan a 0 dejan de aparecer acá porque ya no salen a la venta.

---

## 2. Vender

Acá registrás cada venta.

1. **Elegí los sabores**: tildá el check de cada sabor que el cliente quiere. Al tildarlo, se agrega automáticamente al carrito con cantidad 1.
2. **Ajustá cantidades**: con los botones `+`/`-`, tanto desde la lista grande como desde el carrito (están sincronizados). El sistema no te deja pasarte del stock disponible — el número titila en rojo y el botón `+` se apaga si llegás al máximo.
3. **Cargá el total**: escribilo directamente en el campo "Total", o usá los botones de precio sugerido para completarlo rápido.
4. **Elegí la acción**:
   - **Vender**: confirma la venta ya mismo. Descuenta el stock y suma la plata al saldo.
   - **Pendiente**: guarda el pedido para confirmar después (por ejemplo, si el cliente todavía no pagó). El stock se descuenta igual, como reserva.
   - **Reiniciar**: vacía el carrito sin guardar nada.
5. **Pedidos pendientes**: en la parte de abajo del carrito ves los pedidos guardados como pendientes. Con el ✓ los confirmás (se suma la plata), con la ✕ los cancelás (el stock reservado vuelve a estar disponible).

Los sabores sin stock no aparecen en la lista — se ocultan automáticamente.

---

## 3. Stock

Consulta rápida de tu inventario.

- La lista está agrupada por marca, mostrando solo los sabores que tienen stock (los que llegan a 0 se ocultan).
- **Buscador**: escribí un nombre de sabor o marca para filtrar la lista al instante.
- **Ícono del ojo**: oculta/muestra las cantidades — útil si le vas a mandar la lista a un cliente minorista que solo necesita saber qué sabores hay disponibles, sin ver cuánto stock tenés.
- **Ícono de copiar**: copia la lista completa al portapapeles, respetando si las cantidades están visibles u ocultas en ese momento, y agrupada por marca — lista para pegar y enviar por WhatsApp u otro medio.
- **Stock bajo**: panel lateral con los sabores por debajo del umbral (menos de 5 unidades), para saber qué reponer.

---

## 4. Productos

Acá gestionás tu catálogo: marcas, categorías y sabores.

- **Ver una marca**: tocá su tarjeta para desplegarla y ver todos sus sabores con su cantidad actual.
- **Ajustar stock**: dentro de una marca desplegada, usá los botones `+`/`-` de cada sabor.
- **Agregar sabor**: dentro de una marca desplegada, tocá "Agregar sabor" y completá nombre, cantidad inicial y (opcional) dos emojis representativos.
- **Nueva marca**: tocá la tarjeta punteada "Nueva marca". Completá el nombre y elegí una categoría existente. La letra de referencia se asigna sola.
  - Si la categoría que necesitás todavía no existe, tocá "+ Nueva categoría" desde el mismo formulario para crearla sin salir del modal.

---

## Preguntas frecuentes

**¿Qué pasa si cancelo un pedido pendiente por error?**
El stock que se había descontado vuelve a sumarse automáticamente. No hay forma de "deshacer" la cancelación — tendrías que volver a cargar la venta.

**¿Puedo tener más de un pedido pendiente al mismo tiempo?**
Sí, no hay límite.

**¿Se pierde algo al reiniciar una tanda?**
No. El histórico de ventas y el saldo de la tanda anterior quedan guardados, simplemente el dashboard pasa a mostrar los números de la tanda nueva desde cero.

**¿Por qué un sabor desapareció de la lista de Vender/Stock?**
Porque llegó a 0 unidades. Sumale stock desde Productos para que vuelva a aparecer.
