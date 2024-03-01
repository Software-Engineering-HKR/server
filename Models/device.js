import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({ // create schema 
    name: String,
    status: Boolean
})

export default mongoose.model('Device', deviceSchema);