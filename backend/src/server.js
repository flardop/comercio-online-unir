import { app } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

try {
  await pool.query('SELECT 1');
  app.listen(config.PORT, () => console.log(`API lista en http://localhost:${config.PORT}/api`));
} catch (error) {
  console.error('No se pudo conectar a MySQL. Comprueba backend/.env y que la base comercio_online esté creada.', error.message);
  process.exit(1);
}
