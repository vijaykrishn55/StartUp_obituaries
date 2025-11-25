const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
  markMessageAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversationMessages);
router.get('/conversations/:id/messages', getConversationMessages); // Alias for nested route
router.post('/conversations/:id/messages', sendMessage); // Nested route for sending
router.post('/conversations/:id', sendMessage); // Keep backward compatibility
router.put('/conversations/:id/read', markMessageAsRead);
router.put('/:id/read', markMessageAsRead); // Keep backward compatibility
router.delete('/conversations/:id/messages/:messageId', deleteMessage);
router.delete('/:id', deleteMessage); // Keep backward compatibility

module.exports = router;
