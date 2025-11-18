# 🚀 SETUP BACKEND - 5 MINUTES

## 1️⃣ Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2️⃣ Configuration

```bash
# Copier .env
cp .env.example .env

# Éditer .env
nano .env  # ou votre éditeur
```

**Minimum requis dans .env:**
```bash
SECRET_KEY=votre_clé_générée  # python -c "import secrets; print(secrets.token_urlsafe(32))"
DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST:5432/DB
GEMINI_API_KEY=votre_clé_gemini  # https://makersuite.google.com/app/apikey
```

## 3️⃣ Database

### Option A: Supabase (Recommandé - 5 min)
1. Aller sur https://supabase.com
2. Créer un projet (gratuit)
3. Database → Settings → Connection string
4. Copier dans .env (remplacer `postgresql://` par `postgresql+asyncpg://`)

### Option B: PostgreSQL Local
```bash
createdb vitevite_db
```

## 4️⃣ Migrations

```bash
# Initialiser Alembic
alembic init alembic

# Créer première migration
alembic revision --autogenerate -m "Initial migration"

# Appliquer
alembic upgrade head
```

## 5️⃣ Lancer

```bash
python -m app.main
# ou
uvicorn app.main:app --reload

# API disponible sur http://localhost:8000
# Docs: http://localhost:8000/docs
```

## ✅ Vérification

```bash
curl http://localhost:8000/
curl http://localhost:8000/api/v1/health
```

## 🎯 Tests Rapides

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Services
curl http://localhost:8000/api/v1/services
```

## 🐛 Troubleshooting

**Erreur DB:**
- Vérifier DATABASE_URL dans .env
- Vérifier que PostgreSQL est démarré

**Erreur Alembic:**
```bash
# Reset migrations
rm -rf alembic/versions/*
alembic revision --autogenerate -m "Initial"
alembic upgrade head
```

**Port déjà utilisé:**
```bash
# Changer PORT dans .env
PORT=8001
```