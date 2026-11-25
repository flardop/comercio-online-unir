# Comercio online UNIR

Repositorio compartido para el proyecto final de una plataforma de compraventa de segunda mano.

## Estado actual

El frontend ya tiene la aplicación Angular, con el proxy hacia `/api`, la cabecera y las rutas públicas. El backend de autenticación y el SQL están en el repositorio.

```text
frontend/   Aplicación Angular
backend/    Aplicación Node y Express
database/   Base de datos MySQL
docs/       Notas y acuerdos del equipo
```

Para arrancar la API: `cd backend`, `pnpm install` y `pnpm dev`, con `backend/.env` apuntando a MySQL. Para arrancar el frontend: `cd frontend`, `pnpm install` y `pnpm start`. El detalle está en [frontend/README.md](frontend/README.md) y en [backend/README.md](backend/README.md).

## Forma de trabajar

1. Elegir una tarea.
2. Crear una rama nueva desde `develop`.
3. Trabajar únicamente en esa rama.
4. Subir los cambios.
5. Abrir una pull request para que otra persona los revise.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para ver los comandos básicos y [docs/REPARTO_TRABAJO.md](docs/REPARTO_TRABAJO.md) para organizar al equipo.

