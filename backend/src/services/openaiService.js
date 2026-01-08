const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Helper to safely parse JSON from AI response
 */
function safeJsonParse(content) {
  try {
    // Removes markdown code blocks and whitespace
    const cleanJson = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
}

/**
 * PHASE 1: Classify the receip t type
 */
async function classifyReceipt(base64Image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Is this a fuel/gas station receipt? Answer with ONLY 'FUEL' or 'GENERAL'." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 10,
    });
    const result = response.choices[0].message.content.trim().toUpperCase();
    return result.includes('FUEL') ? 'FUEL' : 'GENERAL';
  } catch (error) {
    return 'GENERAL'; 
  }
}

/**
 * PHASE 2 (A): Standard Receipt Extraction
 */
async function extractReceiptData(base64Image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extract receipt data into JSON with merchant, date, total, and items array. Return ONLY JSON." },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }]
    });

    const data = safeJsonParse(response.choices[0].message.content);
    return {
      merchant: data?.merchant || 'Unknown Merchant',
      date: data?.date || new Date(),
      total: parseFloat(data?.total) || 0,
      items: data?.items || [],
      category: data?.category || 'Other'
    };
  } catch (error) {
    return { merchant: 'Error', date: new Date(), total: 0, items: [] };
  }
}

/**
 * PHASE 2 (B): Fuel-Specific Extraction
 */
async function extractFuelData(base64Image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { 
            type: "text", 
            text: `This is a FUEL receipt. Extract ONLY JSON: 
            { "merchant": "string", "date": "YYYY-MM-DD", "total": 0.00, "fuelType": "string", "gallons": 0.00, "pricePerUnit": 0.00, "pumpNumber": "string" }` 
          },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }]
    });
    
    const raw = safeJsonParse(response.choices[0].message.content);
    if (!raw) throw new Error("Parse failed");

    return {
      merchant: raw.merchant || 'Unknown Gas Station',
      date: raw.date || new Date(),
      total: parseFloat(raw.total) || 0,
      category: 'Transportation',
      fuelDetails: {
        fuelType: raw.fuelType || 'Regular',
        gallons: parseFloat(raw.gallons) || 0,
        pricePerUnit: parseFloat(raw.pricePerUnit) || 0,
        pumpNumber: raw.pumpNumber || 'N/A'
      },
      items: [{ 
        name: `Fuel: ${raw.fuelType || 'Gas'}`, 
        price: parseFloat(raw.total) || 0, 
        quantity: parseFloat(raw.gallons) || 1 
      }]
    };
  } catch (error) {
    console.error('Fuel Extraction Error:', error);
    return { merchant: 'Error (Fuel)', date: new Date(), total: 0, items: [] };
  }
}

module.exports = { classifyReceipt, extractReceiptData, extractFuelData };