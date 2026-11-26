# Sprint 1 — Parte pública

Plataforma de compraventa de segunda mano (mockup **Reusa**).

| | |
| --- | --- |
| Duración | 15 días de calendario: **16 al 30 de noviembre de 2026** |
| Días de trabajo | 11 (16–20, 23–27 y 30). El fin de semana es colchón, no se planifican tareas nuevas |
| Equipo | 6 personas: José Antonio Acevedo, Rebeca Carreño y Javier Arturo (front), Eugeni Robert, Cristian Falcón y Joel Rivera (back) |
| Demo | 30 de noviembre |

## Objetivo

Una persona puede abrir la portada, **iniciar sesión** con el formulario y, ya dentro, **explorar artículos publicados** y abrir su ficha. La pantalla no llama a la API por su cuenta: usa un **servicio de Angular** tipado con **interfaces**. La API es **REST**.

Al terminar se puede enseñar este recorrido, con datos de prueba:

1. Portada con el formulario de login.
2. Error si el email o la contraseña van vacíos, o si no coinciden con un usuario.
3. Login correcto: se guarda la sesión y se abre Explorar.
4. El listado y la ficha salen de `GET /api/articulos` a través de `ArticuloService`.
5. La ficha enlaza al perfil público del vendedor, sin email ni teléfono.

## Fuera de este sprint

Mensajes, favoritos, publicar o editar artículos, «mis artículos», comprados, valoraciones, reportes, moderación y panel de administración. Esas pantallas existen en el mockup y se dejan para el sprint siguiente.

El enlace «Crear cuenta» puede existir en la portada. El alta de usuario entra en este sprint solo lo justo para que el login tenga cuentas reales. No se diseña todavía el cambio de rol.

## Reparto

Tres personas en frontend y tres en backend. Cada una tiene un bloque. Una pull request de frontend la revisa otra persona de frontend. Una de backend, otra de backend. Las ramas salen de `develop`, como indica `CONTRIBUTING.md`.

### Frontend

Trabajan en `frontend/`. José Antonio Acevedo junta las ramas de pantalla. Rebeca Carreño y Javier Arturo no se pisan: `models/sesion.ts` y `auth.service.ts` son de Rebeca; `models/articulo.ts`, `models/categoria.ts`, `articulo.service.ts` y `categoria.service.ts` son de Javier.

| Persona | Bloque | Entrega |
| --- | --- | --- |
| José Antonio Acevedo | App y composición | Aplicación Angular, proxy hacia la API, cabecera, rutas y estilo del mockup. Integra las pantallas y conduce la demo |
| Rebeca Carreño | Login, interfaces y servicio de acceso | Portada con el formulario, interfaces de sesión y `AuthService` con el interceptor del token |
| Javier Arturo | Artículos, interfaces y servicios | Explorar, ficha y perfil público. Interfaces de artículo y categoría, `ArticuloService` y `CategoriaService` |

### Backend

Trabajan en `backend/` y `database/`. Eugeni Robert junta las ramas de la API. Joel Rivera deja las tablas listas para que Eugeni y Cristian no esperen al esquema.

| Persona | Bloque | Entrega |
| --- | --- | --- |
| Eugeni Robert | API REST de acceso | Express, CORS y `POST /api/auth/login`, `POST /api/auth/registro`, `GET /api/auth/me` |
| Cristian Falcón | API REST pública | Listado, filtros, ficha, categorías y perfil público. Solo artículos publicados |
| Joel Rivera | Datos | Tablas MySQL, semilla y comprobación de que el login y el listado responden |

## Contrato que se cierra el día 1

Frontend y backend trabajan en paralelo a partir de este acuerdo. Si hay que cambiar un campo, se cambia aquí antes de tocar código.

### Interfaces

Viven en `frontend/src/app/core/models/`.

```ts
export interface Credenciales {
  email: string;
  password: string;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  ciudad: string;
  rol: 'usuario' | 'moderador' | 'administrador';
}

export interface Sesion {
  token: string;
  usuario: UsuarioSesion;
}

export interface UsuarioPublico {
  id: number;
  nombre: string;
  ciudad: string;
  articulosPublicados: number;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export type Conservacion = 'como_nuevo' | 'buen_estado' | 'aceptable';

export interface Articulo {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: Categoria;
  conservacion: Conservacion;
  ciudad: string;
  estado: 'publicado';
  vendedor: UsuarioPublico;
}

export interface FiltroArticulos {
  texto?: string;
  categoriaId?: number;
  precioMax?: number;
  conservacion?: Conservacion;
  ciudad?: string;
}
```

El perfil público y el listado no incluyen email, teléfono ni contraseña.

### API REST

Base: `http://localhost:3000/api`

