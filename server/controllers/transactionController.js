const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

const isSameUser = (left, right) => left && right && left.toString() === right.toString();

const syncProductStatus = async (productId, status) => {
  const update = {};

  if (status === 'reserved') {
    update.status = 'reserved';
  } else if (status === 'sold') {
    update.status = 'sold';
  } else if (status === 'cancelled') {
    const activeReserved = await Transaction.exists({
      product: productId,
      status: 'reserved'
    });

    update.status = activeReserved ? 'reserved' : 'available';
  }

  if (Object.keys(update).length > 0) {
    await Product.findByIdAndUpdate(productId, update, { new: true });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('product', 'title imageUrl price status sellerName')
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { productId, note } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required'
      });
    }

    const product = await Product.findById(productId).populate('seller', 'name email role');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (isSameUser(product.seller._id, req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create a transaction for your own product'
      });
    }

    if (product.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'This product has already been sold'
      });
    }

    const existingTransaction = await Transaction.findOne({
      product: product._id,
      buyer: req.user._id,
      seller: product.seller._id,
      status: { $in: ['pending', 'reserved'] }
    });

    if (existingTransaction) {
      const populatedTransaction = await Transaction.findById(existingTransaction._id)
        .populate('product', 'title imageUrl price status sellerName')
        .populate('buyer', 'name email role')
        .populate('seller', 'name email role');

      return res.status(200).json({
        success: true,
        message: 'Transaction already exists',
        transaction: populatedTransaction
      });
    }

    const transaction = await Transaction.create({
      product: product._id,
      buyer: req.user._id,
      seller: product.seller._id,
      amount: product.price,
      note: note ? note.trim() : '',
      status: 'pending'
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('product', 'title imageUrl price status sellerName')
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Transaction request created successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('product', 'status');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const isSeller = isSameUser(transaction.seller, req.user._id);
    const isBuyer = isSameUser(transaction.buyer, req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isBuyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this transaction'
      });
    }

    const allowedStatuses = isBuyer
      ? ['cancelled']
      : ['pending', 'reserved', 'sold', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction status update'
      });
    }

    transaction.status = status;
    await transaction.save();

    await syncProductStatus(transaction.product._id, status);

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('product', 'title imageUrl price status sellerName')
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};