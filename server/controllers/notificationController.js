const Message = require('../models/Message');
const Transaction = require('../models/Transaction');

exports.getSummary = async (req, res) => {
  try {
    const unreadMessages = await Message.countDocuments({
      $or: [{ buyer: req.user._id, readByBuyer: false }, { seller: req.user._id, readBySeller: false }]
    });

    const openTransactions = await Transaction.countDocuments({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
      status: { $in: ['pending', 'reserved'] }
    });

    res.status(200).json({
      success: true,
      unreadMessages,
      openTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};