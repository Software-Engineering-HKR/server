import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { SerialPort } from 'serialport';
import { init, getStatus, watchAndEmitUpdates, updateDevice, saveData, insertMessage } from './database.js';
import dotenv from 'dotenv';
import { Serial } from './serial.js';
dotenv.config()

const port = new SerialPort({ path: 'COM5', baudRate: 9600 })
const app = express();
const wss = new WebSocketServer({ port: 8080 });
// const port = new Serial('COM5', 9600)

const serverPort = 5000

app.use(cors(), express.json());

wss.on('connection', async (ws) => {
    console.log('WebSocket client connected');

    //send the latest data to the client
    ws.send(JSON.stringify(await getStatus()));

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        // Handle any cleanup or additional logic here
    });

    ws.on('error', (err) => {
        console.error('Error:', err.message);
    });
});

let buffer = "";
port.on('data', (data) => {
    //get data from the arduino 
    buffer += data.toString();
    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex !== -1) {
        const completeMessage = buffer.substring(0, newlineIndex);
        const jsonData = JSON.parse(completeMessage);
        buffer = buffer.substring(newlineIndex + 1);
        newlineIndex = buffer.indexOf('\n');
        saveData(jsonData);
    }
});


// Function to send serial commands
function sendSerialCommand(command, res) {
    port.write(`${command}\n`, (err) => {
        if (err) {
            console.error('Error on write:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Serial message sent: ${command}`);
        // res.json({ message: `Command '${command}' sent` });
    });
}

//send device state to all connected clients
async function sendDeviceState(updatedData) {
    const data = updatedData
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

watchAndEmitUpdates((updatedData) => {
    sendDeviceState(updatedData);
});

app.post('/api/led', async (req, res) => {
    try {
        sendSerialCommand(req.body.command === '1' ? 'LED_ON' : 'LED_OFF', res);
        await updateDevice('led', req.body.command === '1');
        console.log("led!")
        res.status(200).json({ message: "successful" });
    } catch (error) {
        console.error('Error handling LED command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/yellow-led', async (req, res) => {
    try {
        sendSerialCommand(req.body.command === '1' ? 'YELLOWLED_ON' : 'YELLOWLED_OFF', res);
        await updateDevice('yellow-led', req.body.command === '1');
        console.log("yellow led!")
        res.status(200).json({ message: "successfull" })
    } catch (error) {
        console.error('Error handling yellow-led command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });y
    }
});

app.post('/api/fan', async (req, res) => {
    try {
        sendSerialCommand(req.body.command === '1' ? 'FAN_ON' : 'FAN_OFF', res);
        await updateDevice('fan', req.body.command === '1');
        console.log("fan")
        res.status(200).json({ message: "successfull" })
    } catch (error) {
        console.error('Error handling fan command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/window', async (req, res) => {
    try {
        sendSerialCommand(req.body.command === '1' ? 'WINDOW_OPEN' : 'WINDOW_CLOSE', res);
        await updateDevice('window', req.body.command === '1');
        console.log("window!")
        res.status(200).json({ message: "successfull" })
    } catch (error) {
        console.error('Error handling window command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/door', async (req, res) => {
    try {
        sendSerialCommand(req.body.command === '1' ? 'DOOR_OPEN' : 'DOOR_CLOSE', res);
        await updateDevice('door', req.body.command === '1');
        console.log("door!")
        res.status(200).json({ message: "successfull" })
    } catch (error) {
        console.error('Error handling door command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/LCD', async (req, res) => {
    try {
        const { command, message } = req.body;
        const serialCommand = `LCD/${message}`;
        sendSerialCommand(serialCommand, res);
        await insertMessage(req.body.message);
        console.log("new message: " + req.body.message)
        res.status(200).json({ message: "successfull" })
    } catch (error) {
        console.error('Error handling LCD command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/api/alarmOff', async (req, res) => {
    try {
        port.sendSerialCommand(req.body.command === '1' ? 'BUZZER_ON' : 'BUZZER_OFF', res)
    } catch (error) {
        console.error('Error handling BUZZER command:', error.message);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.listen(serverPort, '0.0.0.0', async () => {
    console.log(`Server running on http://localhost:${serverPort}`);
    init()
});