| Método | Ruta | Quién | Respuesta |
| --- | --- | --- | --- |
| POST | `/auth/registro` | Público | `201` y `Sesion` |
| POST | `/auth/login` | Público | `200` y `Sesion`. `401` si no coincide |
| GET | `/auth/me` | Con token | `200` y `UsuarioSesion`. `401` sin token válido |
| GET | `/categorias` | Público | `200` y `Categoria[]` |
| GET | `/articulos` | Público | `200` y `Articulo[]`. Acepta los query de `FiltroArticulos` |
| GET | `/articulos/:id` | Público | `200` y `Articulo`. `404` si no está publicado |
| GET | `/perfiles/:id` | Público | `200` y `UsuarioPublico` más sus artículos publicados |

Login. Cuerpo: `{ "email": "lucia@correo.com", "password": "1234" }`.

Errores. `{ "mensaje": "Email o contraseña incorrectos" }` con el código HTTP que corresponda.

La contraseña no se guarda en claro. El token va en `Authorization: Bearer <token>`.

### Servicios Angular

| Servicio | Métodos | API | Persona |
| --- | --- | --- | --- |
| `AuthService` | `login(credenciales)`, `registro(datos)`, `me()`, `logout()`, `sesionActual` | `/auth/*` | Rebeca Carreño |
| `ArticuloService` | `listar(filtro)`, `obtener(id)` | `/articulos` | Javier Arturo |
| `CategoriaService` | `listar()` | `/categorias` | Javier Arturo |

Los componentes solo hablan con estos servicios. No usan `HttpClient` en la plantilla ni en el componente.

### Formulario de login

Campos del mockup: email y contraseña. Lo hace Rebeca Carreño, en frontend.

- Los dos son obligatorios. Email con formato válido.
- Mensaje si faltan datos: «Completa el email y la contraseña.»
- Mensaje si la API responde 401: «Email o contraseña incorrecta.»
- Botón «Iniciar sesión» desactivado mientras la petición está en curso.
- Si entra bien, navega a Explorar.
- Enlace «Crear cuenta» hacia el alta mínima.
- Tres cuentas de prueba visibles, como en el mockup. Pulsarlas rellena el email. La contraseña de semilla es `1234`.

## Calendario

### Día 1 — lunes 16. Arranque (todos, 90 minutos)

- Leer este sprint y el mockup (`mockup-front/mockup-front.html`, pantallas `portada`, `registro`, `explorar`, `ficha`, `perfil`).
- Cerrar el contrato de interfaces y rutas. A partir de aquí no se cambian nombres de campos sin avisar en el grupo.
- Frontend, José Antonio Acevedo: crear la app Angular en `frontend/` y el proxy hacia `/api`.
- Backend, Eugeni Robert: crear Express en `backend/`, con CORS.
- Backend, Joel Rivera: esquema mínimo de `usuarios`, `categorias` y `articulos`.
- El resto: rama vacía y esqueleto de su carpeta, para no pisarse.

### Días 2 a 4 — martes 17 a jueves 19. En paralelo

| Lado | Persona | Hace |
| --- | --- | --- |
| Front | José Antonio Acevedo | Deja `ng serve` con el proxy, la cabecera y las rutas vacías. Revisa la primera PR de frontend |
| Front | Rebeca Carreño | Interfaces de sesión, `AuthService` con datos fijos y formulario reactivo en la portada, con validación |
| Front | Javier Arturo | Interfaces de artículo y categoría, `ArticuloService` y `CategoriaService` con datos fijos, y la ruta `/explorar` con tarjetas |
| Back | Eugeni Robert | Registro, login y `/auth/me`, con contraseña hasheada y token. README de cómo arrancar la API |
| Back | Cristian Falcón | `GET /categorias`, `GET /articulos` y `GET /articulos/:id`, filtrando solo `publicado` |
| Back | Joel Rivera | Tablas, migración y semilla: Lucía (usuario), Andrés (moderador), Nora (administrador) y 6 artículos publicados |

Al final del jueves 19 el backend comprueba, en 20 minutos, login y listado con Postman o curl. Si la API aún no responde, el viernes el backend se queda en eso. El frontend sigue con datos fijos.

### Días 5 a 8 — viernes 20 y lunes 23 a miércoles 25. Se une

| Lado | Persona | Hace |
| --- | --- | --- |
| Front | Rebeca Carreño | Quita los datos fijos de `AuthService`. El formulario llama a `POST /auth/login`, guarda la sesión y el interceptor añade el token. La sesión sobrevive a recargar |
| Front | Javier Arturo | Explorar y ficha leen `ArticuloService` y `CategoriaService`. Filtros: texto, categoría, precio máximo, conservación y ciudad |
| Front | José Antonio Acevedo | Integra en `develop` las ramas de frontend: servicios, login y pantallas |
| Back | Cristian Falcón | Query params de esos filtros y `GET /perfiles/:id` |
| Back | Eugeni Robert | Ajusta los códigos 400 y 401 para que el formulario pueda mostrar el mensaje. Integra las ramas de backend |
| Back | Joel Rivera | Semilla estable y la lista de pruebas del recorrido |

