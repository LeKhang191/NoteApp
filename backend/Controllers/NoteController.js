const Note = require('../models/Note');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
// LẤY TẤT CẢ NOTES CỦA USER
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user.id })
            .select('-notePassword')
            .sort({ isPinned: -1, updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "System error." });
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
        res.status(500).json({ message: "System error." });
    }
};

// CẬP NHẬT NOTE
exports.updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;

        const [note, user] = await Promise.all([
            Note.findById(req.params.id),
            User.findById(req.user.id)
        ]);

        if (!note) return res.status(404).json({ message: "Note not found." });

        const isOwner = note.owner.toString() === req.user.id;
        const shareInfo = note.sharedWith.find(s => s.email === user.email);
        const canEdit = isOwner || shareInfo?.permission === 'edit';

        if (!canEdit) return res.status(403).json({ message: "No permission." });

        note.title = title;
        note.content = content;
        await note.save();

        const result = note.toObject();
        delete result.notePassword;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// XÓA NOTE
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Note not found." });
        res.json({ message: "Note deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// PIN/UNPIN NOTE
exports.togglePin = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Note not found." });

        note.isPinned = !note.isPinned;
        note.pinnedAt = note.isPinned ? new Date() : null;
        await note.save({ timestamps: false }); // ← không cập nhật updatedAt
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "System error while pinning note." });
    }
};