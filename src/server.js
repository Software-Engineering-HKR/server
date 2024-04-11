import http from 'http';
import app from './app.js'
import dbController from './controllers/dbController.js';
import socketController from './controllers/socketController.js';
import serialController from './controllers/serialController.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// // Socket.io setup
socketController.init(server)

// db.js setup
dbController.init()

// Serial.js setup
serialController.init()

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
