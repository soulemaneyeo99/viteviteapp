# 🚀 ViteviteApp - Guide de Déploiement en Production

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement de ViteviteApp en production avec toutes les données et images nécessaires.

## ✅ Prérequis

- **Serveur**: Linux (Ubuntu 20.04+ recommandé)
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Domaine**: Nom de domaine configuré (optionnel mais recommandé)
- **Certificat SSL**: Let's Encrypt ou autre (recommandé)

## 🎯 Déploiement Rapide (Docker)

### 1. Configuration de l'environnement

```bash
# Copier les templates d'environnement
cp backend/env.production.template backend/.env
cp frontend/env.production.template frontend/.env.production.local

# Éditer les fichiers avec vos valeurs
nano backend/.env
nano frontend/.env.production.local
```

### 2. Variables d'environnement importantes

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@postgres:5432/viteviteapp
SECRET_KEY=votre-clé-secrète-très-longue-et-aléatoire
GOOGLE_API_KEY=votre-clé-api-google
CORS_ORIGINS=https://votredomaine.com
```

**Frontend (.env.production.local)**:
```env
NEXT_PUBLIC_API_URL=https://api.votredomaine.com
```

### 3. Lancer le déploiement

```bash
# Rendre les scripts exécutables
chmod +x deploy.sh start_production.sh

# Déployer l'application
./deploy.sh

# Démarrer en production
./start_production.sh
```

## 🐳 Déploiement avec Docker Compose

```bash
# Construire et démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter les services
docker-compose -f docker-compose.prod.yml down
```

## 📊 Seeding Automatique des Données

Le script `scripts/seed_production.py` seed automatiquement:

- ✅ **Services** (11 services publics d'Abidjan)
- ✅ **Administrations** (Mairies, Préfectures, CNPS, Hôpitaux, etc.)
- ✅ **Transport** (Compagnies, lignes SOTRA, horaires)
- ✅ **Pharmacies** (Pharmacies avec stock de médicaments)

Le script est **idempotent** - il peut être exécuté plusieurs fois sans créer de doublons.

### Exécution manuelle du seeding

```bash
cd backend
source venv/bin/activate
python scripts/seed_production.py
```

## 🖼️ Gestion des Images

Les images sont stockées dans `frontend/public/images/`. Pour la production:

### Option 1: Images locales (incluses)
Les images sont déjà dans le dépôt et seront déployées automatiquement.

### Option 2: CDN (recommandé pour la production)
Utilisez Cloudinary, AWS S3, ou autre CDN:

```bash
# Exemple avec Cloudinary
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
```

## 🔒 Sécurité

### 1. Certificat SSL

Avec Let's Encrypt:
```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

### 2. Firewall

```bash
# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Autoriser SSH
sudo ufw allow 22/tcp

# Activer le firewall
sudo ufw enable
```

## 📈 Monitoring

### Logs

```bash
# Logs Docker
docker-compose -f docker-compose.prod.yml logs -f

# Logs backend
tail -f backend/logs/app.log

# Logs nginx
docker-compose -f docker-compose.prod.yml logs nginx
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Base de données
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

## 🔄 Mises à jour

```bash
# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🆘 Dépannage

### Problème: Base de données vide

```bash
# Exécuter le seeding manuellement
docker-compose -f docker-compose.prod.yml exec backend python scripts/seed_production.py
```

### Problème: Images manquantes

```bash
# Vérifier que le dossier existe
ls -la frontend/public/images/

# Reconstruire le frontend
docker-compose -f docker-compose.prod.yml up -d --build frontend
```

### Problème: Erreur de connexion API

```bash
# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC_API_URL

# Vérifier que le backend est accessible
curl http://backend:8000/health
```

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@viteviteapp.com
- 📚 Documentation: https://docs.viteviteapp.com
- 🐛 Issues: https://github.com/votreorg/viteviteapp/issues

## 🎉 Félicitations!

Votre application ViteviteApp est maintenant en production! 🚀

Accédez à:
- **Frontend**: https://votredomaine.com
- **API**: https://api.votredomaine.com
- **Documentation API**: https://api.votredomaine.com/docs
