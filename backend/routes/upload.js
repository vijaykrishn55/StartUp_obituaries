const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleUpload, deleteFile } = require('../utils/uploadService');

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'Please upload a file' }
      });
    }

    const result = await handleUpload(req.file, req.user.id, req.body.type);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await deleteFile(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
