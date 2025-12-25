const mongoose = require('mongoose');
// Item subdocument schema

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    min: 0
  },
  items: [itemSchema],
  category: {
    type: String,
    enum: ['Groceries', 'Dining', 'Transportation', 'Shopping', 'Healthcare', 'Entertainment', 'Utilities', 'Other'],
    default: 'Other'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Other'],
    default: 'Other'
  },
  imageBase64: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    default: 'default_user' // For future multi-user support
  }
}, {
  timestamps: true
});

// Indexes for faster queries
receiptSchema.index({ merchant: 'text', notes: 'text' });
receiptSchema.index({ date: -1 });
receiptSchema.index({ category: 1 });
receiptSchema.index({ userId: 1 });

// Virtual for formatted date
receiptSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

module.exports = mongoose.model('Receipt', receiptSchema);