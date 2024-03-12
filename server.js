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
    // port.on('data', (data) => {
    //     buffer += data.toString();
    //     let newlineIndex = buffer.indexOf('\n');
    //     while (newlineIndex !== -1) {
    //         let completeMessage = buffer.substring(0, newlineIndex);
    //         try {
    //             completeMessage = JSON.parse(completeMessage);
    //             // Uncomment and adjust the broadcasting logic as needed
    //             // wss.clients.forEach((client) => {
    //             //     if (client.readyState === WebSocket.OPEN) {
    //             //         client.send(JSON.stringify(completeMessage)); // Ensure data is in the correct format
    //             //     }
    //             // });
    //             saveData(completeMessage).catch(error => console.error("Error saving data:", error));
    //         } catch (error) {
    //             console.error("Error parsing JSON:", error);
    //         }
    //         buffer = buffer.substring(newlineIndex + 1);
    //         newlineIndex = buffer.indexOf('\n');
    //     }})
            
});

// Route for turning on/off LED
app.post('/api/led', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'LED_ON' : 'LED_OFF', res);
    updateSensor('led', req.body.command === '1');
});

app.post('/api/yellow-led', async (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'YELLOWLED_ON' : 'YELLOWLED_OFF', res);
    updateSensor('yellow-led', req.body.command === '1');
});

// Route for turning on/off Fan
app.post('/api/fan', (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'FAN_ON' : 'FAN_OFF', res);
    updateSensor('fan', req.body.command === '1');
});

// Route for opening/closing Window
app.post('/api/window', (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'WINDOW_OPEN' : 'WINDOW_CLOSE', res);
    updateSensor('window', req.body.command === '1');
});

// Route for opening/closing Door
app.post('/api/door', (req, res) => {
    // sendSerialCommand(req.body.command === '1' ? 'DOOR_OPEN' : 'DOOR_CLOSE', res);
    updateSensor('door', req.body.command === '1');
});

// Function to send serial commands
// function sendSerialCommand(command, res) {
//     port.write(`${command}\n`, (err) => {
//         if (err) {
//             console.error('Error on write:', err.message);
//             return res.status(500).json({ error: err.message });
//         }
//         console.log(`Serial message sent: ${command}`);
//         res.json({ message: `Command '${command}' sent` });
//     });
// }

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
    console.log(updatedData)
    sendDeviceState(updatedData);
});

app.listen(5000, '0.0.0.0', async () => {
    console.log('Server running on http://localhost:5000');
    init()
});
