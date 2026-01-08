const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  upc: { type: String, default: '' }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  merchant: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  transactionTime: { type: String, default: '' },
  total: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, min: 0 },
  items: [itemSchema],
  
  // --- New Fuel Specific Section ---
  fuelDetails: {
    fuelType: { type: String, default: '' },
    gallons: { type: Number, default: 0 },
    pricePerUnit: { type: Number, default: 0 },
    pumpNumber: { type: String, default: '' }
  },

  storeAddress: { type: String, default: '' },
  storePhone: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Other'], default: 'Other' },
  category: { type: String, default: 'Other' },
  imageBase64: { type: String, required: true },
  notes: { type: String, default: '' },
  userId: { type: String, default: 'default_user' }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);