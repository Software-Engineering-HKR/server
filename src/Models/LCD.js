import mongoose from 'mongoose';

const LCDSchema = new mongoose.Schema({
    name: String,
    messages: [String]
})

export default mongoose.model('LCD', LCDSchema);