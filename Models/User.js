
const mongoose = require("mongoose")

const Usuario = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    Motos:{
        type: Array
    }
})
    module.exports =mongoose.model("Usuario", Usuario)
