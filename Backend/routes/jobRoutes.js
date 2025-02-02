import express from 'express';
const router = express.Router(); 
import auth from '../middlewares/auth.js';



// 'print' to check if is working
router.get('/test', auth,(req, res) => {
    res.send("Task routes are working");
});


export default router;
