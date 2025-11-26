# Procfile for Heroku/Railway deployment
# This file tells the platform how to run your app

# Release phase - runs migrations and seeding before deployment
release: cd backend && alembic upgrade head && python scripts/seed_production.py

# Web process - starts the FastAPI server
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
