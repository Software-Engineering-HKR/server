import mongoose from 'mongoose';

const LCDSchema = new mongoose.Schema({ // create schema 
    name: String,
    messages: [String]
})

export default mongoose.model('LCD', LCDSchema);