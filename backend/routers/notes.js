const express = require('express');
const router = express.Router();
const noteCtrl = require('../Controllers/NoteController');
const advCtrl  = require('../Controllers/NoteAdvancedController');
const auth     = require('../middlewares/AuthMiddleWare');

router.use(auth);

// CRUD
router.get('/',           noteCtrl.getNotes);
router.post('/',          noteCtrl.createNote);
router.put('/:id',        noteCtrl.updateNote);
router.delete('/:id',     noteCtrl.deleteNote);
router.patch('/:id/pin',  noteCtrl.togglePin);

// 21 & 22: Password
router.post('/:id/enable-password',  advCtrl.enablePassword);
router.post('/:id/disable-password', advCtrl.disablePassword);
router.post('/:id/change-password',  advCtrl.changeNotePassword);
router.post('/:id/verify-password',  advCtrl.verifyNotePassword);

// 23: Share
router.get('/shared-with-me',    advCtrl.sharedWithMe);
router.post('/:id/share',        advCtrl.shareNote);
router.get('/:id/shares',        advCtrl.getShareDetails);
router.put('/:id/share',         advCtrl.updateShare);
router.delete('/:id/share',      advCtrl.revokeShare);


module.exports = router;