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

- [ ] Cargar `database/comercio_online.sql` en una base MySQL vacía.
- [ ] Revisar que existan los tres roles y las tres cuentas; Lucía tiene el rol de usuario, Andrés el de moderador y Nora el de administradora.
- [ ] Iniciar sesión con cada una de las tres cuentas y comprobar que la respuesta incluya el rol esperado.
- [ ] Iniciar sesión con una contraseña incorrecta y comprobar que la API devuelva `401`.
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

Esta es una lista para ejecutar durante la integración; todavía no se han ejecutado estas comprobaciones contra el MySQL del equipo.
