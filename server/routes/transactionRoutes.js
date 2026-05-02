const express = require('express');
const router = express.Router();
const {
  getMyTransactions,
  createTransaction,
  updateTransactionStatus
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMyTransactions);
router.post('/', protect, createTransaction);
router.put('/:id', protect, updateTransactionStatus);

module.exports = router;