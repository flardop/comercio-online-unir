# Frontend

Aplicación Angular de Reusa. Esta entrega deja la aplicación arrancando, el proxy hacia la API, la cabecera, las rutas del recorrido público y el estilo del mockup.

## Arrancar

```bash
cd frontend
pnpm install
pnpm start
```

Abre http://localhost:4200.

## Proxy

`pnpm start` arranca solo la aplicación en el puerto 4200. La API real se arranca aparte, en `backend`, con `pnpm dev`, y escucha en el puerto 3000. `proxy.conf.json` reenvía `/api` a esa API. La página de endpoints llama a `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login` y `GET /api/auth/me`. El login de prueba es `lucia@correo.com` con la contraseña `Usuario2026!`.

Con la API en marcha, esta llamada sale por el proxy:

```bash
curl http://localhost:4200/api/health
```

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Portada |
| `/registro` | Alta |
| `/explorar` | Listado |
| `/demo` | Endpoints de la demo |
| `/articulos/:id` | Ficha |
| `/perfiles/:id` | Perfil público |

La cabecera no aparece en la portada ni en el alta. En el resto, el logo vuelve a la portada y Explorar queda marcado.

## Explorar, ficha y perfil público

`/explorar` y `/articulos/:id` siguen el prototipo `index v2.html`. Junto con `/perfiles/:id`, leen los datos de la API mediante `ArticuloService`, `CategoriaService` y `UsuarioService`, así que el backend y MySQL tienen que estar en marcha.

| Servicio | Llamadas |
| --- | --- |
| `ArticuloService` | `GET /api/articles` y `GET /api/articles/{id}`. Para el perfil usa `?ownerId={id}&sort=recent&pageSize=100` |
| `CategoriaService` | `GET /api/categories` |
| `UsuarioService` | `GET /api/users/{id}` |

Los filtros de Explorar viven en la URL (`?q`, `categoryId`, `maxPrice`, `condition`, `city`). Los datos de `src/app/core/mocks/` solo se usan en las pruebas.
