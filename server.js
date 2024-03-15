import express from 'express';
import cors from 'cors';
import { SerialPort } from 'serialport';
import { WebSocketServer, WebSocket } from 'ws';
import { init, getStatus, watchAndEmitUpdates, saveData, updateSensor } from './database.js';
import dotenv from 'dotenv';
dotenv.config()

const app = express();
const wss = new WebSocketServer({ port: 8080 });
// const port = new SerialPort({ path: 'COM5', baudRate: 9600 });

app.use(cors(), express.json());

wss.on('connection', async (ws) => {
    console.log('WebSocket client connected');

    //send the latest data to the client
    ws.send(JSON.stringify(await getStatus()));

    let buffer = '';
});

// Route for turning on/off LED
app.post('/api/led', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'LED_ON' : 'LED_OFF', res);
    await updateSensor('led', req.body.command === '1');
    res.status(200).json({message: "successfull"})
});

app.post('/api/yellow-led', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'YELLOWLED_ON' : 'YELLOWLED_OFF', res);
    await updateSensor('yellow-led', req.body.command === '1');
    res.status(200).json({message: "successfull"})
});

// Route for turning on/off Fan
app.post('/api/fan', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'FAN_ON' : 'FAN_OFF', res);
    await updateSensor('fan', req.body.command === '1');
    res.status(200).json({message: "successfull"})
});

// Route for opening/closing Window
app.post('/api/window', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'WINDOW_OPEN' : 'WINDOW_CLOSE', res);
    await updateSensor('window', req.body.command === '1');
    res.status(200).json({message: "successfull"})
});

// Route for opening/closing Door
app.post('/api/door', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'DOOR_OPEN' : 'DOOR_CLOSE', res);
    await updateSensor('door', req.body.command === '1');
    res.status(200).json({message: "successfull"})
});

//send device state to all connected clients
async function sendDeviceState(updatedData) {
    const data = updatedData
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}


// listens to changes in database 
watchAndEmitUpdates((updatedData) => {
    sendDeviceState(updatedData);
});

app.listen(3000, '0.0.0.0', async () => {
    console.log('Server running on http://localhost:5000');
    init()
});
