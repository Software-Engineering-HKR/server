import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    name: String,
    status: Boolean
})

export default mongoose.model('Device', deviceSchema);