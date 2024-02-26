const express = require('express');
const cors = require('cors');
const SerialPort = require('serialport').SerialPort;
const WebSocket = require('ws');
const database = require('./database');
require('dotenv').config()

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const port = new SerialPort({ path: 'COM5', baudRate: 9600 }); 

app.use(cors(), express.json());

wss.on('connection', async (ws) => {
    console.log('WebSocket client connected');

    try {
        // send the latest data to the client
        ws.send(JSON.stringify(await database.getStatus()));

        let buffer = '';
        port.on('data', (data) => {
            //get data from the arduino 
            buffer += data.toString();
            let newlineIndex = buffer.indexOf('\n');
            while (newlineIndex !== -1) {
                const completeMessage = buffer.substring(0, newlineIndex);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        // save the data 
                        database.saveData(completeMessage);
                    }
                });
                buffer = buffer.substring(newlineIndex + 1);
                newlineIndex = buffer.indexOf('\n');
            }
        });
    } catch (error) {
        console.error('WebSocket connection error:', error);
    }

    ws.on('close', (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
        // Handle WebSocket disconnection here
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        // Handle WebSocket errors here
    });
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

//send device state to all connected clients
async function sendDeviceState(Data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(Data));
        }
    });
}

// listens to changes in database 
database.watchAndEmitUpdates((updatedData) => {
    sendDeviceState(updatedData);
});

/* -------------------------ROUTES-------------------------*/
// Route for turning on/off LED
app.post('/api/led', (req, res) => {
    /*TODO save the data to database if the command is succesfull */
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

app.listen(3000, '0.0.0.0', async () => {
    console.log('Server running on http://localhost:3000');
    database.init()
});
