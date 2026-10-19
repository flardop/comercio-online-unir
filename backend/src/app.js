import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';

export const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', message: 'La API está funcionando' });
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Ha ocurrido un error interno' });
});

