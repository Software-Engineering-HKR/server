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
        const { led, fan, window, door, motion, light, gas } = JSON.parse(data);
        console.log("data:", JSON.parse(data));

        // Update device data in the Device model
        await deviceModel.findOneAndUpdate({ name: 'led' }, { status: led });
        await deviceModel.findOneAndUpdate({ name: 'fan' }, { status: fan });
        await deviceModel.findOneAndUpdate({ name: 'window' }, { status: window });
        await deviceModel.findOneAndUpdate({ name: 'door' }, { status: door });
        await deviceModel.findOneAndUpdate({ name: 'motion' }, { status: motion });

        // Update sensor data in the Sensor model
        await sensorModel.findOneAndUpdate({ name: 'light' }, { value: light });
        await sensorModel.findOneAndUpdate({ name: 'gas' }, { value: gas });

        console.log('Arduino data updated in the database.');
    } catch (error) {
        console.error('Error updating Arduino data:', error);
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
    getStatus,
    watchAndEmitUpdates,
    saveData,
    updateSensor
}

