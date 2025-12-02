const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const warRoomController = require('../controllers/warRoomController');

// Create war room
router.post('/', protect, warRoomController.createWarRoom);

// Get all war rooms
router.get('/', warRoomController.getWarRooms);

// Get single war room
router.get('/:id', protect, warRoomController.getWarRoomById);

// Join war room
router.post('/:id/join', protect, warRoomController.joinWarRoom);

// Send message
router.post('/:id/messages', protect, warRoomController.sendMessage);

// React to message
router.post('/:id/messages/:messageId/react', protect, warRoomController.reactToMessage);

// Add action item
router.post('/:id/actions', protect, warRoomController.addActionItem);

// Update action item
router.put('/:id/actions/:actionId', protect, warRoomController.updateActionItem);

// Add resource
router.post('/:id/resources', protect, warRoomController.addResource);

// Create poll
router.post('/:id/polls', protect, warRoomController.createPoll);

// Vote on poll
router.post('/:id/polls/:pollId/vote', protect, warRoomController.voteOnPoll);

// Add mentor note
router.post('/:id/mentor-notes', protect, warRoomController.addMentorNote);

// End war room
router.post('/:id/end', protect, warRoomController.endWarRoom);

module.exports = router;
