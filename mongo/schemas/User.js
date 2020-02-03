const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    login: {
        type: String,
        match: /[a-z\.]/i,
        required: [true, 'Vyplňte jméno nebo uvidíte'],
        unique: true
    },
    password: {type: String, required: true},
    created: {type: Date, default: Date.now},
});

module.exports = UserSchema;