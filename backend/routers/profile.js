const express = require('express');
const router = express.Router();
const profileController = require('../Controllers/ProfileController');
const authMiddleware = require('../middlewares/AuthMiddleWare');

// Tất cả đều cần đăng nhập
router.use(authMiddleware);

// Tính năng 5: Xem profile
router.get('/', profileController.getProfile);

// Tính năng 6: Sửa profile + avatar
router.put('/', profileController.uploadMiddleware, profileController.updateProfile);

module.exports = router;