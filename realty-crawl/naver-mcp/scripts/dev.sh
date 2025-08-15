#!/bin/bash

# Naver MCP Server Development Script

echo "🔧 Starting Naver MCP Server in Development Mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    echo "✅ .env file created. Please check and update the configuration."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start in development mode
echo "🌟 Starting the server in development mode..."
npm run dev
