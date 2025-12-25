// Test script for backend API
// Run with: node test-api.js

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';

// Test data
const testReceiptData = {
  merchant: "Test Store",
  date: "2024-12-24",
  total: 45.67,
  tax: 3.21,
  subtotal: 42.46,
  items: [
    { name: "Test Item 1", price: 20.00, quantity: 1 },
    { name: "Test Item 2", price: 22.46, quantity: 1 }
  ],
  category: "Groceries",
  paymentMethod: "Credit Card"
};

// Simple test image (1x1 white pixel)
const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

async function testHealthCheck() {
  console.log('\n📡 Testing health check...');
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testUploadReceipt() {
  console.log('\n📤 Testing receipt upload...');
  try {
    const response = await axios.post(`${API_URL}/receipts/upload`, {
      imageBase64: testImageBase64
    });
    console.log('✅ Upload successful');
    console.log('   Merchant:', response.data.data.merchant);
    console.log('   Total:', response.data.data.total);
    console.log('   ID:', response.data.data._id);
    return response.data.data._id;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetReceipts() {
  console.log('\n📋 Testing get all receipts...');
  try {
    const response = await axios.get(`${API_URL}/receipts`);
    console.log(`✅ Found ${response.data.count} receipt(s)`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get receipts failed:', error.message);
    return [];
  }
}

async function testGetReceiptById(id) {
  console.log(`\n🔍 Testing get receipt by ID: ${id}...`);
  try {
    const response = await axios.get(`${API_URL}/receipts/${id}`);
    console.log('✅ Receipt found:', response.data.data.merchant);
    return response.data.data;
  } catch (error) {
    console.error('❌ Get receipt by ID failed:', error.message);
    return null;
  }
}

async function testUpdateReceipt(id) {
  console.log(`\n✏️  Testing update receipt: ${id}...`);
  try {
    const response = await axios.put(`${API_URL}/receipts/${id}`, {
      notes: 'Updated via test script',
      tags: ['test', 'automated']
    });
    console.log('✅ Receipt updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    return false;
  }
}

async function testGetStats() {
  console.log('\n📊 Testing statistics...');
  try {
    const response = await axios.get(`${API_URL}/receipts/stats`);
    console.log('✅ Statistics retrieved');
    console.log('   Total Spending:', response.data.data.totalSpending);
    console.log('   Categories:', response.data.data.categoryBreakdown.length);
    return true;
  } catch (error) {
    console.error('❌ Get stats failed:', error.message);
    return false;
  }
}

async function testDeleteReceipt(id) {
  console.log(`\n🗑️  Testing delete receipt: ${id}...`);
  try {
    await axios.delete(`${API_URL}/receipts/${id}`);
    console.log('✅ Receipt deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Delete failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Receipt Scanner API Test Suite');
  console.log('==================================');
  
  // Test health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend is not running. Please start the server first.');
    process.exit(1);
  }

  // Test upload
  const receiptId = await testUploadReceipt();
  if (!receiptId) {
    console.log('\n❌ Upload test failed. Stopping tests.');
    process.exit(1);
  }

  // Test get all
  await testGetReceipts();

  // Test get by ID
  await testGetReceiptById(receiptId);

  // Test update
  await testUpdateReceipt(receiptId);

  // Test stats
  await testGetStats();

  // Test delete
  await testDeleteReceipt(receiptId);

  console.log('\n✅ All tests completed!');
  console.log('==================================\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});