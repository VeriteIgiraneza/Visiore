const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

// Receipt routess
router.post('/upload', receiptController.uploadReceipt);
router.get('/', receiptController.getAllReceipts);
router.get('/stats', receiptController.getStats);
router.get('/item-history', receiptController.getItemHistory);
router.get('/:id', receiptController.getReceiptById);
router.put('/:id', receiptController.updateReceipt);
router.delete('/:id', receiptController.deleteReceipt);

module.exports = router;