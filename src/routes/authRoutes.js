import express from 'express';

import dbController from '../controllers/dbController.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const token = await dbController.login(username, password);
        res.json({ token }); // send the token to the client
    } catch (error) {
        console.error('Error in login:', error);
        res.status(401).json({ error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        await dbController.register(username, password);
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(400).json({ error: error.message });
    }
});

export default router;