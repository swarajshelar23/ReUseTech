const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Please provide a message'],
      trim: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    threadKey: {
      type: String,
      required: true,
      index: true
    },
    readByBuyer: {
      type: Boolean,
      default: false
    },
    readBySeller: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ threadKey: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);