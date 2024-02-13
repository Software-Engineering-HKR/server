const mongoose = require("mongoose")


const deviceSchema = new mongoose.Schema({ // create schema 
    name: String,
    status: Boolean
})



module.exports = mongoose.model('Device', deviceSchema)
