#!/bin/bash

echo "🚀 Receipt Scanner Backend - Quick Start Script"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your:"
    echo "   - OpenAI API key"
    echo "   - MongoDB connection string"
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

# Start the server
echo "🎯 Starting backend server..."
echo ""
npm run dev