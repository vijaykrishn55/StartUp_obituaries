const express = require('express');
const router = express.Router();
const {
  submitPitch,
  getPitches,
  getPitchById,
  updatePitch,
  updatePitchStatus,
  deletePitch,
  getMyPitches,
  getReceivedPitches
} = require('../controllers/pitchController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', submitPitch);
router.get('/', getPitches);

// Specific routes MUST come before /:id
router.get('/my-pitches', getMyPitches);
router.get('/received', getReceivedPitches);

router.get('/:id', getPitchById);
router.put('/:id', updatePitch);
router.put('/:id/status', updatePitchStatus);
router.delete('/:id', deletePitch);

module.exports = router;
