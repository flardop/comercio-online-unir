# Plataforma de compraventa de segunda mano

Este repositorio contiene la base del proyecto final. La aplicación permitirá publicar, buscar y vender artículos de segunda mano. También tendrá mensajería, reportes y tres tipos de cuenta: usuario, moderador y administrador.

El nombre de la plataforma todavía es provisional. El equipo puede decidir más adelante el nombre, el logotipo y los colores sin cambiar la organización del código.

## Qué hay en cada carpeta

```text
frontend/   Pantallas hechas con Angular
backend/    API hecha con Node y Express
database/   Estructura inicial de MySQL
docs/       Guías y acuerdos del equipo
.github/    Plantillas para tareas y revisiones
```

Todo está en un solo repositorio para que sea más fácil coordinar a las seis personas. Cada persona trabaja en una rama y propone sus cambios mediante una solicitud de revisión.

## Antes de empezar

Cada integrante necesita instalar:

- Git.
- Node.js 24.19 o una versión compatible.
- Docker Desktop, para ejecutar MySQL sin configurarlo a mano.
- Un editor de código, por ejemplo Visual Studio Code.

## Puesta en marcha rápida

1. Copia el repositorio en tu ordenador.
2. Abre una terminal dentro de la carpeta del proyecto.
3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Crea el archivo de configuración del backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

5. Arranca la base de datos:

   ```bash
   npm run db:up
   ```

   La primera vez, Docker tiene que descargar MySQL y puede tardar varios minutos.

6. Arranca el backend en una terminal:

   ```bash
   npm run dev:backend
   ```

7. Arranca el frontend en otra terminal:

   ```bash
   npm run dev:frontend
   ```

8. Abre `http://localhost:4200` en el navegador. La API responde en `http://localhost:3000/api/health`.

Si algo falla, revisa [la guía de primeros pasos](docs/PRIMEROS_PASOS.md).

## Forma de trabajar

No se trabaja directamente en `main`. Para cada tarea:

1. Actualiza tu copia de `main`.
2. Crea una rama con un nombre corto, por ejemplo `frontend/login`.
3. Haz solo los cambios de esa tarea.
4. Comprueba el proyecto con `npm run check`.
5. Sube la rama y abre una solicitud de revisión.
6. Otra persona revisa el cambio antes de unirlo a `main`.

Las instrucciones completas están en [CONTRIBUTING.md](CONTRIBUTING.md). El reparto inicial está en [docs/REPARTO_TRABAJO.md](docs/REPARTO_TRABAJO.md).

## Funciones obligatorias

- Registro e inicio de sesión.
- Perfiles de usuario, moderador y administrador.
- Publicación, edición, búsqueda y venta de artículos.
- Estados del artículo: borrador, publicado, en revisión, retirado y vendido.
- Mensajería privada entre comprador y vendedor.
- Reportes y moderación.
- Gestión de usuarios, roles y categorías.
- Estadísticas básicas para administración.

Las valoraciones, favoritos, avisos en tiempo real y mapa son mejoras opcionales. Primero deben terminarse las funciones obligatorias.

## Comandos útiles

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev:frontend` | Arranca Angular |
| `npm run dev:backend` | Arranca la API |
| `npm run db:up` | Arranca MySQL |
| `npm run db:down` | Detiene MySQL |
| `npm run check` | Comprueba frontend y backend |
| `npm run build` | Genera una versión lista para entregar |

## Seguridad básica

- Nunca subas el archivo `.env`.
- Nunca guardes contraseñas reales en el código.
- Las contraseñas de usuarios deberán guardarse cifradas con un algoritmo específico para contraseñas.
- La localización mostrada al público debe ser aproximada.

