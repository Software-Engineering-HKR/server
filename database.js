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