Orden de fusión en backend: datos, API de acceso, API pública. En frontend: servicios, login, pantallas. La pantalla de Explorar entra cuando `ArticuloService.listar` devuelve la interfaz `Articulo[]`, aunque sea con datos fijos.

### Días 9 a 11 — jueves 26, viernes 27 y lunes 30. Cierre

| Día | Qué se cierra |
| --- | --- |
| Jueves 26 | Perfil público desde la ficha. Lo cierra Javier Arturo contra `GET /perfiles/:id` de Cristian Falcón. Email y teléfono no aparecen |
| Viernes 27 | Errores visibles: API caída, 401, 404 de un artículo. Repaso visual contra el mockup |
| Lunes 30 | Demo. Solo se enseña lo que está en `develop`. Lo que siga en una rama no entra |

El viernes 27 se congela el alcance. Un fallo del recorrido de la demo se corrige. Una pantalla nueva no se empieza.

## Historias

Cada historia cabe en una rama y en una pull request.

| Id | Lado | Historia | Persona | Hecha cuando |
| --- | --- | --- | --- | --- |
| S1 | Front | Como visitante, quiero la app Angular arrancando y el proxy hacia la API | José Antonio Acevedo | `npm start` en frontend y una llamada a `/api` sale por el proxy |
| S2 | Front | Como visitante, quiero la portada con el formulario de login | Rebeca Carreño | Se ve la portada del mockup y el formulario no envía email o contraseña vacíos |
| S3 | Front | Como visitante, quiero interfaces y `AuthService` para entrar | Rebeca Carreño | `login` devuelve `Sesion` y el componente no importa `HttpClient` |
| S4 | Front | Como visitante, quiero interfaces y servicios de artículos | Javier Arturo | `listar` y `obtener` devuelven `Articulo` y `Articulo[]` |
| S5 | Back | Como visitante, quiero entrar con email y contraseña | Eugeni Robert | `POST /auth/login` devuelve token o 401. La contraseña no está en claro en MySQL |
| S6 | Back | Como visitante, quiero ver solo artículos publicados y filtrarlos | Cristian Falcón | Los cinco filtros responden y un borrador no sale en el listado |
| S7 | Back | Como equipo, queremos usuarios y artículos de prueba | Joel Rivera | Las tres cuentas del mockup entran con `1234` y hay artículos en varias ciudades |
| S8 | Front | Como visitante, quiero que el login real me lleve a Explorar | Rebeca Carreño | Token guardado, recarga mantiene la sesión, botón Salir la borra |
| S9 | Front y back | Como visitante, quiero abrir la ficha de un artículo | Javier Arturo y Cristian Falcón | Título, precio, estado, conservación, ciudad, descripción y vendedor salen de la API |
| S10 | Front y back | Como visitante, quiero el perfil público del vendedor | Javier Arturo y Cristian Falcón | Nombre, ciudad y sus artículos. Sin email ni teléfono |

## Definición de hecho

- La rama sale de `develop` y otra persona ha revisado la pull request.
- El código nuevo usa las interfaces del contrato. No hay `any` en servicios ni en el formulario.
- El componente de login y el de Explorar no importan `HttpClient`.
- La respuesta pública no incluye email, teléfono ni hash de contraseña.
- Hay datos de semilla y el README explica cómo cargarlas y cómo arrancar.
- El recorrido de la demo funciona en `develop` el día 30.

## Comprobación del día 30

Joel Rivera prepara los datos y José Antonio Acevedo ejecuta la demo.

1. Levantar MySQL, backend y frontend con el README.
2. Abrir la portada. Enviar el formulario vacío y ver «Completa el email y la contraseña.»
3. Entrar con `lucia@correo.com` / `1234` y caer en Explorar.
4. Entrar con una contraseña mala y ver el error, sin cambiar de pantalla.
5. Filtrar por una ciudad de la semilla y ver solo esos artículos.
6. Abrir una ficha y, desde ella, el perfil público.
7. Recargar el navegador y seguir dentro. Pulsar Salir y volver a la portada.
8. Confirmar que un artículo que no esté publicado no tiene URL pública.

## Rituales

| Cuándo | Duración | Para qué |
| --- | --- | --- |
| Día 1 | 90 min | Contrato y reparto |
| Cada día laborable | 15 min | Qué quedó ayer, qué hay hoy, qué bloquea |
| Jueves 19 | 20 min | ¿Login y listado responden? |
| Viernes 27 | 30 min | Congelar alcance y ensayar la demo |
| Lunes 30 | 30 min | Demo y anotación de lo que pasa al sprint 2 |

## Qué queda anotado para el sprint 2

Publicar artículo, mis artículos, favoritos y el arranque de mensajes. No se adelantan en estas ramas.
