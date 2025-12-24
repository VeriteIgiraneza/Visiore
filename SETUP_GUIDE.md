# Complete Setup Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] MongoDB running on TrueNAS
- [ ] OpenAI API key
- [ ] Android device or emulator
- [ ] Expo Go app (for testing)

---

## Part 1: MongoDB Setup on TrueNAS

### 1.1 Install MongoDB
1. Log into TrueNAS web interface
2. Go to **Apps** → **Available Applications**
3. Search for "MongoDB"
4. Click **Install**
5. Configure:
   - **Application Name**: mongodb
   - **Root Password**: Choose a strong password
   - **Port**: 27017 (default)
   - **Storage**: Allocate at least 10GB
6. Click **Install** and wait for deployment

### 1.2 Configure MongoDB
After installation, you need to:
1. Get your TrueNAS IP address (e.g., `192.168.1.100`)
2. Note the MongoDB port (usually `27017`)
3. Create database and user:

**Option A: Using MongoDB Shell (recommended)**
```bash
# SSH into TrueNAS or use Shell from web UI
kubectl exec -it <mongodb-pod-name> -- mongo

# In mongo shell:
use receipt_db
db.createUser({
  user: "receipt_user",
  pwd: "your_password_here",
  roles: [{ role: "readWrite", db: "receipt_db" }]
})
```

**Option B: Using MongoDB Compass**
1. Download MongoDB Compass
2. Connect to `mongodb://192.168.1.100:27017`
3. Create database: `receipt_db`
4. Create user with read/write permissions

### 1.3 Test Connection
Your connection string will look like:
```
mongodb://receipt_user:your_password@192.168.1.100:27017/receipt_db
```

---

## Part 2: Backend Setup

### 2.1 Install Dependencies
```bash
cd receipt-scanner/backend
npm install
```

### 2.2 Configure Environment
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Edit `.env` with your values:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
MONGODB_URI=mongodb://receipt_user:your_password@192.168.1.100:27017/receipt_db
PORT=3000
NODE_ENV=development
```

### 2.3 Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected: 192.168.1.100
📊 Database: receipt_db
🚀 Server running on port 3000
📡 API: http://localhost:3000
```

### 2.4 Test Backend
Open browser or use curl:
```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"OK","timestamp":"...","uptime":...}
```

---

## Part 3: Mobile App Setup

### 3.1 Install Expo CLI (if not already installed)
```bash
npm install -g expo-cli
```

### 3.2 Install Dependencies
```bash
cd receipt-scanner/mobile
npm install
```

### 3.3 Configure Environment

**For Android Emulator:**
```bash
cp .env.example .env
nano .env
```

Content:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

**For Real Android Device:**
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `192.168.1.50`

2. Edit `.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
```

**Important:** Your phone and computer must be on the same WiFi network!

### 3.4 Start Expo Development Server
```bash
npx expo start
```

You'll see a QR code in the terminal.

---

## Part 4: Running on Android

### Option A: Using Expo Go (Easiest)

1. **Install Expo Go** on your Android device from Play Store
2. **Scan QR code** from terminal with Expo Go app
3. App will load automatically

### Option B: Using Android Emulator

1. **Install Android Studio**
2. **Set up emulator** (AVD Manager)
3. **Start emulator**
4. In terminal with QR code, press `a` to open on Android

### Option C: Build APK (Production)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview

