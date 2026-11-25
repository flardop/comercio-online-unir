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
- [ ] Consultar el listado público y comprobar que aparecen seis artículos con estado `published`.
- [ ] Filtrar por ciudad, categoría, texto, precio máximo y estado de conservación; confirmar que los resultados cumplen cada filtro.
- [ ] Abrir una ficha de artículo publicado y confirmar que muestra título, descripción, precio, categoría, conservación, ciudad y vendedor.
- [ ] Solicitar un artículo inexistente o que no esté publicado y comprobar que no aparece en el listado público y que la ficha devuelve `404`.
- [ ] Consultar el perfil público de un vendedor y comprobar que solo muestra los datos públicos, sin email ni contraseña.
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

## Pendiente con la API pública

La rama `articleapi`, commit `d6464b2`, aún consulta estos datos que no coinciden
con el esquema de este sprint:

- Artículos: `provincia`, `pais` y `codigo_postal`.
- Categorías: `descripcion`.
- Perfil público: `provincia` y `pais`.
- Busca artículos con `estado_publicacion = 'activo'`; la semilla utiliza
  `published`, como el contrato de frontend.
- La búsqueda `MATCH(titulo, descripcion)` necesita un índice FULLTEXT, o una
  consulta compatible con el esquema actual.

Antes de ejecutar las pruebas del listado y perfil por HTTP, hay que acordar
estas diferencias y reunir ambas API en un único servidor. Las casillas de
frontend y API pública siguen pendientes.
