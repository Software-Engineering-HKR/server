import { SerialPort } from 'serialport';
import asyncHandler from 'express-async-handler';
import dbController from './dbController.js';
import socketController from './socketController.js';

let port = null;

const serialController = {

    init: function() {
        try {
            port = new SerialPort({ path: 'COM5', baudRate: 9600 })
            port.on('open', function() {
                console.log('Serial port is open and connected.');
            });

            let buffer = "";
            port.on('data', function(data) {
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

            port.on('error', function(err) {
                console.error('Error:', err.message);
            });

            port.on('close', function() {
                console.log('Serial port is closed.');
            });

        } catch (err) {
            console.log(err);
        }
    },

    sendSerialCommand: asyncHandler(async (req, res, next) => {
        if (port.isOpen) {
            port.write(`${req.body.command}\n`, (err) => {
                if (err) {
                    console.error('Error on write:', err.message);
                    return res.status(500).json({ message: 'Error on write' });
                }
                console.log('Serial message sent:', req.body.command);
                next();
            });
        } else {
            next()
        }
    }),
};


export default serialController