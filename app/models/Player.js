const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    age: { type: Number, required: true },
    category: { type: String, required: true },
    photo: { type: String, required: true },
});

module.exports = mongoose.model('Player', playerSchema);