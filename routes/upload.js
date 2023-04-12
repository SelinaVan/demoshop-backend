const express = require('express');
const uploadController = require('../app/controllers/uploadController');
const router = express.Router();
const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});
router.post('/images', upload.single('file'), uploadController.createNewImageUrl)

module.exports = router