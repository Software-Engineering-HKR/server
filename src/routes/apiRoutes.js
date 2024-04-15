import express from 'express';

import dbController from '../controllers/dbController.js';
import socketController from '../controllers/socketController.js';
import serialController from '../controllers/serialController.js';
import authentication from '../middleware/auth.js';

const router = express.Router();

router.post('/LCD', authentication.verifyToken, async (req, res) => {
    try {
        await dbController.insertMessage(req.body.message)
        const data = await dbController.fetchData()
        await socketController.emitData(data);
        res.status(200).json({ message: 'update successfull' });
        
    } catch (error) {
        console.error('Error in router handler:', error);
        res.status(500).json({ error: error.message });
    }
});

//KEEP AT BOTTOM WILL FIX LATER WHEN I GET A BETTER IDEA 
router.post('/:device', authentication.verifyToken, async (req, res) => {
    try {
        await dbController.setData(req.params.device, req.body.command);
        const data = await dbController.fetchData()
        await socketController.emitData(data);
        serialController.sendSerialCommand(req.params.device, req.body.command)
        res.status(200).json({ message: 'update successfull' });
        
    } catch (error) {
        console.error('Error in router handler:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;