# Or build locally
npx expo run:android
```

---

## Part 5: Testing the App

### 5.1 Backend Health Check
```bash
curl http://your-computer-ip:3000/health
```

### 5.2 Test Receipt Upload
1. Open app on phone
2. Tap "Take Photo"
3. Point at a receipt and capture
4. Review image and tap "Process Receipt"
5. Wait for AI extraction (10-30 seconds)
6. Check if data appears correctly

### 5.3 Verify in MongoDB
```bash
# In mongo shell
use receipt_db
db.receipts.find().pretty()
```

---

## Troubleshooting

### Backend won't start
**Error: MongoDB connection failed**
- Check MongoDB is running on TrueNAS
- Verify connection string in `.env`
- Test connection: `telnet 192.168.1.100 27017`
- Check firewall rules on TrueNAS

**Error: OpenAI API key invalid**
- Verify API key at https://platform.openai.com/api-keys
- Ensure you have credits in your OpenAI account
- Check for extra spaces in `.env` file

### Mobile app won't connect to backend
**Error: Network request failed**
- Verify backend is running: `curl http://localhost:3000/health`
- Check IP address in mobile `.env` is correct
- Ensure phone and computer are on same WiFi
- Try disabling computer firewall temporarily
- For Windows: Allow Node.js through Windows Firewall

**Error: Unable to resolve host**
- Check `EXPO_PUBLIC_API_URL` in mobile `.env`
- Use `http://` not `https://`
- Don't use `localhost` - use actual IP address

### Camera not working
- Grant camera permissions in Android settings
- Restart Expo Go app
- Check `app.json` has camera plugin enabled

### OpenAI extraction failing
**Error: Model not found**
- Update to latest OpenAI package: `npm install openai@latest`
- Use model: `gpt-4-vision-preview` or `gpt-4o`

**Error: Rate limit exceeded**
- Wait a few minutes
- Check your OpenAI usage limits
- Upgrade OpenAI plan if needed

### Images not displaying
- Check base64 data is being saved to MongoDB
- Verify image size isn't too large (>5MB)
- Check MongoDB document size limit

---

## Network Configuration Guide

### Finding Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.50`)

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Linux:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### Firewall Configuration

**Windows:**
1. Open Windows Firewall
2. "Allow an app through firewall"
3. Add Node.js
4. Allow both Private and Public networks

**Mac:**
```bash
# Allow incoming connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
```

**Linux (ufw):**
```bash
sudo ufw allow 3000/tcp
```

---

## Production Deployment Tips

### 1. Secure MongoDB
- Enable authentication (already done in setup)
- Use SSL/TLS connections
- Don't expose port 27017 to internet
- Use VPN (Tailscale/WireGuard) for remote access

### 2. Secure Backend API
- Add authentication (JWT tokens)
- Use HTTPS (Let's Encrypt)
- Add rate limiting
- Validate all inputs
- Use environment-specific configs

### 3. Build Production APK
```bash
# Configure app.json with your details
# Update package/bundleIdentifier

# Build
eas build --platform android --profile production

# Download APK from Expo dashboard
```

### 4. Environment Variables Security
- Never commit `.env` files
- Use different API keys for dev/prod
- Rotate keys periodically

---

## Useful Commands Reference

**Backend:**
```bash
npm run dev          # Start development server
npm start            # Start production server
npm install          # Install dependencies
```

**Mobile:**
```bash
npx expo start                  # Start development server
npx expo start --clear          # Clear cache and start
npx expo start --android        # Start and open Android
npx expo install <package>      # Install Expo package
```

**MongoDB:**
```bash
# Show databases
show dbs

# Use database
use receipt_db

# Show collections
show collections

# Count receipts
db.receipts.count()

# Find all receipts
db.receipts.find().pretty()

# Delete all receipts (be careful!)
db.receipts.deleteMany({})
```

---

## Next Steps

1. ✅ Test basic functionality
2. Add user authentication
3. Implement edit receipt feature
4. Add expense export (CSV/PDF)
5. Cloud backup option
6. Multi-user support
7. Receipt sharing
8. Budget tracking
9. Tax category tagging
10. Receipt search by image similarity

---

## Getting Help

- **Expo Docs**: https://docs.expo.dev
- **MongoDB Docs**: https://docs.mongodb.com
- **OpenAI API Docs**: https://platform.openai.com/docs
- **React Native Docs**: https://reactnative.dev

For issues, check:
1. Backend console logs
2. Mobile app logs in Expo console
3. MongoDB logs in TrueNAS
4. Network connectivity
