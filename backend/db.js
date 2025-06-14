import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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