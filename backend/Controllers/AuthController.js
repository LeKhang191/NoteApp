const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =============================================
// 1. ĐĂNG KÝ
// =============================================
exports.register = async (req, res) => {
    try {
        const { email, displayName, password, confirmPassword } = req.body;

        if (!email || !displayName || !password)
            return res.status(400).json({ message: "Pls enter all required fields." });

        if (password !== confirmPassword)
            return res.status(400).json({ message: "Confirm password does not match." });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "This email is already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const activationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            email, displayName,
            password: hashedPassword,
            activationToken,
            isActivated: false
        });

        // Gửi email kích hoạt
        const activationUrl = `http://localhost:5173/verify/${activationToken}`;
        await transporter.sendMail({
            from: `"NoteApp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Activate Your NoteApp Account',
            html: `<h3>Hello ${displayName}!</h3>
                   <p>Click the link below to activate your account:</p>
                   <a href="${activationUrl}" style="background:#37352f;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Activate Account</a>
                   <p>This link will expire in 24 hours.</p>`
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: "Registration successful! Please check your email to activate your account.",
            token,
            user: { id: newUser._id, email: newUser.email, displayName: newUser.displayName, isActivated: false, avatar: null }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: "Lỗi hệ thống khi đăng ký." });
    }
};

// =============================================
// 2. KÍCH HOẠT TÀI KHOẢN
// =============================================
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ activationToken: token });

        if (!user)
            return res.status(400).json({ message: "Invalid or expired activation link." });

        user.isActivated = true;
        user.activationToken = undefined;
        await user.save();

        res.json({ message: "Account activated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error activating account." });
    }
};

// =============================================
// 3. ĐĂNG NHẬP
// =============================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Pls enter email and password." });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid email or password." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Login successful!",
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName, isActivated: user.isActivated, avatar: user.avatar }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error occurred while logging in." });
    }
};

// =============================================
// 4. QUÊN MẬT KHẨU - GỬI EMAIL
// =============================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Không tiết lộ email có tồn tại không
        if (!user)
            return res.json({ message: "If the email exists, you will receive instructions." });

        // Xóa token cũ nếu có
        await PasswordReset.deleteMany({ email });

        const token = crypto.randomBytes(32).toString('hex');
        const otp = String(Math.floor(100000 + Math.random() * 900000)); // OTP 6 số

        await PasswordReset.create({
            email,
            token,
            otp,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 phút
        });

        const resetUrl = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        await transporter.sendMail({
            from: `"NoteApp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your NoteApp Password',
            html: `<h3>Reset Your Password</h3>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetUrl}" style="background:#37352f;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
                   <p>Or enter the OTP: <strong style="font-size:24px">${otp}</strong></p>
                   <p>This link will expire in 15 minutes.</p>`
        });

        res.json({ message: "Password reset email has been sent!" });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 4. XÁC NHẬN OTP
// =============================================
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const record = await PasswordReset.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!record)
            return res.status(400).json({ message: "Invalid or expired OTP." });

        res.json({ message: "Valid OTP!", token: record.token });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 4. ĐẶT LẠI MẬT KHẨU MỚI
// =============================================
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, password, confirmPassword } = req.body;

        if (password !== confirmPassword)
            return res.status(400).json({ message: "Confirm password does not match." });

        const record = await PasswordReset.findOne({
            email,
            token,
            expiresAt: { $gt: new Date() }
        });

        if (!record)
            return res.status(400).json({ message: "Invalid or expired reset link." });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Xóa token đã dùng
        await PasswordReset.deleteMany({ email });

        res.json({ message: "Password reset successful! Please log in again." });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};

// =============================================
// 7. ĐỔI MẬT KHẨU
// =============================================
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user)
            return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Old password is incorrect." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Password changed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "System error." });
    }
};