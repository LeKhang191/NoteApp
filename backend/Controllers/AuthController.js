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
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });

        if (password !== confirmPassword)
            return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email này đã được đăng ký." });

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
            subject: 'Kích hoạt tài khoản NoteApp',
            html: `<h3>Chào ${displayName}!</h3>
                   <p>Nhấn vào link để kích hoạt tài khoản:</p>
                   <a href="${activationUrl}" style="background:#37352f;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Kích hoạt</a>
                   <p>Link hết hạn sau 24 giờ.</p>`
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: "Đăng ký thành công! Kiểm tra email để kích hoạt.",
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
            return res.status(400).json({ message: "Link kích hoạt không hợp lệ hoặc đã hết hạn." });

        user.isActivated = true;
        user.activationToken = undefined;
        await user.save();

        res.json({ message: "Kích hoạt tài khoản thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi kích hoạt tài khoản." });
    }
};

// =============================================
// 3. ĐĂNG NHẬP
// =============================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName, isActivated: user.isActivated, avatar: user.avatar }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập." });
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
            return res.json({ message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn." });

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
            subject: 'Đặt lại mật khẩu NoteApp',
            html: `<h3>Đặt lại mật khẩu</h3>
                   <p>Nhấn link để đặt lại mật khẩu:</p>
                   <a href="${resetUrl}" style="background:#37352f;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Đặt lại mật khẩu</a>
                   <p>Hoặc nhập mã OTP: <strong style="font-size:24px">${otp}</strong></p>
                   <p>Hết hạn sau 15 phút.</p>`
        });

        res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Lỗi hệ thống." });
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
            return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn." });

        res.json({ message: "OTP hợp lệ!", token: record.token });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};

// =============================================
// 4. ĐẶT LẠI MẬT KHẨU MỚI
// =============================================
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, password, confirmPassword } = req.body;

        if (password !== confirmPassword)
            return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });

        const record = await PasswordReset.findOne({
            email,
            token,
            expiresAt: { $gt: new Date() }
        });

        if (!record)
            return res.status(400).json({ message: "Link không hợp lệ hoặc đã hết hạn." });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "Không tìm thấy tài khoản." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Xóa token đã dùng
        await PasswordReset.deleteMany({ email });

        res.json({ message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại." });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
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
            return res.status(404).json({ message: "Không tìm thấy tài khoản." });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Mật khẩu cũ không đúng." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
};