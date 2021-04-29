const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InfoSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Info = mongoose.model('info', InfoSchema);