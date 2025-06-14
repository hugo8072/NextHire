import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import './db.js'; // Importa a configuração do banco de dados

import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8443;

// Middleware para JSON e CORS
app.use(json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
}));

// Middleware para Helmet
app.use(helmet());

// Rotas principais
app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);

// Exemplo de rota simples
app.post('/login', (req, res) => {
  res.status(200).json({ message: 'Login successful' });
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`Servidor HTTP rodando na porta ${PORT}`);
});

export default app;