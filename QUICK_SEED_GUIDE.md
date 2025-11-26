# 🚀 Guide Rapide - Seeding de la Base de Données de Production

## Problème
Les administrations ne s'affichent pas sur https://viteviteapp.vercel.app/administrations car la base de données de production n'a pas été seedée.

## Solution Rapide

### Option 1: Script Automatique (Recommandé)

```bash
# Sur votre serveur de production
./seed_production_quick.sh
```

### Option 2: Commande Manuelle

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Activer l'environnement virtuel
source venv/bin/activate

# 3. Exécuter le script de seeding
python scripts/seed_production.py
```

### Option 3: Via SSH sur votre serveur

Si votre backend est hébergé sur Railway, Render, ou autre:

```bash
# Se connecter au serveur
ssh user@your-server.com

# Aller dans le dossier du projet
cd /path/to/viteviteapp

# Exécuter le seeding
./seed_production_quick.sh
```

## Vérification

Après le seeding, vérifiez que les données sont bien là:

```bash
# Tester l'API
curl https://your-backend-url.com/api/v1/administrations

# Vous devriez voir 11 administrations
```

## Données qui seront ajoutées

Le script va ajouter automatiquement:

✅ **11 Administrations**:
- Mairie de Cocody
- Mairie du Plateau  
- Mairie de Yopougon
- Mairie d'Abobo
- Préfecture d'Abidjan
- CNPS Plateau
- CHU de Cocody
- Commissariat Plateau
- Direction des Impôts
- Tribunal de Première Instance
- Office National d'État Civil

✅ **11 Services publics**
✅ **Transport (SOTRA + Interurbain)**
✅ **Pharmacies avec stock**

## Note Importante

⚠️ Le script est **idempotent** - vous pouvez l'exécuter plusieurs fois sans créer de doublons. Si les données existent déjà, elles seront ignorées.

## Dépannage

### Erreur: "Module not found"
```bash
pip install -r requirements.txt
```

### Erreur: "Database connection failed"
Vérifiez que la variable `DATABASE_URL` est correctement configurée dans votre `.env`

### Erreur: "Permission denied"
```bash
chmod +x seed_production_quick.sh
```

## Après le Seeding

1. Rafraîchissez https://viteviteapp.vercel.app/administrations
2. Vous devriez voir les 11 administrations avec leurs images
3. Les filtres et la recherche devraient fonctionner

## Support

Si le problème persiste après le seeding, vérifiez:
- [ ] Le backend est bien déployé et accessible
- [ ] La variable `NEXT_PUBLIC_API_URL` est correctement configurée sur Vercel
- [ ] Les logs du backend pour voir s'il y a des erreurs
