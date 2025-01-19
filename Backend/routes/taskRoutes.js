import express from 'express';
const router = express.Router(); // Corrigido aqui

// Rota básica
router.get('/', (req, res) => {
    res.send("Task routes are working");
});

// Exportando o router como export default
export default router;
