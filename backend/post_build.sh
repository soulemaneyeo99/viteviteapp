#!/bin/bash
# Post-build script - Runs after deployment
# This ensures database is seeded on every deployment

echo "🔄 Running post-deployment tasks..."

# Run database migrations
echo "📊 Running database migrations..."
alembic upgrade head

# Seed production data
echo "🌱 Seeding production database..."
python scripts/seed_production.py

echo "✅ Post-deployment tasks completed!"
