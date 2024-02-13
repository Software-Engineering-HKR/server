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

async function updateStatus(id) {
    const device = await deviceModel.findById(id);
    console.log(device);
    device.status = !device.status;

    await device.save();

    return device;
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
    updateStatus,
    getStatus,
    watchAndEmitUpdates
};
