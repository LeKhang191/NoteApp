const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Cấu hình upload avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Chỉ chấp nhận file ảnh!'));
    }
});

exports.uploadMiddleware = upload.single('avatar');

// =============================================
// 5. XEM PROFILE
// =============================================
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -activationToken');

        res.json({
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar ? `http://localhost:5000/${user.avatar}` : null,
            isActivated: user.isActivated,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy thông tin profile." });
    }
};

// =============================================
// 6. SỬA PROFILE + UPLOAD AVATAR
// =============================================
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { displayName } = req.body;

        if (displayName) user.displayName = displayName;

        // Nếu có upload ảnh mới
        if (req.file) {
            // Xóa ảnh cũ nếu có
            if (user.avatar && fs.existsSync(user.avatar)) {
                fs.unlinkSync(user.avatar);
            }
            user.avatar = req.file.path;
        }

        await user.save();

        res.json({
            message: "Cập nhật thông tin thành công!",
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar ? `http://localhost:5000/${user.avatar}` : null,
                isActivated: user.isActivated
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật profile." });
    }
};