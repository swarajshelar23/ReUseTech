const mongoose = require('mongoose');

/**
 * Product Schema
 * Defines the structure for product listings in the marketplace
 * Links to the user who created the product
 */
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Cameras',
      'Audio',
      'Gaming',
      'Wearables',
      'Accessories',
      'Other'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Please select product condition'],
    enum: [
      'Like New',
      'Excellent',
      'Good',
      'Fair',
      'Poor'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=No+Image'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Index for faster search queries
 */
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
