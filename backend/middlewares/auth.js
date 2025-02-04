import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        console.log('token:', token);

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
        console.log('secret key:', process.env.JWT_SECRET_KEY);  // debbuging-Imprime o token gerado
        // A variável de ambiente será acessada aqui

        console.log('User ID auth:', decoded._id);

        const user = await User.findOne({
            _id: decoded._id,
        });
        console.log('User:', user);

        const users = await User.find(); // Isso retorna todos os usuários

        console.log('All users:', users); // Imprime todos os usuários no console
        
        if (!user) {
            throw new Error('Unable to login, invalid credentials');
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ error: error.message });
    }
};

export default auth;
