const express = require('express');
const router = express.Router();
const {
  getInbox,
  getThread,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/inbox', protect, getInbox);
router.get('/thread', protect, getThread);
router.post('/', protect, sendMessage);

module.exports = router;