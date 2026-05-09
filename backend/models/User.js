const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:           { type: String, required: true, unique: true },
    displayName:     { type: String, required: true },
    password:        { type: String, required: true },
    isActivated:     { type: Boolean, default: false },
    activationToken: { type: String, default: null },
    avatar:          { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);