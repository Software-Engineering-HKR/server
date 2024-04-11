import asyncHandler from 'express-async-handler';
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
                // io.emit('chat message', "asd");
            });
        });
    },

    emitData: asyncHandler(async (req, res, next) => {
        const data = await dbController.fetchData();
        if (io) {
            io.emit('chat message', data);
            res.status(200).json(data)
        } else {
            console.error('Socket.io server is not initialized');
            res.status(400).json({message: "Socket error"})
        }
    }),

    sendData: async (socket) => {
        const data = await dbController.fetchData();
        if (socket) {
            io.emit('chat message', data);
            console.log('Data emitted to all connections:');
        } else {
            console.error('Socket.io server is not initialized');
        }
    }
};

export default socketController;