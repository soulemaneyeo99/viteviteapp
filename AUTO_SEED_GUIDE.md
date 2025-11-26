# 🤖 Automatic Database Seeding Configuration

## Overview
The database seeding is now **fully automated** and will run automatically on every deployment across all platforms.

## How It Works

### 🐳 Docker (Recommended)
The `Dockerfile.prod` includes automatic seeding in the startup command:
```dockerfile
CMD alembic upgrade head && \
    python scripts/seed_production.py && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 🚂 Railway
The `railway.toml` configuration runs seeding before starting the server:
```toml
startCommand = "cd backend && alembic upgrade head && python scripts/seed_production.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4"
```

### 🎨 Render
The `render.yaml` configuration includes seeding in the start command:
```yaml
startCommand: "cd backend && alembic upgrade head && python scripts/seed_production.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4"
```

### 🟣 Heroku
The `Procfile` uses a release phase for migrations and seeding:
```
release: cd backend && alembic upgrade head && python scripts/seed_production.py
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
```

## Deployment Flow

```
1. Code Push → GitHub
2. Platform detects changes
3. Builds Docker image / Installs dependencies
4. Runs migrations (alembic upgrade head)
5. Seeds database (python scripts/seed_production.py) ✨
6. Starts server
7. ✅ Data is available!
```

## Safety Features

✅ **Idempotent**: The seed script checks for existing data before inserting
✅ **No Duplicates**: Running multiple times won't create duplicate entries
✅ **Fast**: Only inserts missing data
✅ **Logged**: Detailed progress output for debugging

## What Gets Seeded

Every deployment automatically seeds:

- **11 Services** (État Civil, Passeport, Permis, etc.)
- **11 Administrations** (Mairies, Préfecture, CNPS, Hôpitaux, etc.)
- **Transport Data** (SOTRA lines, Interurban companies)
- **Pharmacies** (With medicine stock)

## Verification

After deployment, verify the data:

```bash
# Check administrations
curl https://your-api-url.com/api/v1/administrations

# Should return 11 administrations
```

Or visit:
- https://viteviteapp.vercel.app/administrations
- https://viteviteapp.vercel.app/services
- https://viteviteapp.vercel.app/transport

## Platform-Specific Instructions

### Railway
1. Connect your GitHub repo
2. Railway will automatically detect `railway.toml`
3. Deploy - seeding happens automatically ✅

### Render
1. Create new Web Service
2. Connect GitHub repo
3. Render detects `render.yaml`
4. Deploy - seeding happens automatically ✅

### Heroku
1. Connect GitHub repo
2. Heroku detects `Procfile`
3. Deploy - seeding happens in release phase ✅

### Docker
1. Build: `docker-compose -f docker-compose.prod.yml build`
2. Start: `docker-compose -f docker-compose.prod.yml up -d`
3. Seeding happens on container start ✅

## Troubleshooting

### Data not appearing after deployment?

1. **Check logs**:
   ```bash
   # Railway
   railway logs
   
   # Render
   # Check logs in dashboard
   
   # Docker
   docker-compose -f docker-compose.prod.yml logs backend
   ```

2. **Verify database connection**:
   - Check `DATABASE_URL` environment variable
   - Ensure database is accessible

3. **Manual seed** (if needed):
   ```bash
   # SSH into your server
   cd backend
   python scripts/seed_production.py
   ```

## Files Created

| File | Purpose |
|------|---------|
| `backend/post_build.sh` | Post-build hook script |
| `backend/package.json` | NPM postinstall hook |
| `Procfile` | Heroku/Railway deployment |
| `railway.toml` | Railway configuration |
| `render.yaml` | Render configuration |

## Next Deployment

Simply push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```

The seeding will happen **automatically**! 🎉

## Notes

- ⚡ First deployment may take 30-60 seconds for seeding
- 🔄 Subsequent deployments are faster (only new data added)
- 💾 Data persists between deployments
- 🛡️ Safe to redeploy anytime
