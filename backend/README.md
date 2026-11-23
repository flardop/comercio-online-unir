# Backend

API REST de acceso para `comercio_online`, desarrollada con Node.js y Express. Incluye registro, inicio de sesión y consulta del usuario autenticado.

## Requisitos

- Node.js 20 o superior
- pnpm
- MySQL iniciado y accesible
- Base `comercio_online` creada con el esquema del equipo

## Configuración

Desde la carpeta `backend/`, instala las dependencias:

```powershell
pnpm install
```

Si aún no tienes un archivo `.env` local, créalo desde la plantilla:

```powershell
Copy-Item .env.example .env
```

Edita `.env` con los datos de conexión que te facilite la persona responsable de MySQL:

- `DB_HOST`: servidor MySQL
- `DB_PORT`: puerto donde escucha MySQL
- `DB_USER` y `DB_PASSWORD`: cuenta MySQL con permisos sobre `comercio_online`
- `DB_NAME`: debe ser `comercio_online`
- `JWT_SECRET`: secreto aleatorio de al menos 32 caracteres

## Arranque

```powershell
pnpm start
```

Para desarrollo con reinicio automático al guardar:

```powershell
pnpm dev
```

La API queda disponible en `http://localhost:3000/api`. Comprueba que está activa en:

```text
GET http://localhost:3000/api/health
```

La respuesta esperada es `200 OK`:

```json
{"status":"ok"}
```

## Endpoints de autenticación

Las rutas tienen el prefijo `http://localhost:3000/api`.

### Registro

`POST /auth/register`

Body:

```json
{
  "email": "nueva.prueba@example.test",
  "username": "nueva_prueba",
  "password": "prueba1234",
  "name": "Nueva Prueba",
  "city": "Madrid",
  "bio": "Descripción opcional"
}
```
Respuesta esperada: `201 Created`, con `accessToken` y los datos públicos del usuario. La respuesta nunca incluye el hash de la contraseña, el teléfono ni la dirección.

### Login

`POST /auth/login`

Body:

```json
{
  "email": "nueva.prueba@example.test",
  "password": "prueba1234"
}
```

Respuesta esperada: `200 OK`, con `accessToken` y el usuario.

### Usuario autenticado

`GET /auth/me`

Envía el token en la cabecera:

```text
Authorization: Bearer <accessToken>
```

Respuesta esperada: `200 OK` y el usuario correspondiente al token.

## Comprobar con CURL en Git Bash

Registra una cuenta nueva:

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"otra.prueba@example.test","username":"otra_prueba","password":"prueba1234","name":"Otra Prueba"}'
```

Copia el valor de `accessToken` de la respuesta y, en una orden separada, guárdalo:

```bash
TOKEN='PEGA_AQUI_EL_ACCESS_TOKEN_COMPLETO'
```

Comprueba la sesión:

```bash
curl -i http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Comprueba el login:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"otra.prueba@example.test","password":"prueba1234"}'
```

## Errores esperados

- `400 VALIDATION_ERROR`: los datos no cumplen las reglas de validación.
- `401 INVALID_CREDENTIALS`: el email o la contraseña no son correctos.
- `401 UNAUTHENTICATED`: falta un token válido en `/auth/me`.
- `403 ACCOUNT_BLOCKED` o `403 ACCOUNT_NOT_ACTIVE`: la cuenta no está activa.
- `409 ACCOUNT_EXISTS`: ya existe una cuenta con ese email o nombre de usuario.
