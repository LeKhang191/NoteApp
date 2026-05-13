const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    otp: { type: String },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);