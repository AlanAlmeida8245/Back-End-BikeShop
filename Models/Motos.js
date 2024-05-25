const mongoose = require('mongoose');

const motoSchema = new mongoose.Schema({
    marca: String,
    modelo: String,
    ano: Number,
    precoDiario: Number,
    disponivel: Boolean,
    AlugadaPor: String,
    tempoAluguel: Number,
    image: String
});
module.exports =mongoose.model("Moto", motoSchema)