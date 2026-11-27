// Creation and configuration of the Express APP
import express from "express";
import cors from "cors";
import { config } from './config/config.js';

import apiRoutes from "./routes/api.routes.js";

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: '32kb' }));

// Route configuration
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Not found',
            details: 'The requested resource was not found.'
        }
    });
});

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

export default app;
