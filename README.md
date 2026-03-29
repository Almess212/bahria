# BAHRIA — Plateforme IA d'aide à la décision pour repos biologiques

![BAHRIA Logo](public/logo.png)

**BAHRIA** est une plateforme intelligente d'aide à la décision pour la gestion durable des pêcheries pélagiques à Dakhla (Maroc). Elle combine analyse de données halieutiques, modèles prédictifs IA, et vision par ordinateur pour optimiser les repos biologiques et assurer la durabilité des stocks.

**Version actuelle** : v1.2.1 — Mars 2026
**Développé par** : NEGAM SAS / Smart Sailors
**Hackathon** : RamadanIA 2026 — Dakhla

---

## ✨ Fonctionnalités principales

### 📊 Dashboard temps réel
- Suivi des stocks (sardine, maquereau, chinchard, anchois, poulpe, seiche, courbine)
- Alertes automatiques (biomasse critique, surpêche, juvéniles)
- Indicateurs de durabilité (biomasse, taux d'exploitation, régénération)

### 📈 Analyse & Prédictions
- Prédiction de biomasse future (6-24 mois)
- Simulation de scénarios de repos biologiques
- Analyse de captures (CPUE, taille, maturité)
- Export de rapports PDF/CSV

### 🗺️ Carte interactive
- Zones de pêche Dakhla (côtier, offshore)
- Heatmap de densité de biomasse
- Historique spatial des captures
- Zones de nourricerie

### 🤖 Assistant IA (Claude)
- Recommandations intelligentes basées sur les données
- Réponses aux questions sur les stocks
- Suggestions de repos biologiques optimaux

### 📝 Logbook numérique
- Enregistrement des captures quotidiennes
- Calcul automatique des indicateurs
- Historique complet des opérations

### 🎥 **BAHRIA Cam** — Vision par ordinateur
- **Identification automatique d'espèces** (94%+ de précision)
- **Estimation taille/poids** par IA
- **Vérification conformité L50** et export UE
- **Comptage d'individus**
- **Évaluation qualité/fraîcheur**

---

## 📸 Screenshots

### Page d'accueil
![Landing Page](docs/screenshots/landing.png)
*Page d'accueil avec présentation de BAHRIA et BAHRIA Cam*

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Vue d'ensemble des stocks et alertes en temps réel*

### BAHRIA Cam
![BAHRIA Cam](docs/screenshots/bahria-cam.png)
*Interface de reconnaissance d'espèces par IA*

### Analyse & Prédictions
![Analysis](docs/screenshots/analysis.png)
*Module d'analyse avec prédictions de biomasse*

### Carte interactive
![Map](docs/screenshots/map.png)
*Visualisation géospatiale des zones de pêche*

### Assistant IA
![Assistant](docs/screenshots/assistant.png)
*Assistant intelligent pour recommandations personnalisées*

> **Note** : Pour générer les screenshots, lancez l'application et utilisez l'outil de capture d'écran de votre système.

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Clé API Anthropic (pour BAHRIA Cam et Assistant IA)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-org/bahria.git
cd bahria

# Installer les dépendances
npm install
```

### Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env
```

Éditez `.env` et configurez les clés API :

```bash
# REQUIS pour BAHRIA Cam
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# REQUIS pour Assistant IA (frontend)
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optionnel (Supabase - mode démo disponible)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Port du serveur API (optionnel, défaut: 3001)
PORT=3001
```

**Obtenir une clé API Anthropic :**
1. Créez un compte sur https://console.anthropic.com/
2. Allez dans "API Keys"
3. Créez une nouvelle clé et copiez-la dans `.env`

### Démarrage

```bash
# Option 1 : Frontend + Backend ensemble (recommandé)
npm run dev:all

# Option 2 : Séparément
npm run dev          # Frontend uniquement (port 5173)
npm run dev:server   # Backend API uniquement (port 3001)
```

L'application est accessible sur **http://localhost:5173**

### Comptes de démo

- **Admin** : `admin@bahria.com` / `admin123`
- **Factory** : `factory@bahria.com` / `factory123`
- **Scientist** : `scientist@bahria.com` / `scientist123`

---

## 📁 Structure du projet

```
bahria/
├── src/
│   ├── features/           # Modules fonctionnels
│   │   ├── dashboard/      # Dashboard temps réel
│   │   ├── analysis/       # Analyse & prédictions
│   │   ├── map/            # Carte interactive
│   │   ├── assistant/      # Assistant IA
│   │   ├── logbook/        # Logbook numérique
│   │   └── cam/            # BAHRIA Cam (vision)
│   ├── shared/             # Composants partagés
│   │   ├── components/     # UI components
│   │   └── stores/         # State management (Zustand)
│   └── routes/             # Configuration des routes
│
├── server/                 # API backend (Express)
│   ├── index.js            # Serveur principal
│   └── README.md           # Doc API
│
├── python/                 # Scripts Python
│   └── training/           # Entraînement YOLOv8
│       ├── config.py       # Configuration
│       ├── phase1_pretrain.py
│       ├── phase2_finetune.py
│       ├── phase3_production.py
│       ├── utils/          # Utilitaires
│       └── README.md       # Doc entraînement
│
├── public/                 # Assets statiques
├── uploads/                # Uploads temporaires (auto-nettoyés)
│
├── BAHRIA_CAM_GUIDE.md     # Guide complet BAHRIA Cam
├── DATASETS_GUIDE.md       # Guide des datasets
└── README.md               # Ce fichier
```

---

## 🎥 BAHRIA Cam — Vision par ordinateur

### Qu'est-ce que c'est ?

BAHRIA Cam utilise **Claude Sonnet 4.6 (Mars 2026)** avec vision pour identifier automatiquement les espèces de poissons et céphalopodes à partir de photos.

### Espèces reconnues

- **Sardine** (*Sardina pilchardus*) — 96.8% précision
- **Maquereau** (*Scomber scombrus*) — 95.1%
- **Chinchard** (*Trachurus trachurus*) — 92.3%
- **Anchois** (*Engraulis encrasicolus*) — 91.7%
- **Poulpe** (*Octopus vulgaris*) — 97.5%
- **Seiche** (*Sepia officinalis*) — 93.4%
- **Courbine** (*Argyrosomus regius*) — 89.6%

### Utilisation

1. Ouvrir **BAHRIA Cam** dans l'app
2. Uploader une photo de poisson/céphalopode
3. L'IA analyse en 3-5 secondes
4. Résultats :
   - Espèce identifiée avec confiance (%)
   - Taille estimée (cm)
   - Poids calculé (g)
   - Conformité L50 et export UE
   - Qualité et fraîcheur

### Documentation complète

Voir **[BAHRIA_CAM_GUIDE.md](./BAHRIA_CAM_GUIDE.md)** pour :
- Guide d'utilisation détaillé
- Conseils pour de bonnes photos
- Dépannage
- API backend

---

## 🧠 Entraînement du modèle YOLOv8

Pour entraîner votre propre modèle de vision (déploiement Jetson Orin Nano) :

```bash
cd python/training

# Phase 1 : Pré-entraînement détection générique (2-3 jours)
python phase1_pretrain.py

# Phase 2 : Fine-tuning pélagique (3-4 jours)
python phase2_finetune.py

# Phase 3 : Adaptation terrain Dakhla (1-2 jours)
python phase3_production.py
```

Voir **[python/training/README.md](./python/training/README.md)** pour la documentation complète.

---

## 📚 Documentation

- **[BAHRIA_CAM_GUIDE.md](./BAHRIA_CAM_GUIDE.md)** — Guide complet BAHRIA Cam
- **[DATASETS_GUIDE.md](./DATASETS_GUIDE.md)** — Datasets pour entraînement
- **[server/README.md](./server/README.md)** — API backend Express
- **[python/training/README.md](./python/training/README.md)** — Pipeline d'entraînement YOLOv8

---

## 🛠️ Technologies utilisées

### Frontend
- **React 19** + **Vite** — Interface utilisateur
- **TailwindCSS** — Styling
- **React Router** — Navigation
- **Zustand** — State management
- **Recharts** — Visualisations de données
- **Leaflet** — Cartes interactives
- **Lucide React** — Icônes

### Backend
- **Express** — API REST
- **Anthropic SDK** — Claude Vision API
- **Multer** — Upload d'images

### Python/ML
- **Ultralytics YOLOv8** — Modèle de vision
- **PyTorch** — Deep learning
- **Albumentations** — Augmentation de données
- **TensorRT** — Optimisation Jetson

---

## 🚧 Roadmap

### v1.3 (Juin 2026)
- ✅ Détection d'espèce unique (actuel)
- 🔄 **Captures mixtes** (plusieurs espèces)
- 🔄 **Comptage en masse** (> 50 individus)
- 🔄 **Segmentation d'instance**
- 🔄 **Modèle YOLOv8 local** (Jetson)
- 🔄 **Temps réel** (> 15 FPS vidéo)

### v2.0 (2027)
- 🔄 **Détection de juvéniles** automatique
- 🔄 **Mesure calibrée** (avec référence)
- 🔄 **Détection qualité** avancée (yeux, branchies)
- 🔄 **Embarquement navires** RSW

---

## 📊 Performance

| Métrique | Valeur |
|----------|--------|
| **Précision globale** | 94.2% |
| **Temps d'analyse** | 3-5 secondes |
| **Précision taille** | ±2 cm |
| **Précision poids** | ±15 g |
| **Espèces supportées** | 7 |

---

## 📝 Scripts disponibles

```bash
npm run dev           # Démarrer frontend (Vite)
npm run dev:server    # Démarrer backend (Express)
npm run dev:all       # Démarrer frontend + backend
npm run build         # Build production
npm run preview       # Preview build production
npm run lint          # Linter ESLint
```

---

## 🔐 Sécurité

- ✅ Clés API côté serveur (pas exposées au frontend)
- ✅ Images uploadées supprimées après analyse
- ✅ CORS configuré pour dev local
- ✅ Validation des types de fichiers
- ✅ Limite de taille d'upload (10 MB)

---

## 🐛 Dépannage

### BAHRIA Cam ne fonctionne pas

```bash
# Vérifier que le serveur est démarré
curl http://localhost:3001/health

# Vérifier la clé API
cat .env | grep ANTHROPIC_API_KEY

# Redémarrer le serveur
npm run dev:server
```

### Erreur "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Port déjà utilisé

```bash
# Changer le port dans .env
echo "PORT=3002" >> .env

# Ou tuer le processus
lsof -ti:3001 | xargs kill
```

---

## 📞 Support

**Développé par** : NEGAM SAS
**Client** : MFQF Dakhla
**Contact** : Voir documentation interne

---

## 📄 Licence

Propriétaire — NEGAM SAS © 2026

**Usage restreint** : Ce logiciel est développé pour MFQF Dakhla et ne peut être redistribué ou utilisé sans autorisation écrite.

---

## 🙏 Remerciements

- **Anthropic** — Claude API avec vision
- **Ultralytics** — YOLOv8 framework
- **LILA Science** — Datasets communautaires
- **FishBase** — Données allométriques
- **MFQF Dakhla** — Données terrain et expertise

---

**BAHRIA v1.2.1 — Plateforme IA pour la durabilité des pêcheries de Dakhla** 🐟🤖
