#!/bin/bash

echo "🚀 Setting up BillSense..."

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Create database
echo "📊 Creating database..."
createdb billsense 2>/dev/null || echo "Database 'billsense' already exists"

# Run database schema
echo "🗄️  Setting up database schema..."
psql -d billsense -f database/schema.sql

# Build backend
echo "🏗️  Building backend..."
cd backend && npm run build && cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the development servers:"
echo "  1. Backend: cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm start"
echo ""
echo "Or run both with: npm run dev"
