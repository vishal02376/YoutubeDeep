const express = require('express');
const { downloadVideo } = require('../controllers/videoController');

const router = express.Router();

// Register the download route
router.get('/download', downloadVideo);

module.exports = router;
