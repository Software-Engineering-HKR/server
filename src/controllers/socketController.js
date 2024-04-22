import {WebSocket, WebSocketServer} from 'ws';
import dbController from './dbController.js';

let wss = null;

const socketController = {
    init: (httpServer) => {
        wss = new WebSocketServer({ server: httpServer });

        wss.on('connection', async (socket) => {
            console.log('A user connected');

            // Send data to the connected client
            socketController.sendData(socket);

            // Handle disconnection
            socket.on('close', () => {
                console.log('User disconnected');
            });
        });
    },

    emitData: async (data) => {
        try {
            if (wss) {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
                console.log('Data emitted to all connections');
            } else {
                console.warn('WebSocket server is not initialized');
            }
        } catch (error) {
            console.error(error);
        }
    },

    sendData: async (socket) => {
        const data = await dbController.fetchData();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
            console.log('Data emitted to the connection');
        } else {
            console.error('WebSocket connection is not initialized or closed');
        }
    }
};

export default socketController;
