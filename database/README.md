# Base de datos

El esquema y los datos iniciales del Sprint 1 están en `comercio_online.sql`.
El archivo crea las tablas de usuarios, roles, categorías y artículos, y carga
cuentas y artículos ficticios para probar el recorrido público.

Para revisar las comprobaciones previstas durante la integración, consulta
[`docs/PRUEBAS_SPRINT_01.md`](../docs/PRUEBAS_SPRINT_01.md). La lista distingue lo probado localmente de las pruebas de integración pendientes.



Para una instalación nueva con MySQL 8 o superior:

```sh
mysql -u TU_USUARIO -p < database/comercio_online.sql
```

Ejecuta el comando desde la raíz del repositorio y configura `backend/.env`
según el ejemplo del backend. El SQL usa la base `comercio_online`.
`CREATE TABLE IF NOT EXISTS` no modifica tablas antiguas: si ya tienes otro
esquema, guarda una copia y revisa sus diferencias antes de importarlo.
