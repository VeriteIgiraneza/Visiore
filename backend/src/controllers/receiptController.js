const Receipt = require('../models/Receipt');
const { extractReceiptData } = require('../services/openaiService');

/**
 * Upload and process a new receipt
 * POST /api/receipts/upload
 */
exports.uploadReceipt = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image data is required' 
      });
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    console.log('📸 Processing receipt image...');
    
    // Extract data using OpenAI
    const extractedData = await extractReceiptData(base64Data);
    
    console.log('✅ Extracted data:', extractedData.merchant);

    // Create new receipt document
    const receipt = new Receipt({
      ...extractedData,
      imageBase64: base64Data
    });

    await receipt.save();

    res.status(201).json({
      success: true,
      message: 'Receipt processed and saved successfully',
      data: receipt
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process receipt',
      error: error.message
    });
  }
};

/**
 * Get all receipts with optional filters
 * GET /api/receipts?category=Groceries&startDate=2024-01-01&endDate=2024-12-31
 */
exports.getAllReceipts = async (req, res) => {
  try {
    const { category, startDate, endDate, merchant, search } = req.query;
    
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by merchant
    if (merchant) {
      query.merchant = { $regex: merchant, $options: 'i' };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const receipts = await Receipt.find(query)
      .sort({ date: -1 })
      .select('-imageBase64'); // Exclude image from list view for performance

    res.json({
      success: true,
      count: receipts.length,
      data: receipts
    });

  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch receipts',
      error: error.message
    });
  }
};

/**
 * Get single receipt by ID
 * GET /api/receipts/:id
 */
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch receipt',
      error: error.message
    });
  }
};

/**
 * Update receipt
 * PUT /api/receipts/:id
 */
exports.updateReceipt = async (req, res) => {
  try {
    const allowedUpdates = ['merchant', 'date', 'total', 'tax', 'subtotal', 'items', 'category', 'paymentMethod', 'notes', 'tags'];
    const updates = {};

    // Only allow specified fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt updated successfully',
      data: receipt
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update receipt',
      error: error.message
    });
  }
};

/**
 * Delete receipt
 * DELETE /api/receipts/:id
 */
exports.deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete receipt',
      error: error.message
    });
  }
};

/**
 * Get spending statistics
 * GET /api/receipts/stats
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

    // Total spending
    const totalSpending = await Receipt.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Spending by category
    const categoryBreakdown = await Receipt.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$total' },
          count: { $sum: 1 }
        } 
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly spendings
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

    // Top merchants
    const topMerchants = await Receipt.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$merchant',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalSpending: totalSpending[0]?.total || 0,
        categoryBreakdown,
        monthlySpending,
        topMerchants
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};