import { app } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';

try {
  await pool.query('SELECT 1');
  app.listen(config.PORT, () => console.log(`API lista en http://localhost:${config.PORT}/api`));
}catch (error) {
  console.error('No se pudo conectar a MySQL.');
  console.error('Error completo:', error);
  console.error('Código:', error?.code ?? '(sin código)');
  process.exit(1);
}

