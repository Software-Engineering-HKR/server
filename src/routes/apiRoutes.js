import express from 'express';

import dbController from '../controllers/dbController.js';
import socketController from '../controllers/socketController.js';
import serialController from '../controllers/serialController.js';
import authentication from '../middleware/auth.js';

const router = express.Router();

router.get('/test', dbController.test);

router.post('/LCD',  dbController.insertMessage, socketController.emitData)

router.post('/login',  dbController.login)

router.post('/register', dbController.register)



router.post('/:device', authentication.verifyToken, [dbController.setData, serialController.sendSerialCommand, socketController.emitData]);



export default router;