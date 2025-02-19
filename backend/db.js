import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Usar o middleware CORS com todas as permissões
app.use(cors({
  origin: '*', // Permite qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite os métodos necessários
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true, // Permite o envio de cookies e autenticação
}));

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Rota de login
app.post('/users/login', (req, res) => {
  res.json({ message: 'Login feito com sucesso!' });
});

app.get('/users/login', (req, res) => {
  res.json({ message: 'Login successful' });
});

// Conectar ao banco de dados MongoDB
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

if (!MONGO_URL || !DB_NAME) {
  console.error('MONGO_URL ou DB_NAME não definidos no arquivo .env');
  process.exit(1);
}

mongoose.connect(MONGO_URL, { dbName: DB_NAME })
  .then(() => {
    console.log('Conectado ao banco de dados!');
  })
  .catch((err) => {
    console.log('Erro ao conectar ao banco de dados: ' + err);
  });

// Certifique-se de lidar com requisições OPTIONS corretamente
app.options('*', cors()); // Esse já está correto, mas pode não ser necessário se você já estiver usando `cors()` globalmente

// Definindo a porta
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

