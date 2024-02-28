const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const database = require('./database');
const Serial = require('./serial'); // Adjust the path based on your project structure

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const port = new Serial('COM5', 9600);
require('dotenv').config()

app.use(cors(), express.json());

wss.on('connection', async (ws) => {
    console.log('WebSocket client connected');

    try {
        // send the latest data to the client
        ws.send(JSON.stringify(await database.getStatus()));

        ws.on('close', (code, reason) => {
            console.log(`WebSocket closed: ${code} - ${reason}`);
            // Handle WebSocket disconnection here
        });
    
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            // Handle WebSocket errors here
        });

    } catch (error) {
        console.error(error);
    }

    

});

//send device state to all connected clients
async function sendDeviceState() {
    // get data
    const data = await database.getStatus()
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// listens to changes in database 
database.watchAndEmitUpdates(() => {
    sendDeviceState();
});

/* -------------------------ROUTES-------------------------*/
// Route for turning on/off LED
app.post('/api/led', async (req, res) => {
    /*TODO save the data to database if the command is succesfull */
    console.log(req.body);

    port.sendSerialCommand(req.body.command === '1' ? 'LED_ON' : 'LED_OFF', res);
    await database.saveState('led')
    sendDeviceState(); // update the sockets with the new data 
});

// Route for turning on/off Fan
app.post('/api/fan', async (req, res) => {
    port.sendSerialCommand(req.body.command === '1' ? 'FAN_ON' : 'FAN_OFF', res);
    await database.saveState('fan')
    sendDeviceState();
    res.status(200)
});

// Route for opening/closing Window
app.post('/api/window', async (req, res) => {
    port.sendSerialCommand(req.body.command === '1' ? 'WINDOW_OPEN' : 'WINDOW_CLOSE', res);
    await awaitdatabase.saveState('window')
    sendDeviceState();
});

// Route for opening/closing Door
app.post('/api/door', async (req, res) => {
    port.sendSerialCommand(req.body.command === '1' ? 'DOOR_OPEN' : 'DOOR_CLOSE', res);
    await database.saveState('door')
    sendDeviceState();
});


// Route for opening/closing Door
app.get('/api/test', (req, res) => {
    console.log("hello world");
    res.json("hello world")
});

app.listen(3000, '0.0.0.0', async () => {
    console.log('Server running on http://localhost:3000');
    database.init()
});
