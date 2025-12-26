const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract receipt data from image using OpenAI Vision API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Extracted receipt data
 */
async function extractReceiptData(base64Image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract ALL available information. 
Return ONLY valid JSON (no markdown, no code blocks) using this exact structure:
{
  "merchant": "store name",
  "date": "YYYY-MM-DD",
  "transactionTime": "HH:MM",
  "total": 0.00,
  "tax": 0.00,
  "subtotal": 0.00,
  "storeAddress": "full address of the store",
  "storePhone": "phone number",
  "receiptNumber": "transaction or invoice id",
  "terminalId": "terminal id",
  "cashier": "cashier name/id",
  "paymentCardLast4": "last 4 digits only",
  "AID": "EMV Application ID",
  "authCode": "authorization code",
  "items": [
    {
      "name": "item name",
      "price": 0.00,
      "quantity": 1,
      "upc": "barcode/sku number"
    }
  ],
  "category": "one of: Groceries, Dining, Transportation, Shopping, Healthcare, Entertainment, Utilities, Other",
  "paymentMethod": "one of: Cash, Credit Card, Debit Card, Mobile Payment, Other"
}

Important Instructions:
1. Use YYYY-MM-DD date format and 24-hour HH:MM for time.
2. Prices and totals must be numbers.
3. If an item has a SKU or UPC barcode number listed next to it, include it.
4. If a credit card was used, extract ONLY the last 4 digits.
5. Extract the AID (Application ID) and terminal/cashier info if visible.
6. Return ONLY the JSON object.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks
    let jsonString = content;
    if (content.startsWith('```json')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      jsonString = content.replace(/```\n?/g, '');
    }

    const extractedData = JSON.parse(jsonString);

    // Map and validate extracted data against the expanded Schema
    return {
      merchant: extractedData.merchant || 'Unknown Merchant',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      transactionTime: extractedData.transactionTime || '',
      total: parseFloat(extractedData.total) || 0,
      tax: parseFloat(extractedData.tax) || 0,
      subtotal: parseFloat(extractedData.subtotal) || parseFloat(extractedData.total) || 0,
      storeAddress: extractedData.storeAddress || '',
      storePhone: extractedData.storePhone || '',
      receiptNumber: extractedData.receiptNumber || '',
      terminalId: extractedData.terminalId || '',
      cashier: extractedData.cashier || '',
      paymentCardLast4: extractedData.paymentCardLast4 || '',
      AID: extractedData.AID || '',
      authCode: extractedData.authCode || '',
      items: (extractedData.items || []).map(item => ({
        name: item.name || 'Item',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        upc: item.upc || ''
      })),
      category: extractedData.category || 'Other',
      paymentMethod: extractedData.paymentMethod || 'Other'
    };

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    
    if (error instanceof SyntaxError) {
      console.error('Failed to parse OpenAI response as JSON');
      return {
        merchant: 'Unknown Merchant',
        date: new Date().toISOString().split('T')[0],
        total: 0,
        items: [],
        category: 'Other',
        paymentMethod: 'Other'
      };
    }
    
    throw error;
  }
}

module.exports = {
  extractReceiptData
};