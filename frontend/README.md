# Frontend

Aplicación Angular de Reusa. Esta entrega deja la aplicación arrancando, el proxy hacia la API, la cabecera, las rutas del recorrido público y el estilo del mockup.

## Arrancar

```bash
cd frontend
npm install
npm start
```

Abre http://localhost:4200.

## Proxy

`npm start` lee `proxy.conf.json`. Cualquier petición a `/api` se reenvía a `http://localhost:3000`.

Con la API en marcha, esta llamada sale por el proxy:

```bash
curl http://localhost:4200/api/categorias
```

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Portada |
| `/registro` | Alta |
| `/explorar` | Listado |
| `/articulos/:id` | Ficha |
| `/perfiles/:id` | Perfil público |

La cabecera no aparece en la portada ni en el alta. En el resto, el logo vuelve a la portada y Explorar queda marcado.

El formulario de acceso, los servicios y los datos de artículos llegan en otras ramas. Estas pantallas reservan la ruta y el estilo.
