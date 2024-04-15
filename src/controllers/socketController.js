import { Server } from 'socket.io';
import dbController from './dbController.js';

let io = null

const socketController = {

    init: (httpServer) => {
        io = new Server(httpServer);

        io.on('connection', async (socket) => {
            console.log('A user connected');
            //send data 
            socketController.sendData(socket);
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected');
                // io.emit('data', "asd");
            });
        });
    },

    emitData: async (data) => {
        try {
            if (io) {
                io.emit('data', data);
                console.log('Data emitted to all connections');
            } else {
                console.warn('Socket.io server is not initialized');
            }
        } catch (error) {
            console.error(error);
        }
    },

    sendData: async (socket) => {
        const data = await dbController.fetchData();
        if (socket) {
            io.emit('data', data);
            console.log('Data emitted to all connections:');
        } else {
            console.error('Socket.io server is not initialized');
        }
    }
};

export default socketController;