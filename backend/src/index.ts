import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes';
import positionRoutes from './routes/positionRoutes';
import { uploadFile } from './application/services/fileUploadService';
import cors from 'cors';

// Extender la interfaz Request para incluir prisma
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default app;

// Middleware para parsear JSON. Asegúrate de que esto esté antes de tus rutas.
app.use(express.json());

// Middleware para adjuntar prisma al objeto de solicitud
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Middleware CORS: SPA en :3000 (localhost o 127.0.0.1)
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// Comprobación rápida en navegador: http://localhost:3010/
app.get('/', (_req, res) => {
  res.type('text/plain; charset=utf-8').send('Hola LTI!');
});

// Import and use candidateRoutes
app.use('/candidates', candidateRoutes);

// Route for file uploads
app.post('/upload', uploadFile);

// Rutas de posición (alias /position y /positions por compatibilidad)
app.use('/position', positionRoutes);
app.use('/positions', positionRoutes);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const port = 3010;

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
