import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? 'segunda_mano',
    user: process.env.DB_USER ?? 'app_user',
    password: process.env.DB_PASSWORD ?? 'app_password',
  },
};

