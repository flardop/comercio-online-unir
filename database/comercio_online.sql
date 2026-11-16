CREATE DATABASE IF NOT EXISTS comercio_online
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE comercio_online;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rol_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  nombre_usuario VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS articulos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  estado_conservacion ENUM('nuevo', 'muy_bueno', 'bueno', 'aceptable') NOT NULL,
  estado_publicacion ENUM('borrador', 'publicado', 'en_revision', 'retirado', 'vendido') NOT NULL DEFAULT 'borrador',
  imagen_url VARCHAR(500) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_articulos_precio CHECK (precio >= 0),
  CONSTRAINT fk_articulos_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_articulos_categorias
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  INDEX idx_articulos_listado (estado_publicacion, creado_en),
  INDEX idx_articulos_categoria (categoria_id, estado_publicacion)
);

INSERT IGNORE INTO roles (nombre) VALUES
  ('usuario'),
  ('moderador'),
  ('administrador');

INSERT IGNORE INTO categorias (nombre) VALUES
  ('Ropa'),
  ('Hogar'),
  ('Libros'),
  ('Electronica');

-- Cuentas ficticias para comprobar el listado. Las contrasenas se anadiran
-- con hashes cuando se conecte el inicio de sesion del backend.
INSERT IGNORE INTO usuarios (rol_id, nombre, nombre_usuario, email)
SELECT r.id, datos.nombre, datos.nombre_usuario, datos.email
FROM roles r
CROSS JOIN (
  SELECT 'Ana Garcia' AS nombre, 'ana_prueba' AS nombre_usuario, 'ana.prueba@example.test' AS email
  UNION ALL SELECT 'Luis Martin', 'luis_prueba', 'luis.prueba@example.test'
  UNION ALL SELECT 'Marta Lopez', 'marta_prueba', 'marta.prueba@example.test'
  UNION ALL SELECT 'Pablo Ruiz', 'pablo_prueba', 'pablo.prueba@example.test'
) AS datos
WHERE r.nombre = 'usuario';

INSERT INTO articulos
  (usuario_id, categoria_id, titulo, descripcion, precio, estado_conservacion, estado_publicacion, imagen_url)
SELECT u.id, c.id, datos.titulo, datos.descripcion, datos.precio,
       datos.estado_conservacion, 'publicado', NULL
FROM (
  SELECT 'ana.prueba@example.test' AS email, 'Chaqueta vaquera' AS titulo,
         'Chaqueta en buen estado, apenas usada.' AS descripcion, 18.00 AS precio,
         'bueno' AS estado_conservacion, 'Ropa' AS categoria
  UNION ALL SELECT 'luis.prueba@example.test', 'Lampara de mesa',
         'Lampara sencilla para escritorio o mesilla.', 12.50, 'muy_bueno', 'Hogar'
  UNION ALL SELECT 'marta.prueba@example.test', 'Novela de aventuras',
         'Libro cuidado, sin paginas marcadas.', 7.00, 'bueno', 'Libros'
  UNION ALL SELECT 'pablo.prueba@example.test', 'Auriculares',
         'Auriculares con cable y sonido correcto.', 9.90, 'aceptable', 'Electronica'
) AS datos
JOIN usuarios u ON u.email = datos.email
JOIN categorias c ON c.nombre = datos.categoria
WHERE NOT EXISTS (
  SELECT 1 FROM articulos a
  WHERE a.usuario_id = u.id AND a.titulo = datos.titulo
);

-- Consulta basica que consumira el listado publico de articulos.
SELECT a.id, a.titulo, a.descripcion, a.precio, a.estado_conservacion,
       a.creado_en, c.nombre AS categoria,
       u.nombre_usuario AS vendedor
FROM articulos a
JOIN categorias c ON c.id = a.categoria_id
JOIN usuarios u ON u.id = a.usuario_id
WHERE a.estado_publicacion = 'publicado'
ORDER BY a.creado_en DESC, a.id DESC;
