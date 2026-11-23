import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { login, me, register, requireAuth } from './auth.js';

export const app = express();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

app.disable('x-powered-by');
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/register', asyncRoute(register));
app.post('/api/auth/login', asyncRoute(login));
app.get('/api/auth/me', requireAuth, asyncRoute(me));

app.use((err, _req, res, _next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Revisa los datos enviados.',
        details: err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
      }
    });
  }
  console.error(err);
  return res.status(err.status || 500).json({
    error: { code: err.code || 'INTERNAL_ERROR', message: err.status ? err.message : 'Error interno del servidor.' }
  });
});
