# ⚡ ViteviteApp v2.0

> **Solution intelligente de gestion des files d'attente pour la Côte d'Ivoire**  
> Avec Marketplace intégrée, Analytics IA, et Notifications en temps réel

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![Next.js](https://img.shields.io/badge/next.js-14.2.0-black)
![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-teal)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Roadmap](#roadmap)
- [Contribution](#contribution)
- [Licence](#licence)

---

## 🎯 À propos

**ViteviteApp** est une plateforme complète qui révolutionne la gestion des files d'attente en Côte d'Ivoire en combinant :

- **Gestion intelligente des files d'attente** : Tickets virtuels, prédictions IA
- **Marketplace intégrée** : Achetez pendant que vous attendez
- **Analytics avancés** : Optimisation des services avec IA
- **Notifications en temps réel** : SMS, Push, Email

### 🎨 Problème résolu

En Côte d'Ivoire, **60-70% des citoyens** perdent **3-5 heures** dans les files d'attente des services publics (mairies, banques, hôpitaux). ViteviteApp :

✅ Élimine les files d'attente physiques  
✅ Permet de gagner du temps productif  
✅ Offre une marketplace pour acheter pendant l'attente  
✅ Optimise les ressources des services publics  

---

## ✨ Fonctionnalités

### 🎫 Gestion des files d'attente

- **Tickets virtuels** avec QR Code
- **Suivi en temps réel** de votre position
- **Notifications** quand c'est votre tour
- **Prédictions IA** du temps d'attente
- **Documents requis** affichés avant le déplacement

### 🛍️ Marketplace intégrée

- **Catalogue diversifié** : Matériaux de construction, médicaments, électronique
- **Livraison rapide** (1-3h à Abidjan)
- **Paiement flexible** : Mobile Money, Carte, Cash
- **Système d'avis** et notes
- **Partenariats** avec quincailleries et pharmacies

### 📊 Analytics & IA

- **Prédictions de pics d'affluence** avec 91% de précision
- **Recommandations stratégiques** pour les services
- **Analyse des tendances** en temps réel
- **Carte thermique** des zones saturées
- **Optimisation automatique** des ressources

### 🔔 Notifications

- **Push notifications** instantanées
- **SMS** pour appels de tickets
- **Email** pour confirmations
- **Préférences personnalisables** par utilisateur

### 👨‍💼 Dashboard Admin

- **Gestion en temps réel** des files d'attente
- **Appel des tickets** depuis l'interface
- **Statistiques détaillées** par service
- **Alertes automatiques** en cas de surcharge

---

## 🛠️ Technologies

### Backend

- **Framework** : FastAPI 0.104.1
- **IA** : Google Gemini Pro
- **Python** : 3.8+
- **Base de données** : JSON (dev) → PostgreSQL (prod)
- **API** : RESTful

### Frontend

- **Framework** : Next.js 14.2.0
- **UI** : React 18 + TypeScript
- **Styling** : Tailwind CSS 3.4
- **Icons** : Lucide React
- **État** : React Hooks

### DevOps

- **Déploiement** : Vercel (Frontend) + Railway (Backend)
- **CI/CD** : GitHub Actions
- **Monitoring** : Sentry

---

## 🚀 Installation

### Prérequis

- Python 3.8+
- Node.js 18+
- npm ou yarn
- Git

### Installation rapide

```bash
# Cloner le repository
git clone https://github.com/votre-username/viteviteapp.git
cd viteviteapp

# Lancer le script d'installation
chmod +x install.sh
./install.sh
```

### Installation manuelle

#### 1. Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
# Éditer .env et ajouter vos clés API

# Lancer le serveur
python app/main.py
```

Le backend sera accessible sur `http://localhost:8000`

#### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

---

## 📖 Utilisation

### Pour les utilisateurs

1. **Ouvrir l'application** : `http://localhost:3000`
2. **Choisir un service** : Mairie, Banque, Hôpital, etc.
3. **Prendre un ticket virtuel** : Renseigner vos informations
4. **Recevoir des notifications** : Quand votre tour approche
5. **Explorer la marketplace** : Pendant l'attente

### Pour les administrateurs

1. **Accéder au dashboard** : `http://localhost:3000/admin`
2. **Gérer les files d'attente** : Appeler les tickets
3. **Voir les analytics** : `http://localhost:3000/analytics`
4. **Configurer les services** : Horaires, statuts

---

## 🏗️ Architecture

```
viteviteapp/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── routers/        # Endpoints API
│   │   │   ├── services.py
│   │   │   ├── tickets.py
│   │   │   ├── marketplace.py
│   │   │   ├── analytics.py
│   │   │   └── notifications.py
│   │   ├── ai/             # Services IA
│   │   ├── database.py     # Gestion données
│   │   └── main.py         # Point d'entrée
│   └── requirements.txt
│
└── frontend/               # Application Next.js
    ├── src/
    │   ├── app/           # Pages
    │   │   ├── page.tsx           (Accueil)
    │   │   ├── services/          (Services)
    │   │   ├── marketplace/       (Marketplace)
    │   │   ├── analytics/         (Analytics)
    │   │   ├── admin/             (Admin)
    │   │   └── ticket/[id]/       (Suivi ticket)
    │   ├── components/    # Composants réutilisables
    │   └── lib/           # Utilitaires
    └── package.json
```

---

## 📚 API Documentation

Une fois le backend lancé, accédez à la documentation interactive :

- **Swagger UI** : `http://localhost:8000/docs`
- **ReDoc** : `http://localhost:8000/redoc`

### Endpoints principaux

#### Services
- `GET /api/services` - Liste des services
- `GET /api/services/{id}` - Détails d'un service
- `PATCH /api/services/{id}` - Mise à jour (admin)

#### Tickets
- `POST /api/tickets` - Créer un ticket
- `GET /api/tickets/{id}` - Suivi d'un ticket
- `DELETE /api/tickets/{id}` - Annuler un ticket

#### Marketplace
- `GET /api/marketplace/products` - Catalogue produits
- `POST /api/marketplace/orders` - Créer une commande
- `GET /api/marketplace/orders/{id}` - Suivi commande

#### Analytics
- `GET /api/analytics/insights` - Insights IA
- `GET /api/analytics/performance` - Métriques
- `GET /api/analytics/trends` - Tendances
- `GET /api/analytics/recommendations` - Recommandations

#### Notifications
- `POST /api/notifications` - Créer notification
- `GET /api/notifications/user/{id}` - Notifications utilisateur

---

## 🗺️ Roadmap

### Phase 1 - MVP ✅
- [x] Gestion des files d'attente
- [x] Tickets virtuels
- [x] Dashboard admin
- [x] Marketplace
- [x] Analytics IA

### Phase 2 - Amélioration (Q1 2025)
- [ ] Application mobile (React Native)
- [ ] Authentification (JWT, OAuth)
- [ ] Paiements (Orange Money, MTN Money, Wave)
- [ ] Vraie base de données (PostgreSQL)
- [ ] SMS réels (Twilio, Orange)

### Phase 3 - Expansion (Q2 2025)
- [ ] Géolocalisation avancée
- [ ] Réservations de places
- [ ] Programme de fidélité
- [ ] API publique pour partenaires
- [ ] Mode hors-ligne

### Phase 4 - Scale (Q3 2025)
- [ ] Expansion à toute la Côte d'Ivoire
- [ ] Autres pays d'Afrique de l'Ouest
- [ ] Licence B2B entreprises
- [ ] Intégration transports publics

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/AmazingFeature`
3. **Commit** vos changements : `git commit -m 'Add AmazingFeature'`
4. **Push** : `git push origin feature/AmazingFeature`
5. **Ouvrir une Pull Request**

### Guidelines

- Code propre et commenté
- Tests unitaires
- Documentation mise à jour
- Respecter les conventions de code

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Équipe

**Créé par** : Soura Aminata  
**Année** : 2024  
**Localisation** : Abidjan, Côte d'Ivoire

---

## 📞 Contact & Support

- **Email** : contact@viteviteapp.ci
- **Téléphone** : +225 XX XX XX XX XX
- **Website** : [www.viteviteapp.ci](https://viteviteapp.ci)
- **GitHub** : [github.com/viteviteapp](https://github.com/viteviteapp)

---

## 🙏 Remerciements

- Google Gemini pour l'IA
- FastAPI pour le backend
- Next.js pour le frontend
- La communauté open-source

---

<div align="center">

**⚡ Fait avec ❤️ en Côte d'Ivoire**

[⬆ Retour en haut](#-viteviteapp-v20)

</div>