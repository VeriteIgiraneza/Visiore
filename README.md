# Receipt Scanner App

Android app to scan receipts, extract data using OpenAI API, and store in MongoDB on TrueNAS.

## Features
- Camera capture of receipts
- AI-powered data extraction (OpenAI GPT-4 Vision)
- MongoDB storage with image and structured data
- Search and filter receipts
- Expense analytics

## Tech Stack
- **Frontend**: Expo (React Native)
- **Backend**: Node.js + Express
- **Database**: MongoDB on TrueNAS
- **AI**: OpenAI GPT-4 Vision API

## Prerequisites
- Node.js 18+
- Expo CLI
- MongoDB running on TrueNAS
- OpenAI API key

## Project Structure
```
receipt-scanner/
├── mobile/              # Expo React Native app
└── backend/             # Express API server
```

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys and MongoDB URL
npm run dev
```

### 2. Mobile App Setup
```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your backend URL
npx expo start
```

### 3. MongoDB Setup on TrueNAS
1. Install MongoDB from TrueNAS app catalog
2. Configure authentication
3. Create database: `receipt_db`
4. Create collection: `receipts`
5. Note your connection string

### 4. Environment Variables

**Backend (.env):**
```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://username:password@truenas-ip:27017/receipt_db
PORT=3000
```

**Mobile (.env):**
```
EXPO_PUBLIC_API_URL=http://your-backend-ip:3000
```

## Usage
1. Open the app on your Android device
2. Tap "Scan Receipt" 
3. Take a photo of your receipt
4. Review extracted data
5. Save to database
6. View all receipts in the list

## API Endpoints
- `POST /api/receipts/upload` - Upload and process receipt
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get single receipt
- `PUT /api/receipts/:id` - Update receipt
- `DELETE /api/receipts/:id` - Delete receipt
- `GET /api/receipts/stats` - Get spending statistics

## License
MIT