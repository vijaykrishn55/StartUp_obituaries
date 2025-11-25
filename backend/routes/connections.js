const express = require('express');
const router = express.Router();
const {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnectionSuggestions,
  getMutualConnections
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getConnections);
router.get('/requests', getConnectionRequests);
router.get('/suggestions', getConnectionSuggestions);
router.get('/mutual/:userId', getMutualConnections);
router.post('/request', sendConnectionRequest);
router.post('/accept/:id', acceptConnectionRequest);
router.post('/reject/:id', rejectConnectionRequest);
router.delete('/:id', removeConnection);

module.exports = router;
