const SerialPort = require('serialport').SerialPort;

class Serial {
    constructor(portName, baudRate) {
        this.port = new SerialPort({ path: portName, baudRate: baudRate}); 

        this.port.on('open', () => {
            console.log('Serial port is open and connected.');
        });
        let buffer = ''
        this.port.on('data', (data) => {
            //get data from the arduino 
            buffer += data.toString();
            let newlineIndex = buffer.indexOf('\n');
            while (newlineIndex !== -1) {
                const completeMessage = buffer.substring(0, newlineIndex);
                const jsonData = JSON.parse(completeMessage);

                const booleanDevices = {};
                const valueDevices = {};

                for (const key in jsonData) {
                  const value = jsonData[key];

                  // Check if the value is boolean
                  if (typeof value === 'boolean') {
                    booleanDevices[key] = value;
                  } else {
                    valueDevices[key] = value;
                  }
                }
                const parsedMessage = {devices: booleanDevices, sensors: valueDevices}
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        // save the data 
                        database.saveData(parsedMessage);
                    }
                });
                buffer = buffer.substring(newlineIndex + 1);
                newlineIndex = buffer.indexOf('\n');
            }
        });

        this.port.on('close', () => {
            console.log('Serial port is closed.');

        });

        this.port.on('error', (err) => {
            console.error('Error:', err.message);
        });
    }

    checkStatus() {
      if (this.port.isOpen) {
        return true
      } else {
        return false 
      }
    }

    sendSerialCommand(command, res) {
        if (this.checkStatus()) {
            this.port.write(`${command}\n`, (err) => {
                if (err) {
                    console.error('Error on write:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                console.log(`Serial message sent: ${command}`);
                res.json({ message: `Command '${command}' sent` });
            });
        } else {
            return 
        }
    }
}

module.exports = Serial

