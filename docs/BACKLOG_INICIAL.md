# Backlog inicial

Este listado convierte los requisitos y los acuerdos de la reunión en tareas pequeñas. Cada tarea debe tener una persona responsable y una pull request independiente.

## Organización e integración

- [ ] Confirmar `develop` como rama de integración.
- [ ] Elegir la versión oficial del prototipo visual.
- [ ] Elegir la versión oficial del modelo y del script de base de datos.
- [ ] Incorporar los archivos oficiales a GitHub respetando su autoría.
- [ ] Asignar una persona responsable a cada bloque.

## Frontend Angular

- [ ] Crear el proyecto Angular y la navegación principal.
- [ ] Crear registro, inicio de sesión y perfil.
- [ ] Crear listado, buscador, filtros y detalle de artículos.
- [ ] Crear el formulario para publicar y editar artículos propios.
- [ ] Crear favoritos y mensajería por artículo.
- [ ] Crear la opción para reportar artículos y conversaciones.
- [ ] Crear las vistas de moderador y administrador.
- [ ] Crear una página informativa inicial sobre ChispApp.

## Backend Node y Express

- [ ] Crear el proyecto Node/Express y la configuración básica.
- [ ] Crear autenticación y permisos para usuario, moderador y administrador.
- [ ] Crear la API de usuarios y perfiles.
- [ ] Crear la API de artículos, categorías, favoritos y búsqueda.
- [ ] Crear la API de conversaciones y mensajes.
- [ ] Crear la API de reportes y decisiones de moderación.
- [ ] Crear las operaciones administrativas de usuarios, roles y estadísticas.

## Base de datos MySQL

- [ ] Revisar el modelo de datos respecto al enunciado.
- [ ] Preparar el script inicial de creación de tablas.
- [ ] Preparar datos de demostración sin información personal real.
- [ ] Documentar cómo crear y cargar la base de datos en local.

## Estados y permisos

- [ ] Definir los estados de artículo: borrador, publicado, en revisión, retirado y vendido.
- [ ] Definir los estados de usuario: activo y bloqueado.
- [ ] Impedir que una persona edite artículos que no son suyos.
- [ ] Limitar las acciones de moderación y administración según el rol.

## Calidad

- [ ] Preparar una lista de pruebas basada en el enunciado.
- [ ] Probar los tres roles y los permisos de cada uno.
- [ ] Probar el flujo completo de publicación, conversación, reporte y moderación.
- [ ] Revisar que no se suban contraseñas ni claves al repositorio.

## Definición de tarea terminada

Una tarea se considera terminada cuando:

1. Está desarrollada en una rama propia.
2. Tiene una pull request hacia `develop`.
3. Otra persona la ha revisado.
4. Incluye instrucciones sencillas para probarla.
5. No rompe el trabajo que ya existe.
