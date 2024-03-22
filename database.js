import mongoose from 'mongoose';
import deviceModel from './Models/device.js';
import sensorModel from './Models/sensor.js';
import lcdModel from './Models/lcd.js';


async function init() {
    await mongoose.connect(process.env.uri);
}

async function getStatus() {
    try {
        const [deviceData, sensorData, lcdData] = await Promise.all([
            deviceModel.find(),
            sensorModel.find(),
            lcdModel.findOne() 
        ]);

        return { devices: deviceData, sensors: sensorData, lcd: lcdData };
    } catch (error) {
        console.error('Error querying data:', error);
    }
}

async function insertMessage(newMessage) {

    try {
        // Find the LCD document
        const lcd = await lcdModel.findOne();
    
        // If the LCD document exists
        if (lcd) {
            let updatedMessages;
    
            // If the messages array already has 10 messages, remove the oldest one
            if (lcd.messages.length >= 10) {
                updatedMessages = lcd.messages.slice(1); // Remove the first (oldest) message
            } else {
                updatedMessages = lcd.messages; // Copy the existing messages
            }
    
            // Add the new message to the end of the messages array
            updatedMessages.push(newMessage);

            // Update the LCD document with the new messages array
            await lcdModel.findOneAndUpdate({ name: lcd.name }, { messages: updatedMessages });
    
            console.log('LCD document updated with the new message.');
        } else {
            console.error('LCD document not found.');
        }
    } catch (error) {
        console.error('Error updating LCD document:', error);
    }
}

async function saveData(data) {
    try {
        for (const key in data.devices) {
            let value = data.devices[key];
            // Directly await each update with upsert
            await deviceModel.findOneAndUpdate(
                { name: key },
                { $set: { status: value } },
                { upsert: true }
            );
        }

        for (const key in data.sensors) {
            let value = data.sensors[key];
            // Directly await each update with upsert
            await sensorModel.findOneAndUpdate(
                { name: key },
                { $set: { value: value } },
                { upsert: true }
            );
        }

        console.log('Arduino data updated in the database.');
    } catch (error) {
        console.error('Error updating Arduino data:', error);
    }
}


async function saveState(name, command) {
    try {
        const newStatus = (command == 1) ? true : false; // reverse the status
        await deviceModel.findOneAndUpdate({ name: name }, { status: newStatus });
        return
    } catch (error) {
        console.error('Error handling Mongoose change event:', error);
    }
}

// Function to watch for changes and emit updates
function watchAndEmitUpdates(sendUpdateCallback) {
    const deviceChangeStream = deviceModel.watch();
    const sensorChangeStream = sensorModel.watch();

    deviceChangeStream.on('change', async () => {
        try {
            const allData = await getStatus();
            sendUpdateCallback(allData);
        } catch (error) {
            console.error('Error handling change event for device:', error);
        }
    });

    sensorChangeStream.on('change', async () => {
        try {
            const allData = await getStatus();
            sendUpdateCallback(allData);
        } catch (error) {
            console.error('Error handling change event for sensor:', error);
        }
    });
}

async function updateDevice(sensor, command) {
    try {
        await deviceModel.findOneAndUpdate({ name: sensor }, { status: command });
    } catch (error) {
        console.log(error);
    }
}

export {
    init,
    saveState,
    getStatus,
    watchAndEmitUpdates,
    saveData,
    updateDevice,
    insertMessage
}

