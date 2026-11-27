# Comprobaciones del Sprint 1

Esta lista sirve para revisar el recorrido acordado: iniciar sesión, consultar artículos publicados y abrir la ficha y el perfil de quien los vende.

## Cuentas de prueba

| Cuenta | Contraseña | Rol |
| --- | --- | --- |
| `lucia@correo.com` | `Usuario2026!` | Usuario |
| `andres@correo.com` | `Moderador2026!` | Usuario y moderador |
| `nora@correo.com` | `Admin2026!` | Usuario y administradora |

Son cuentas ficticias. Las contraseñas se guardan como hashes en MySQL.

## Lista de comprobación

- [x] Cargar `database/comercio_online.sql` en una base MySQL vacía.
- [x] Revisar que existan los tres roles y las tres cuentas; Lucía tiene el rol de usuario, Andrés el de moderador y Nora el de administradora.
- [x] Iniciar sesión con cada una de las tres cuentas y comprobar que la respuesta incluya el rol esperado.
- [x] Iniciar sesión con una contraseña incorrecta y comprobar que la API devuelva `401`.
- [x] Consultar el listado público y comprobar que aparecen seis artículos con estado `published`.
- [x] Filtrar por ciudad, categoría, texto, precio máximo y estado de conservación; confirmar que los resultados cumplen cada filtro.
- [x] Abrir una ficha de artículo publicado y confirmar que muestra título, descripción, precio, categoría, conservación, ciudad y vendedor.
- [x] Solicitar un artículo inexistente o que no esté publicado y comprobar que no aparece en el listado público y que la ficha devuelve `404`.
- [x] Consultar el perfil público de un vendedor y comprobar que solo muestra los datos públicos, sin email ni contraseña.
- [ ] Recargar la página después del login, confirmar que la sesión continúa y después cerrar sesión.

## Consultas rápidas de MySQL

```sql
SELECT r.nombre AS rol, COUNT(*) AS cuentas
FROM usuario_roles ur
JOIN roles r ON r.id = ur.rol_id
GROUP BY r.nombre
ORDER BY r.nombre;

SELECT estado_publicacion, COUNT(*) AS articulos
FROM articulos
GROUP BY estado_publicacion
ORDER BY estado_publicacion;

SELECT id, titulo, ciudad, precio, estado_conservacion
FROM articulos
WHERE estado_publicacion = 'published'
ORDER BY publicado_en DESC, id DESC;
```

## Resultado local del 25 de noviembre de 2026

Comprobado en una instancia MySQL 9.2 local separada, con la API de autenticación
de `develop` (commit `10773d6`). No se ha usado la base de datos del equipo.

- Importación en una base vacía y segunda carga: ambas correctas, sin duplicados.
- Resultado: 3 cuentas, 3 roles, 5 categorías y 6 artículos publicados.
- Login y `/api/auth/me`: `200` con los roles `user`, `moderator` y `admin`.
- Contraseña incorrecta, sesión sin token y token inválido: `401`.
- Registro de una cuenta ya existente: `409`.
- Los tres hashes corresponden a las contraseñas indicadas arriba.
- La consulta SQL del listado devuelve los seis artículos; el listado HTTP aún
  está pendiente de integrar.

## Comprobación de la API pública del 27 de noviembre de 2026

Pruebas realizadas con los ajustes de `fix/integracion-api-mysql`, partiendo de
`develop` (`316e779`), una instancia MySQL 9.2 local separada y la semilla del
repositorio. No se ha utilizado la base del equipo. Estos resultados corresponden
a esta rama y deben revisarse antes de integrarlos en `develop`.

Se comprobaron 47 peticiones HTTP:

- Listado con seis artículos publicados y precios numéricos, paginación sin
  repetir artículos entre páginas y orden por precio ascendente y descendente.
- Filtros por texto, ciudad, categoría, precio y conservación, también combinados.
- Ficha de artículo, categorías activas y perfil público del vendedor.
- Respuestas con los campos que usan los modelos de frontend: listado
  `{ data, pagination }`, ficha `{ article }`, categorías como lista y perfil `{ user }`.
- Artículo inexistente o no publicado: `404`. Categoría inactiva y usuario
  bloqueado: `404`. Los cambios de prueba en la base local se restauraron.
- Perfil público sin email, contraseña ni roles. La imagen principal se presenta
  en `images`; si no hay imagen, se devuelve una lista vacía.
- Filtros e identificadores incorrectos: `400`, con el error de validación.
- Login y `/api/auth/me` de las tres cuentas: `200`. Contraseña incorrecta,
  ausencia de token y token inválido: `401`.

Las consultas utilizan las columnas existentes y el estado `published`. La
búsqueda de texto utiliza `LIKE`, por lo que no necesita un índice FULLTEXT.
El perfil devuelve `ratingCount: 0` y `ratingAverage: 0`: este sprint todavía no
incluye tablas de valoraciones.

### Lo que falta comprobar con el equipo

- Conectar los servicios de frontend, que todavía utilizan datos de muestra,
  y probar desde la pantalla el listado, los filtros, la ficha y el perfil.
- Acordar con Javier el filtro/listado de artículos del vendedor para su PR #23.
- Comprobar en el navegador la sesión después de recargar y el cierre de sesión.
- Repetir las comprobaciones en el entorno compartido cuando se revise e integre
  esta corrección. Las casillas marcadas arriba corresponden a la prueba local
  de la API, no a una validación de las pantallas.

## Repetir las pruebas automáticas

Desde `backend`, con las dependencias instaladas y MySQL 8 o superior en local:

```bash
npm run test:api
```

Por defecto se conecta a `127.0.0.1:3307`, con usuario `root` y contraseña vacía.
Para otra configuración local se pueden indicar `TEST_DB_PORT`, `TEST_DB_USER`
y `TEST_DB_PASSWORD`. El usuario de MySQL necesita permiso para crear y borrar
la base temporal. No se utilizan las variables `DB_*` del proyecto.

El comando crea una base con un nombre aleatorio `comercio_online_test_...`,
carga la semilla dos veces, arranca la API en un puerto libre y comprueba datos,
filtros, paginación, categorías, perfiles, validaciones, accesos, registro y
visibilidad. Al terminar cierra la API y elimina únicamente la base que acaba
de crear. No hay que arrancar el servidor a mano ni cargar el SQL previamente.

Resultado del 27/11: los diez bloques de comprobación pasaron en MySQL 9.2 local
con `TEST_DB_PORT=33365 npm run test:api`. Se confirmó que la base temporal ya
no existía al terminar y que la base local anterior conservaba sus tres cuentas
y seis artículos.
