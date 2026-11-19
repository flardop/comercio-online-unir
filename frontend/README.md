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

`pnpm start` arranca una API de demo en el puerto 3000 y la aplicación en el 4200. `proxy.conf.json` reenvía `/api` a esa API. La demo expone `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login` y `GET /api/auth/me`.

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

El formulario de acceso, los servicios y los datos de artículos llegan en otras ramas. Estas pantallas reservan la ruta y el estilo.

## Explorar y Ficha

`/explorar` y `/articulos/:id` siguen el prototipo `index v2.html` y leen de `ArticuloService`, `CategoriaService` y `UsuarioService`. **Hoy esos servicios devuelven datos de prueba** (`src/app/core/mocks/`) con la forma exacta del contrato de API; al conectar el backend solo cambia el cuerpo de cada método por una llamada `HttpClient`. Los filtros de Explorar viven en la URL (`?q`, `categoryId`, `maxPrice`, `condition`, `city`).
