# Cómo colaborar

No trabajéis directamente en `main` ni en `develop`.

- `main` contiene únicamente versiones estables.
- `develop` reúne el trabajo del equipo antes de pasarlo a `main`.
- Cada tarea se desarrolla en una rama nueva creada desde `develop`.

Antes de empezar una tarea:

```bash
git switch develop
git pull origin develop
git switch -c nombre/tarea
```

Al terminar:

```bash
git add .
git commit -m "Explicar brevemente el cambio"
git push -u origin nombre/tarea
```

Después se abre una pull request hacia `develop`. Otra persona debe revisar el cambio antes de unirlo.

Cuando `develop` tenga una versión estable y revisada, se abrirá una pull request separada hacia `main`.

Ejemplos de ramas: `frontend/login`, `backend/usuarios`, `database/tablas` y `docs/requisitos`.

## Reglas sencillas

1. Una rama debe contener una sola tarea.
2. Antes de programar, comprobad que la tarea existe en GitHub Issues.
3. Explicad en la pull request qué se ha cambiado y cómo se puede probar.
4. No subáis contraseñas, claves ni datos personales reales.
5. No marquéis una tarea como terminada si solo existe en el prototipo visual.

