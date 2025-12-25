#!/bin/bash

echo "📱 Receipt Scanner Mobile App - Quick Start Script"
echo "==================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your backend URL"
    echo "   - For Android Emulator: http://10.0.2.2:3000"
    echo "   - For Real Device: http://YOUR_COMPUTER_IP:3000"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

echo "📱 Starting Expo development server..."
echo ""
echo "Options:"
echo "  - Press 'a' to open on Android emulator"
echo "  - Scan QR code with Expo Go app on your phone"
echo ""
npx expo start