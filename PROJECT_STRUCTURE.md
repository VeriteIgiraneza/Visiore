# Project Structure Overview

## Complete File Tree

```
receipt-scanner/
│
├── README.md                          # Main project documentation
├── SETUP_GUIDE.md                     # Detailed setup instructions
│
├── backend/                           # Express.js API Server
│   ├── package.json                   # Backend dependencies
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Git ignore rules
│   ├── start.sh                       # Quick start script
│   ├── test-api.js                    # API testing script
│   │
│   └── src/
│       ├── server.js                  # Main server file (entry point)
│       │
│       ├── config/
│       │   └── database.js            # MongoDB connection setup
│       │
│       ├── models/
│       │   └── Receipt.js             # Mongoose receipt schema
│       │
│       ├── services/
│       │   └── openaiService.js       # OpenAI API integration
│       │
│       ├── controllers/
│       │   └── receiptController.js   # Business logic for receipts
│       │
│       └── routes/
│           └── receiptRoutes.js       # API endpoint definitions
│
└── mobile/                            # Expo React Native App
    ├── package.json                   # Mobile dependencies
    ├── app.json                       # Expo configuration
    ├── .env.example                   # Environment variables template
    ├── .gitignore                     # Git ignore rules
    ├── start.sh                       # Quick start script
    │
    ├── services/
    │   └── api.js                     # Backend API client
    │
    └── app/                           # Expo Router app directory
        ├── _layout.js                 # Root layout
        │
        ├── (tabs)/                    # Tab navigator screens
        │   ├── _layout.js             # Tabs layout
        │   ├── index.js               # Camera/Scan screen
        │   ├── receipts.js            # Receipts list screen
        │   └── stats.js               # Statistics screen
        │
        └── receipt/
            └── [id].js                # Receipt detail screen
```

---

## File Descriptions

### Backend Files

#### `src/server.js`
- Main entry point for the Express server
- Sets up middleware (CORS, helmet, body parser)
- Connects to MongoDB
- Defines routes and error handling
- Starts HTTP server on port 3000

#### `src/config/database.js`
- MongoDB connection logic
- Connection error handling
- Graceful shutdown handling
- Database event listeners

#### `src/models/Receipt.js`
- Mongoose schema for receipts
- Field validation
- Indexes for faster queries
- Virtual properties

#### `src/services/openaiService.js`
- OpenAI GPT-4 Vision API integration
- Image processing
- Data extraction and parsing
- Error handling with fallbacks

#### `src/controllers/receiptController.js`
- Receipt CRUD operations
- Upload and process receipt
- Filter and search receipts
- Generate statistics
- Business logic layer

#### `src/routes/receiptRoutes.js`
- Express route definitions
- Maps URLs to controller functions
- REST API endpoints

---

### Mobile App Files

#### `app/_layout.js`
- Root layout wrapper
- SafeAreaProvider setup
- Stack navigator configuration

#### `app/(tabs)/_layout.js`
- Bottom tab navigation
- Tab icons and labels
- Navigation configuration

#### `app/(tabs)/index.js` (Scan Screen)
- Camera integration
- Image picker
- Receipt capture
- Image upload
- Preview modal
- Processing status

#### `app/(tabs)/receipts.js` (List Screen)
- Display all receipts
- Pull to refresh
- Search and filter
- Delete receipts
- Navigate to details
- Summary statistics

#### `app/(tabs)/stats.js` (Statistics Screen)
- Total spending display
- Category breakdown with charts
- Monthly spending trends
- Top merchants
- Visual data representation

#### `app/receipt/[id].js` (Detail Screen)
- Full receipt display
- Receipt image viewer
- Price breakdown
- Items list
- Edit capabilities
- Delete option

#### `services/api.js`
- Axios HTTP client
- API endpoint functions
- Request/response interceptors
- Error handling
- Base URL configuration

---

## Data Flow

