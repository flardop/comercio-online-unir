# Primeros pasos sin complicaciones

## 1. Descargar el proyecto

En GitHub, pulsa el botón verde `Code` y copia la dirección. Después abre una terminal y ejecuta:

```bash
git clone DIRECCION_DEL_REPOSITORIO
cd NOMBRE_DE_LA_CARPETA
```

## 2. Instalar lo necesario

Ejecuta `node --version`. Debe aparecer la versión 24.19 o una compatible. Después ejecuta:

```bash
npm install
cp backend/.env.example backend/.env
```

El archivo `.env` es privado y no se sube a GitHub.

## 3. Arrancar el proyecto

Primera terminal:

```bash
npm run db:up
```

La primera descarga de MySQL puede tardar varios minutos. Las siguientes veces será más rápida.

Segunda terminal:

```bash
npm run dev:backend
```

Tercera terminal:

```bash
npm run dev:frontend
```

Visita `http://localhost:4200`.

## 4. Comprobar que todo funciona

Ejecuta:

```bash
npm run check
```

Si termina sin errores, tu copia está lista.

## Problemas frecuentes

### El puerto 3306 está ocupado

Probablemente ya tienes MySQL funcionando. Detén ese servicio o cambia el puerto izquierdo de `3306:3306` en `docker-compose.yml` y también `DB_PORT` en `backend/.env`.

### El comando docker no existe

Instala Docker Desktop, ábrelo y espera a que termine de iniciar.

### npm install muestra un error de versión

Comprueba `node --version`. Usa la versión indicada en `.nvmrc`.

### Mis cambios han desaparecido

No ejecutes comandos para borrar cambios. Ejecuta `git status`, copia el resultado y pide ayuda al equipo.

