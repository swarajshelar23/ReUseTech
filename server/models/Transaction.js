const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount cannot be negative']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'reserved', 'sold', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ product: 1, buyer: 1, seller: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);