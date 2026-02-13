const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');

// POST /api/files
router.post('/', FileController.uploadFile);

// PUT /api/files/rename
router.put('/rename', FileController.renameFile);

// GET /api/files/stats
router.get('/stats', FileController.getStats);

// GET /api/files/file/:filename
router.get('/file/:filename', FileController.downloadFile);

// DELETE /api/files/file/:filename
router.delete('/file/:filename', FileController.deleteFile);

// GET /api/files
router.get('/', FileController.getFiles);

module.exports = router;
