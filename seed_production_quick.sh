#!/bin/bash

# ========================================
# Quick Production Seed Script
# Run this on your production server
# ========================================

echo "🌱 Seeding Production Database..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/scripts/seed_production.py" ]; then
    echo "❌ Error: Please run this from the project root directory"
    exit 1
fi

cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the seed script
python scripts/seed_production.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production database seeded successfully!"
    echo ""
    echo "Your administrations should now be visible at:"
    echo "https://viteviteapp.vercel.app/administrations"
else
    echo ""
    echo "❌ Seeding failed. Check the error messages above."
    exit 1
fi
