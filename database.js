const mongoose = require("mongoose");
const deviceModel = require('./Models/device');
const sensorModel = require('./Models/sensor');

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
        const { led, fan, window, door, motion, light, gas } = data;

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


async function saveState(name) {
    const device = await deviceModel.findOne({ name: name });
    if (device) {
        const newStatus = !device.status; // reverse the status
        await deviceModel.findOneAndUpdate({ name: name }, { status: newStatus });
        return newStatus;
    } else {
        console.error(`Device with name ${name} not found.`);
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

module.exports = {
    init,
    saveState,
    getStatus,
    watchAndEmitUpdates,
    saveData
};
