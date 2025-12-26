const mongoose = require('mongoose');

// Item subdocument schema - Updated with UPC/SKU
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
  },
  upc: {
    type: String,
    default: '' // Barcode or SKU for specific product tracking
  }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  // --- Core Details ---
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  transactionTime: {
    type: String, // HH:MM format extracted from receipt
    default: ''
  },

  // --- Financial Details ---
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

  // --- Store Information ---
  storeAddress: {
    type: String,
    default: ''
  },
  storePhone: {
    type: String,
    default: ''
  },
  terminalId: {
    type: String,
    default: ''
  },
  cashier: {
    type: String,
    default: ''
  },

  // --- Transaction Metadata ---
  receiptNumber: {
    type: String, // Invoice or Transaction ID
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Other'],
    default: 'Other'
  },
  paymentCardLast4: {
    type: String, // Last 4 digits of the card used
    default: ''
  },
  AID: {
    type: String, // EMV Application ID for card chip transactions
    default: ''
  },
  authCode: {
    type: String, // Authorization code from the bank
    default: ''
  },

  // --- Organization ---
  category: {
    type: String,
    enum: ['Groceries', 'Dining', 'Transportation', 'Shopping', 'Healthcare', 'Entertainment', 'Utilities', 'Other'],
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
    default: 'default_user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- Indexes ---
receiptSchema.index({ merchant: 'text', notes: 'text', storeAddress: 'text' });
receiptSchema.index({ date: -1 });
receiptSchema.index({ category: 1 });
receiptSchema.index({ userId: 1 });
receiptSchema.index({ receiptNumber: 1 }); // Index for searching specific receipts

// Virtual for formatted date
receiptSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

module.exports = mongoose.model('Receipt', receiptSchema);