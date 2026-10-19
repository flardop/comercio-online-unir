# Cómo colaborar en el proyecto

Esta guía explica la forma de trabajar para que seis personas puedan cambiar el proyecto sin sobrescribir el trabajo de las demás.

## Regla principal

La rama `main` debe funcionar siempre. Nadie sube cambios directamente a `main`.

## Crear una tarea

Antes de programar, crea una tarea en GitHub y escribe:

- Qué problema se va a resolver.
- Qué resultado se espera.
- Qué parte del proyecto se tocará.
- Cómo se comprobará que funciona.

Usa una tarea pequeña. Si parece que tardará varios días, divídela.

## Crear una rama

Actualiza primero la rama principal:

```bash
git switch main
git pull
```

Crea una rama nueva:

```bash
git switch -c tipo/nombre-corto
```

Tipos recomendados:

- `frontend/` para pantallas.
- `backend/` para la API.
- `database/` para MySQL.
- `docs/` para documentación.
- `fix/` para corregir un error.

Ejemplos: `frontend/formulario-login`, `backend/crear-articulo` y `fix/filtro-precio`.

## Guardar cambios

Haz cambios pequeños y fáciles de explicar. Antes de guardarlos:

```bash
npm run check
git status
```

Después:

```bash
git add .
git commit -m "Añadir formulario de inicio de sesión"
git push -u origin nombre-de-la-rama
```

No uses mensajes como `cambios`, `cosas` o `arreglos`. El mensaje debe explicar qué se hizo.

## Solicitud de revisión

Al abrir una solicitud de revisión:

- Resume el cambio con palabras sencillas.
- Indica cómo probarlo.
- Añade capturas si cambiaste una pantalla.
- Relaciona la tarea correspondiente.
- Pide revisión a otra persona.

Quien revisa debe comprobar que el cambio funciona y que se entiende. Si pide correcciones, se hacen en la misma rama.

## Evitar conflictos

- Avisa en la tarea antes de empezar.
- No trabajéis dos personas en el mismo archivo sin hablarlo.
- Actualiza tu rama con frecuencia.
- No mezcles varias funciones distintas en una sola solicitud.
- Si hay un conflicto que no entiendes, no borres código: pide ayuda al equipo.

## Cambios en la base de datos

No se modifica un archivo SQL ya usado por otras personas. Cada cambio nuevo se añade en un archivo numerado, por ejemplo:

```text
database/migrations/002_add_favorites.sql
```

Esto permite aplicar los cambios en el mismo orden en todos los ordenadores.

