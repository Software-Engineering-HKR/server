import { SerialPort } from 'serialport';

let port = null;

const serialController = {
    init: function () {
        try {
            port = new SerialPort({ path: 'COM5', baudRate: 9600 })

            port.on('open', function () {
                console.log('Serial port is open and connected.');
            });

            port.on('error', function (err) {
                console.error('Error on serial port:', err.message);
            });

            let buffer = "";
            port.on('data', function (data) {
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
        } catch (err) {
            console.error('Error initializing serial port:', err);
        }
    },

    sendSerialCommand: async (device, command) => {
        try {
            if (!port || !port.isOpen) {
                return
            }

            port.write(`${device}, ${command}\n`, (err) => {
                if (err) {
                    console.error('Error writing to serial port:', err.message);
                    throw err;
                }
                console.log('Serial message sent:', command);
            });
        } catch (error) {
            console.error('Error sending serial command:', error);
            throw error;
        }
    },
};

export default serialController;
