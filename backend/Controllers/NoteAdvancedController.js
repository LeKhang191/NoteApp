const Note = require('../models/Note');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =============================================
// 21. BẬT BẢO VỆ NOTE BẰNG PASSWORD
// =============================================
exports.enablePassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

        if (!note) return res.status(404).json({ message: "Note not found." });
        if (note.isProtected) return res.status(400).json({ message: "Note is already protected." });
        if (!password || !confirmPassword) return res.status(400).json({ message: "Please fill in all fields." });
        if (password !== confirmPassword) return res.status(400).json({ message: "Confirm password does not match." });

        const salt = await bcrypt.genSalt(10);
        note.isProtected = true;
        note.notePassword = await bcrypt.hash(password, salt);
        await note.save();

        res.json({ message: "Note protected with password." });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 21. TẮT BẢO VỆ PASSWORD (cần nhập mật khẩu hiện tại)
// =============================================
exports.disablePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

        if (!note) return res.status(404).json({ message: "Note not found." });
        if (!note.isProtected) return res.status(400).json({ message: "Note is not protected." });

        const isMatch = await bcrypt.compare(password, note.notePassword);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

        note.isProtected = false;
        note.notePassword = undefined;
        await note.save();

        res.json({ message: "Password protection disabled." });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 22. ĐỔI PASSWORD CỦA NOTE
// =============================================
exports.changeNotePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

        if (!note) return res.status(404).json({ message: "Note not found." });
        if (!note.isProtected) return res.status(400).json({ message: "Note is not protected." });
        if (newPassword !== confirmPassword) return res.status(400).json({ message: "New passwords do not match." });

        const isMatch = await bcrypt.compare(currentPassword, note.notePassword);
        if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });

        const salt = await bcrypt.genSalt(10);
        note.notePassword = await bcrypt.hash(newPassword, salt);
        await note.save();

        res.json({ message: "Note password changed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 22. XÁC THỰC PASSWORD ĐỂ MỞ NOTE
// =============================================
exports.verifyNotePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const note = await Note.findOne({ _id: req.params.id });

        if (!note) return res.status(404).json({ message: "Note not found." });
        if (!note.isProtected) return res.status(400).json({ message: "Note is not protected." });

        const isMatch = await bcrypt.compare(password, note.notePassword);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

        // Trả về note đầy đủ sau khi xác thực
        const noteData = note.toObject();
        delete noteData.notePassword;
        res.json({ message: "Verification successful!", note: noteData });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 23. CHIA SẺ NOTE
// =============================================
exports.shareNote = async (req, res) => {
    try {
        const { emails, permission } = req.body; // emails: mảng email
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });

        if (!note) return res.status(404).json({ message: "Note not found." });

        const results = [];

        for (const email of emails) {
            // Validate email phải là tài khoản đã đăng ký
            const recipient = await User.findOne({ email });
            if (!recipient) {
                results.push({ email, status: 'User not found.' });
                continue;
            }

            // Không chia sẻ với chính mình
            if (recipient._id.toString() === req.user.id) {
                results.push({ email, status: 'Cannot share with yourself.' });
                continue;
            }

            // Thêm hoặc cập nhật quyền
            const existing = note.sharedWith.find(s => s.email === email);
            if (existing) {
                existing.permission = permission;
            } else {
                note.sharedWith.push({ email, permission });
            }

            // Gửi email thông báo
            const owner = await User.findById(req.user.id);
            await transporter.sendMail({
                from: `"NoteApp" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `${owner.displayName} shared a note with you!`,
                html: `<h3>Chào ${recipient.displayName}!</h3>
                       <p><strong>${owner.displayName}</strong> đã chia sẻ ghi chú "<strong>${note.title}</strong>" với bạn.</p>
                       <p>Quyền truy cập: <strong>${permission === 'edit' ? 'Chỉnh sửa' : 'Chỉ xem'}</strong></p>
                       <a href="http://localhost:5173/dashboard" style="background:#37352f;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Xem ngay</a>`
            });

            results.push({ email, status: 'Share successful!' });
        }

        await note.save();
        res.json({ message: "Sharing completed!", results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 23. XEM DANH SÁCH NGƯỜI ĐƯỢC CHIA SẺ (owner xem)
// =============================================
exports.getShareDetails = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Note not found." });

        res.json({ noteId: note._id, title: note.title, sharedWith: note.sharedWith });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 23. THU HỒI / ĐỔI QUYỀN CHIA SẺ
// =============================================
exports.updateShare = async (req, res) => {
    try {
        const { email, permission } = req.body;
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Note not found." });

        const share = note.sharedWith.find(s => s.email === email);
        if (!share) return res.status(404).json({ message: "User not found." });

        share.permission = permission;
        await note.save();
        res.json({ message: "Permission updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

exports.revokeShare = async (req, res) => {
    try {
        const { email } = req.body;
        const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
        if (!note) return res.status(404).json({ message: "Note not found." });

        note.sharedWith = note.sharedWith.filter(s => s.email !== email);
        await note.save();
        res.json({ message: "Share revoked successfully!" });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 23. XEM CÁC NOTE ĐƯỢC CHIA SẺ VỚI MÌNH
// =============================================
exports.sharedWithMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const notes = await Note.find({ 'sharedWith.email': user.email })
            .populate('owner', 'displayName email avatar')
            .select('-notePassword');

        const result = notes.map(note => {
            const shareInfo = note.sharedWith.find(s => s.email === user.email);
            return {
                note: { _id: note._id, title: note.title, content: note.content, updatedAt: note.updatedAt },
                owner: note.owner,
                permission: shareInfo.permission,
                sharedAt: note.updatedAt
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};