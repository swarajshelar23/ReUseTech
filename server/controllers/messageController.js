const Message = require('../models/Message');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

const buildThreadKey = (productId, buyerId, sellerId) => {
  return `${productId}:${buyerId}:${sellerId}`;
};

const isSameUser = (left, right) => left && right && left.toString() === right.toString();

const getParticipantIds = (product, user, buyerIdFromRequest) => {
  const sellerId = product.seller._id ? product.seller._id : product.seller;

  if (user.role === 'admin') {
    if (!buyerIdFromRequest) {
      return null;
    }

    return {
      buyerId: buyerIdFromRequest,
      sellerId
    };
  }

  if (isSameUser(user._id, sellerId)) {
    if (!buyerIdFromRequest) {
      return null;
    }

    return {
      buyerId: buyerIdFromRequest,
      sellerId
    };
  }

  return {
    buyerId: user._id,
    sellerId
  };
};

const findActiveTransaction = async (productId, buyerId, sellerId) => {
  return Transaction.findOne({
    product: productId,
    buyer: buyerId,
    seller: sellerId,
    status: { $in: ['pending', 'reserved'] }
  })
    .populate('product')
    .populate('buyer', 'name email')
    .populate('seller', 'name email');
};

exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('product', 'title imageUrl price status')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    const threadsByKey = new Map();

    for (const message of messages) {
      if (!threadsByKey.has(message.threadKey)) {
        const isCurrentUserBuyer = isSameUser(message.buyer._id, req.user._id);
        const partner = isCurrentUserBuyer ? message.seller : message.buyer;

        threadsByKey.set(message.threadKey, {
          threadKey: message.threadKey,
          product: message.product,
          buyer: message.buyer,
          seller: message.seller,
          partner,
          latestMessage: message,
          unreadCount: 0
        });
      }

      const thread = threadsByKey.get(message.threadKey);
      const isCurrentUserBuyer = isSameUser(message.buyer._id, req.user._id);
      const unreadField = isCurrentUserBuyer ? 'readByBuyer' : 'readBySeller';

      if (!message[unreadField] && !isSameUser(message.sender._id, req.user._id)) {
        thread.unreadCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      threads: Array.from(threadsByKey.values())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getThread = async (req, res) => {
  try {
    const { productId, buyerId } = req.query;

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

    const participantIds = getParticipantIds(product, req.user, buyerId || null);

    if (!participantIds) {
      return res.status(400).json({
        success: false,
        message: 'buyerId is required for seller conversations'
      });
    }

    const { buyerId: resolvedBuyerId, sellerId } = participantIds;
    const threadKey = buildThreadKey(product._id.toString(), resolvedBuyerId.toString(), sellerId.toString());

    const isAuthorized =
      isSameUser(req.user._id, resolvedBuyerId) ||
      isSameUser(req.user._id, sellerId) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await Message.find({ threadKey })
      .populate('product', 'title imageUrl price status sellerName')
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: 1 });

    const markReadUpdate = isSameUser(req.user._id, resolvedBuyerId)
      ? { readByBuyer: true }
      : { readBySeller: true };

    await Message.updateMany(
      {
        threadKey,
        recipient: req.user._id,
        ...(isSameUser(req.user._id, resolvedBuyerId) ? { readByBuyer: false } : { readBySeller: false })
      },
      { $set: markReadUpdate }
    );

    const transaction = await findActiveTransaction(product._id, resolvedBuyerId, sellerId);

    res.status(200).json({
      success: true,
      thread: {
        threadKey,
        product,
        buyerId: resolvedBuyerId,
        sellerId
      },
      messages,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { productId, text, buyerId } = req.body;

    if (!productId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'productId and text are required'
      });
    }

    const product = await Product.findById(productId).populate('seller', 'name email role');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const participantIds = getParticipantIds(product, req.user, buyerId || null);

    if (!participantIds) {
      return res.status(400).json({
        success: false,
        message: 'buyerId is required for seller messages'
      });
    }

    const { buyerId: resolvedBuyerId, sellerId } = participantIds;
    const threadKey = buildThreadKey(product._id.toString(), resolvedBuyerId.toString(), sellerId.toString());
    const senderIsBuyer = isSameUser(req.user._id, resolvedBuyerId);
    const senderIsSeller = isSameUser(req.user._id, sellerId);

    if (!senderIsBuyer && !senderIsSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send this message'
      });
    }

    const recipientId = senderIsBuyer ? sellerId : resolvedBuyerId;

    const message = await Message.create({
      product: product._id,
      buyer: resolvedBuyerId,
      seller: sellerId,
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
      threadKey,
      readByBuyer: senderIsBuyer,
      readBySeller: senderIsSeller
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('product', 'title imageUrl price status sellerName')
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    const transaction = await findActiveTransaction(product._id, resolvedBuyerId, sellerId);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      thread: {
        threadKey,
        product,
        buyerId: resolvedBuyerId,
        sellerId
      },
      data: populatedMessage,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};