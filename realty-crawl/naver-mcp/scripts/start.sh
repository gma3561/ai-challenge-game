#!/bin/bash

# Naver MCP Server Start Script

echo "🚀 Starting Naver MCP Server..."

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

# Build the project
echo "🔨 Building the project..."
npm run build

# Start the server
echo "🌟 Starting the server..."
npm start
