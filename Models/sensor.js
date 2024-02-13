const mongoose = require("mongoose")

const sensorSchema = new mongoose.Schema({
    name: String,
    value: Number
});

module.exports = mongoose.model('Sensor', sensorSchema)
