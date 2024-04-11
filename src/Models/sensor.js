import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
    name: String,
    value: Number
});

export default mongoose.model('Sensor', sensorSchema)
