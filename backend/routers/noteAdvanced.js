const express = require('express');
const router = express.Router();
const ctrl = require('../Controllers/NoteAdvancedController');
const auth = require('../middlewares/AuthMiddleWare');

router.use(auth);

// 21. Bật/tắt password
router.post('/:id/enable-password',  ctrl.enablePassword);
router.post('/:id/disable-password', ctrl.disablePassword);

// 22. Đổi password + xác thực mở note
router.post('/:id/change-password',  ctrl.changeNotePassword);
router.post('/:id/verify-password',  ctrl.verifyNotePassword);

// 23. Chia sẻ note
router.post('/:id/share',            ctrl.shareNote);
router.get('/:id/shares',            ctrl.getShareDetails);
router.put('/:id/share',             ctrl.updateShare);
router.delete('/:id/share',          ctrl.revokeShare);

// 23. Note được chia sẻ với mình
router.get('/shared-with-me',        ctrl.sharedWithMe);

module.exports = router;