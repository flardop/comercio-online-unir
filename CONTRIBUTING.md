# Cómo colaborar

No trabajéis directamente en `main`. Cada persona debe crear una rama para su tarea. Es conveniente crear la rama desde 'develop' ya que esta rama contendrá los cambios que estén desarrollando tus compañeros


```bash
git switch main
git pull
git switch -c nombre/tarea
```

Al terminar:

```bash
git add .
git commit -m "Explicar brevemente el cambio"
git push -u origin nombre/tarea
```

Después se abre una pull request en GitHub y otra persona revisa el cambio antes de unirlo a `main`.

Ejemplos de ramas: `frontend/login`, `backend/usuarios`, `database/tablas` y `docs/requisitos`.

