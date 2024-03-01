import mongoose from 'mongoose';
import deviceModel from './Models/device.js';
import sensorModel from './Models/sensor.js';


async function init() {
    await mongoose.connect(process.env.uri);
}

async function getStatus() {
    try {
        const [deviceData, sensorData] = await Promise.all([
            deviceModel.find(),
            sensorModel.find()
        ]);

        return { devices: deviceData, sensors: sensorData };
    } catch (error) {
        console.error('Error querying data:', error);
    }
}

async function saveData(data) {
    try {
        // Extract relevant fields from the Arduino data

        for (const key in data.devices) {
            value = data.devices[key]
            await deviceModel.findOneAndUpdate({ name: key }, { status: value });
        }

        for (const key in data.sensors) {
            value = data.devices[key]
            await sensorModel.findOneAndUpdate({ name: key }, { value: value });
        }

        console.log('Arduino data updated in the database.');
    } catch (error) {
        console.error('Error updating Arduino data:', error);
    }
}


async function saveState(name,command) {

    try {
        const newStatus = (command == 1) ? true : false; // reverse the status
        await deviceModel.findOneAndUpdate({ name: name }, { status: newStatus  });
        return 
    } catch (error) {
        console.error('Error handling Mongoose change event:', error);
    }
}
// Function to watch for changes and emit updates
function watchAndEmitUpdates(sendUpdateCallback) {
    deviceModel.watch().on('change', async (change) => {
        try {
            const updatedData = await deviceModel.findOne();
            sendUpdateCallback(updatedData);
        } catch (error) {
            console.error('Error handling Mongoose change event:', error);
        }
    });
}

async function updateSensor(sensor, command) {
    await deviceModel.findOneAndUpdate({ name: sensor }, { status: command });
}

export {
    init,
    saveState,
    getStatus,
    watchAndEmitUpdates,
    saveData,
    updateSensor
}

