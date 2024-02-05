const mongoose  = require("mongoose");

const electronicSchema = new mongoose.Schema({ // create schema 
    name: String,
    status: Boolean
})

const electronic = mongoose.model('electronics', electronicSchema)

async function init() {
    await mongoose.connect(process.env.uri)
}

async function getStatus() {
    return electronics = await electronic.find(); 

}

async function updateStatus(id) {
    const device = await electronic.findById(id)
    console.log(device);
    device.status = !device.status

    await device.save()

    return device
}

module.exports = {
    init,
    updateStatus,
    getStatus
}