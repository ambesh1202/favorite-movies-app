const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const uploadController = require('../controllers/uploadsController');

// Use memory storage so we can process buffer with sharp
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });

router.post('/', authenticate, upload.single('file'), uploadController.uploadPoster);

module.exports = router;
