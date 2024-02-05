const express = require('express');
const cors = require('cors');
const SerialPort = require('serialport').SerialPort;
const WebSocket = require('ws');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const port = new SerialPort({ path: 'COM5', baudRate: 9600 }); 

app.use(cors());
app.use(express.json());

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    let buffer = '';
    port.on('data', (data) => {
        buffer += data.toString();
        let newlineIndex = buffer.indexOf('\n');
        while (newlineIndex !== -1) {
            const completeMessage = buffer.substring(0, newlineIndex);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(completeMessage);
                }
            });
            buffer = buffer.substring(newlineIndex + 1);
            newlineIndex = buffer.indexOf('\n');
        }
    });
    // Handle disconnection, errors, etc.
});

// Route for turning on/off LED
app.post('/api/led', (req, res) => {
    sendSerialCommand(req.body.command === '1' ? 'LED_ON' : 'LED_OFF', res);
});

// Route for turning on/off Fan
app.post('/api/fan', (req, res) => {
    sendSerialCommand(req.body.command === '1' ? 'FAN_ON' : 'FAN_OFF', res);
});

// Route for opening/closing Window
app.post('/api/window', (req, res) => {
    sendSerialCommand(req.body.command === '1' ? 'WINDOW_OPEN' : 'WINDOW_CLOSE', res);
});

// Route for opening/closing Door
app.post('/api/door', (req, res) => {
    sendSerialCommand(req.body.command === '1' ? 'DOOR_OPEN' : 'DOOR_CLOSE', res);
});

// Function to send serial commands
function sendSerialCommand(command, res) {
    port.write(`${command}\n`, (err) => {
        if (err) {
            console.error('Error on write:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Serial message sent: ${command}`);
        res.json({ message: `Command '${command}' sent` });
    });
}

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
});