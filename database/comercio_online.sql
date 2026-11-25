CREATE DATABASE IF NOT EXISTS comercio_online
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE comercio_online;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre_usuario VARCHAR(40) NOT NULL UNIQUE,
  nombre_completo VARCHAR(120) NOT NULL,
  foto_perfil VARCHAR(500),
  biografia TEXT,
  ciudad VARCHAR(100),
  estado ENUM('activo', 'bloqueado', 'pendiente_verificacion', 'eliminado')
    NOT NULL DEFAULT 'activo',
  ultimo_acceso DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_estado (estado),
  INDEX idx_usuarios_ciudad (ciudad)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id BIGINT UNSIGNED NOT NULL,
  rol_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_roles_rol FOREIGN KEY (rol_id)
    REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_padre_id BIGINT UNSIGNED NULL,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categoria_padre FOREIGN KEY (categoria_padre_id)
    REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_categorias_activa (activa)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS articulos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vendedor_id BIGINT UNSIGNED NOT NULL,
  categoria_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  estado_conservacion ENUM('new', 'like_new', 'good', 'fair', 'poor') NOT NULL,
  estado_publicacion ENUM('draft', 'published', 'in_review', 'removed', 'sold')
    NOT NULL DEFAULT 'draft',
  ciudad VARCHAR(100) NOT NULL,
  latitud DECIMAL(9, 6) NULL,
  longitud DECIMAL(9, 6) NULL,
  imagen_url VARCHAR(700) NULL,
  publicado_en DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_articulos_precio CHECK (precio >= 0),
  CONSTRAINT fk_articulos_vendedor FOREIGN KEY (vendedor_id)
    REFERENCES usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT fk_articulos_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias(id) ON DELETE RESTRICT,
  INDEX idx_articulos_listado (estado_publicacion, creado_en),
  INDEX idx_articulos_categoria (categoria_id, estado_publicacion),
  INDEX idx_articulos_ciudad (ciudad)
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (nombre, descripcion) VALUES
  ('usuario', 'Puede iniciar sesión y consultar artículos.'),
  ('moderador', 'Rol de prueba para la revisión del proyecto.'),
  ('administrador', 'Rol de prueba con permisos de administración.');

INSERT INTO usuarios
  (email, password_hash, nombre_usuario, nombre_completo, biografia, ciudad, estado)
VALUES
  ('lucia@correo.com', '$2b$12$g3NiF76Btkk/sXdEPbBbleFZp/3uK8kRs2LB0RIahWbB7wMCTQXz6',
   'lucia', 'Lucía Fernández', 'Cuenta de prueba para iniciar sesión.', 'Bilbao', 'activo'),
  ('andres@correo.com', '$2b$12$63AmFCWf.Wc.MHR6cK4yfum23vQTBdHgQMA4Q4o/Hzmu8InBxuYqK',
   'andres_mod', 'Andrés Romero', 'Cuenta de prueba con rol de moderador.', 'Valencia', 'activo'),
  ('nora@correo.com', '$2b$12$KdZzMGCA0db8DH/.84bWxeZw/AmgCZtjKIB/jybGqW2HwkN5Ybqe2',
   'nora_admin', 'Nora Salas', 'Cuenta de prueba con rol de administradora.', 'Madrid', 'activo')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  nombre_usuario = VALUES(nombre_usuario),
  nombre_completo = VALUES(nombre_completo),
  biografia = VALUES(biografia),
  ciudad = VALUES(ciudad),
  estado = VALUES(estado);

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u
JOIN roles r ON r.nombre = 'usuario'
WHERE u.email IN ('lucia@correo.com', 'andres@correo.com', 'nora@correo.com')
ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id);

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u
JOIN roles r ON r.nombre = 'moderador'
WHERE u.email = 'andres@correo.com'
ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id);

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u
JOIN roles r ON r.nombre = 'administrador'
WHERE u.email = 'nora@correo.com'
ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id);

INSERT INTO categorias (nombre, slug, activa) VALUES
  ('Electrónica', 'electronica', TRUE),
  ('Hogar', 'hogar', TRUE),
  ('Libros', 'libros', TRUE),
  ('Deporte', 'deporte', TRUE),
  ('Ropa', 'ropa', TRUE)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  activa = VALUES(activa);

INSERT INTO articulos
  (vendedor_id, categoria_id, titulo, descripcion, precio,
   estado_conservacion, estado_publicacion, ciudad, publicado_en)
SELECT u.id, c.id, datos.titulo, datos.descripcion, datos.precio,
       datos.estado_conservacion, 'published', datos.ciudad, datos.publicado_en
FROM (
  SELECT 'lucia@correo.com' AS email, 'Cámara instantánea' AS titulo,
         'Cámara en buen estado, incluye funda y correa.' AS descripcion,
         85.00 AS precio, 'like_new' AS estado_conservacion,
         'Electrónica' AS categoria, 'Bilbao' AS ciudad,
         '2026-11-16 10:00:00' AS publicado_en
  UNION ALL SELECT 'andres@correo.com', 'Lámpara de mesa',
         'Lámpara sencilla para escritorio o mesilla.', 18.50, 'good',
         'Hogar', 'Valencia', '2026-11-16 11:00:00'
  UNION ALL SELECT 'nora@correo.com', 'Novela de aventuras',
         'Libro cuidado, sin páginas marcadas.', 9.00, 'good',
         'Libros', 'Madrid', '2026-11-16 12:00:00'
  UNION ALL SELECT 'lucia@correo.com', 'Mochila de senderismo',
         'Mochila ligera con varios compartimentos.', 24.00, 'fair',
         'Deporte', 'Bilbao', '2026-11-16 13:00:00'
  UNION ALL SELECT 'andres@correo.com', 'Chaqueta vaquera',
         'Chaqueta vaquera en buen estado, apenas usada.', 22.00, 'good',
         'Ropa', 'Valencia', '2026-11-16 14:00:00'
  UNION ALL SELECT 'nora@correo.com', 'Auriculares inalámbricos',
         'Auriculares con estuche de carga y cable USB.', 35.00, 'like_new',
         'Electrónica', 'Madrid', '2026-11-16 15:00:00'
) AS datos
JOIN usuarios u ON u.email = datos.email
JOIN categorias c ON c.nombre = datos.categoria
WHERE NOT EXISTS (
  SELECT 1
  FROM articulos a
  WHERE a.vendedor_id = u.id AND a.titulo = datos.titulo
);

-- Comprobación del listado público: solo devuelve artículos publicados.
SELECT a.id, a.titulo, a.descripcion, a.precio, a.estado_conservacion,
       a.ciudad, a.publicado_en, c.id AS categoria_id,
       c.nombre AS categoria, u.id AS vendedor_id,
       u.nombre_completo AS vendedor
FROM articulos a
JOIN categorias c ON c.id = a.categoria_id
JOIN usuarios u ON u.id = a.vendedor_id
WHERE a.estado_publicacion = 'published'
ORDER BY a.publicado_en DESC, a.id DESC;
