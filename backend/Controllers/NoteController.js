const Note = require('../models/Note');
const bcrypt = require('bcryptjs');

// LẤY TẤT CẢ NOTES CỦA USER
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user.id })
            .select('-notePassword')
            .sort({ isPinned: -1, updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// TẠO NOTE MỚI
exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.create({
            title: title || '',
            content: content || '',
            owner: req.user.id,
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// CẬP NHẬT NOTE
exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            { title, content },
            { new: true }
        ).select('-notePassword');

        if (!note) return res.status(404).json({ message: "Không tìm thấy note." });
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// XÓA NOTE
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Không tìm thấy note." });
        res.json({ message: "Đã xóa note!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// PIN/UNPIN NOTE
exports.togglePin = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Không tìm thấy note." });

        note.isPinned = !note.isPinned;
        note.pinnedAt = note.isPinned ? new Date() : null;
        await note.save();

        res.json({ isPinned: note.isPinned });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};