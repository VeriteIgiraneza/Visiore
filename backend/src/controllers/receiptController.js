const Receipt = require('../models/Receipt');
const { 
  classifyReceipt, 
  extractReceiptData, 
  extractFuelData 
} = require('../services/openaiService');

/**
 * Upload and process a new receipt
 * Logic: Triage (Classify) -> Branch (Extract) -> Save
 */
exports.uploadReceipt = async (req, res) => {
  try {
    const { imageBase64, manualType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // STEP 1: Determine Type (Use manual selection OR Auto-classify)
    let receiptType = manualType; 
    
    if (!receiptType) {
      console.log('🔍 No manual type provided. Auto-identifying...');
      receiptType = await classifyReceipt(base64Data);
    }
    
    console.log(`📂 Processing as: ${receiptType}`);

    // STEP 2: Extraction
    let extractedData;
    if (receiptType === 'FUEL') {
      extractedData = await extractFuelData(base64Data);
    } else {
      extractedData = await extractReceiptData(base64Data);
    }
    
    // STEP 3: Save to Database
    const receipt = new Receipt({
      ...extractedData,
      imageBase64: base64Data,
      category: extractedData.category || (receiptType === 'FUEL' ? 'Transportation' : 'Other')
    });

    await receipt.save();

    res.status(201).json({
      success: true,
      detectedType: receiptType,
      data: receipt
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process receipt' });
  }
};

/**
 * Get item history for specific items
 */
exports.getItemHistory = async (req, res) => {
  try {
    const { itemName } = req.query;
    if (!itemName) return res.status(400).json({ success: false, message: 'Item name required' });

    // Find receipts containing this item (case-insensitive)
    const receipts = await Receipt.find({ 
      "items.name": { $regex: itemName, $options: 'i' } 
    }).sort({ date: 1 });

    const history = receipts.map(r => {
      const item = r.items.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
      return {
        date: r.date,
        price: item.price,
        merchant: r.merchant,
        upc: item.upc || 'N/A'
      };
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all receipts with optional filters
 * (Kept standard from your original code)
 */
exports.getAllReceipts = async (req, res) => {
  try {
    const { category, startDate, endDate, merchant, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (merchant) query.merchant = { $regex: merchant, $options: 'i' };
    if (search) query.$text = { $search: search };

    const receipts = await Receipt.find(query)
      .sort({ date: -1 })
      .select('-imageBase64');

    res.json({ success: true, count: receipts.length, data: receipts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single receipt by ID
 */
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update receipt
 */
exports.updateReceipt = async (req, res) => {
  try {
    const allowedUpdates = ['merchant', 'date', 'total', 'tax', 'subtotal', 'items', 'category', 'paymentMethod', 'notes', 'tags'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    });

    const receipt = await Receipt.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!receipt) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete receipt
 */
exports.deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get spending statistics
 */
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const totalSpending = await Receipt.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const categoryBreakdown = await Receipt.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalSpending: totalSpending[0]?.total || 0,
        categoryBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get spending statistics
 * Fully restored to include Monthly Spending and Top Merchants
 */
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // 1. Total spending
    const totalSpending = await Receipt.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 2. Spending by category
    const categoryBreakdown = await Receipt.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // 3. Monthly spending (REQUIRED by your stats.tsx)
    const monthlySpending = await Receipt.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // 4. Top merchants (Good practice to include)
    const topMerchants = await Receipt.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$merchant', total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalSpending: totalSpending[0]?.total || 0,
        categoryBreakdown,
        monthlySpending, // This fixes the 'map' of undefined error
        topMerchants
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
};