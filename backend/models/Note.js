// models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  image: { type: String, default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Yêu cầu 21 & 22: Ghi chú bảo vệ bằng mật khẩu
  isProtected: { type: Boolean, default: false },
  notePassword: { type: String }, // Lưu mật khẩu băm

  isPinned: { type: Boolean, default: false },
  pinnedAt: { type: Date, default: null },
  
  // Yêu cầu 23: Chia sẻ ghi chú
  sharedWith: [{
    email: { type: String, required: true },
    permission: { type: String, enum: ['read', 'edit'], default: 'read' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);