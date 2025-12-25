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
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract ALL information. Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "merchant": "store name",
  "date": "YYYY-MM-DD",
  "total": 0.00,
  "tax": 0.00,
  "subtotal": 0.00,
  "items": [
    {
      "name": "item name",
      "price": 0.00,
      "quantity": 1
    }
  ],
  "category": "one of: Groceries, Dining, Transportation, Shopping, Healthcare, Entertainment, Utilities, Other",
  "paymentMethod": "one of: Cash, Credit Card, Debit Card, Mobile Payment, Other"
}

Important:
- Use YYYY-MM-DD date format
- All prices as numbers (not strings)
- If items are not clearly listed, provide at least one item with the total amount
- Infer category from merchant name
- Return ONLY the JSON object, nothing else`
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
      max_tokens: 1500,
      temperature: 0.2
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let jsonString = content;
    if (content.startsWith('```json')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      jsonString = content.replace(/```\n?/g, '');
    }

    const extractedData = JSON.parse(jsonString);

    // Validate and set defaults if necessary
    return {
      merchant: extractedData.merchant || 'Unknown Merchant',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      total: parseFloat(extractedData.total) || 0,
      tax: parseFloat(extractedData.tax) || 0,
      subtotal: parseFloat(extractedData.subtotal) || parseFloat(extractedData.total) || 0,
      items: extractedData.items || [{ name: 'Item', price: extractedData.total || 0, quantity: 1 }],
      category: extractedData.category || 'Other',
      paymentMethod: extractedData.paymentMethod || 'Other'
    };

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    
    // If JSON parsing fails, return default structure
    if (error instanceof SyntaxError) {
      console.error('Failed to parse OpenAI response as JSON');
      return {
        merchant: 'Unknown Merchant',
        date: new Date().toISOString().split('T')[0],
        total: 0,
        tax: 0,
        subtotal: 0,
        items: [{ name: 'Item', price: 0, quantity: 1 }],
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