### 1. Upload Receipt Flow
```
User takes photo
    ↓
Mobile App (index.js)
    ↓
services/api.js → uploadReceipt()
    ↓
Backend API → POST /api/receipts/upload
    ↓
receiptController.uploadReceipt()
    ↓
openaiService.extractReceiptData()
    ↓
OpenAI GPT-4 Vision API
    ↓
Parse JSON response
    ↓
Save to MongoDB (Receipt model)
    ↓
Return receipt data
    ↓
Display success in mobile app
```

### 2. View Receipts Flow
```
User opens receipts tab
    ↓
Mobile App (receipts.js)
    ↓
services/api.js → getReceipts()
    ↓
Backend API → GET /api/receipts
    ↓
receiptController.getAllReceipts()
    ↓
Query MongoDB
    ↓
Return receipt list
    ↓
Display in FlatList
```

### 3. Statistics Flow
```
User opens stats tab
    ↓
Mobile App (stats.js)
    ↓
services/api.js → getStats()
    ↓
Backend API → GET /api/receipts/stats
    ↓
receiptController.getStats()
    ↓
MongoDB aggregation pipelines
    ↓
Calculate totals, categories, monthly data
    ↓
Return statistics
    ↓
Display charts and summaries
```

---

## API Endpoints Reference

### Receipts
- `POST /api/receipts/upload` - Upload and process receipt
- `GET /api/receipts` - Get all receipts (with filters)
- `GET /api/receipts/:id` - Get single receipt
- `PUT /api/receipts/:id` - Update receipt
- `DELETE /api/receipts/:id` - Delete receipt
- `GET /api/receipts/stats` - Get statistics

### Health
- `GET /health` - Server health check

---

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=          # Your OpenAI API key
MONGODB_URI=             # MongoDB connection string
PORT=3000                # Server port
NODE_ENV=development     # Environment (development/production)
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=     # Backend API URL
```

---

## Dependencies Overview

### Backend Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **openai**: OpenAI API client
- **cors**: CORS middleware
- **dotenv**: Environment variables
- **helmet**: Security headers
- **multer**: File upload (if needed)
- **express-validator**: Input validation

### Mobile Dependencies
- **expo**: React Native framework
- **expo-camera**: Camera access
- **expo-image-picker**: Photo gallery
- **expo-router**: File-based routing
- **axios**: HTTP client
- **@expo/vector-icons**: Icons
- **react-native-safe-area-context**: Safe area handling

---

## Key Features Implemented

✅ Camera-based receipt scanning
✅ AI-powered data extraction (OpenAI GPT-4 Vision)
✅ MongoDB storage with structured data
✅ Receipt image storage (base64)
✅ Full CRUD operations
✅ Search and filter receipts
✅ Category-based organization
✅ Spending statistics and analytics
✅ Monthly spending trends
✅ Top merchants tracking
✅ Pull to refresh
✅ Delete receipts
✅ Detail view with full information
✅ Responsive UI design

---

## Future Enhancement Ideas

- [ ] User authentication (JWT)
- [ ] Edit receipt data manually
- [ ] Export to CSV/PDF
- [ ] Budget tracking and alerts
- [ ] Receipt sharing
- [ ] Cloud backup
- [ ] Receipt templates
- [ ] Duplicate detection
- [ ] Tax category tagging
- [ ] Multi-currency support
- [ ] Offline mode with sync
- [ ] Receipt search by text
- [ ] Barcode/QR code scanning
- [ ] Merchant logo recognition
- [ ] Receipt validation
- [ ] Integration with accounting software

---

## Development Tips

1. **Backend Development:**
   - Use `npm run dev` for auto-reload with nodemon
   - Test API with `node test-api.js`
   - Monitor MongoDB with MongoDB Compass
   - Check logs for debugging

2. **Mobile Development:**
   - Use Expo Go for quick testing
   - Press `r` to reload app
   - Shake device for dev menu
   - Use React DevTools for debugging

3. **Testing:**
   - Test on real device for camera functionality
   - Test network connectivity
   - Test with different receipt types
   - Verify data extraction accuracy

4. **Debugging:**
   - Backend: Check terminal logs
   - Mobile: Check Expo console logs
   - MongoDB: Use MongoDB Compass
   - Network: Use browser DevTools
