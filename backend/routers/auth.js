const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const authMiddleware = require('../middlewares/AuthMiddleWare');

// Tính năng 1: Đăng ký
router.post('/register', authController.register);

// Tính năng 2: Kích hoạt email
router.get('/verify/:token', authController.verifyEmail);

// Tính năng 3: Đăng nhập
router.post('/login', authController.login);

// Tính năng 4: Quên mật khẩu
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp',      authController.verifyOtp);
router.post('/reset-password',  authController.resetPassword);

// Tính năng 7: Đổi mật khẩu (cần login)
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;