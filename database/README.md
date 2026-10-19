# Base de datos

MySQL ejecuta automáticamente los archivos de `migrations` la primera vez que se crea el contenedor.

## Reiniciar desde cero

Este comando borra los datos locales del contenedor. Úsalo solo si no necesitas conservarlos:

```bash
docker compose down -v
docker compose up -d database
```

## Añadir un cambio

No edites una migración que ya usa el resto del equipo. Crea el siguiente archivo numerado, por ejemplo `002_add_favorites.sql`, y explica el cambio en la solicitud de revisión.

