# BAHRIA Cam — API d'analyse d'image

Serveur Express avec analyse d'image par IA (Claude Vision) pour BAHRIA Cam.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Puis éditer .env et ajouter votre ANTHROPIC_API_KEY
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```bash
# Clé API Anthropic (OBLIGATOIRE)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Port du serveur (optionnel, défaut: 3001)
PORT=3001
```

**Obtenir une clé API Anthropic :**
1. Créez un compte sur https://console.anthropic.com/
2. Allez dans "API Keys"
3. Créez une nouvelle clé et copiez-la dans `.env`

## 🏃 Démarrage

### Option 1 : Serveur seul
```bash
npm run dev:server
```

### Option 2 : Frontend + Backend ensemble
```bash
npm run dev:all
```

Le serveur démarre sur `http://localhost:3001`

## 📡 API Endpoints

### `POST /api/analyze-image`

Analyse une image de poisson/céphalopode avec Claude Vision.

**Request :**
```bash
curl -X POST http://localhost:3001/api/analyze-image \
  -F "image=@sardine.jpg"
```

**Response (200 OK) :**
```json
{
  "espece": "Sardine",
  "nom_scientifique": "Sardina pilchardus",
  "icone": "🐟",
  "confidence": 94,
  "taille_moyenne_cm": 13,
  "poids_moyen_g": 18,
  "comptage": 1,
  "poids_total_kg": "0.02",
  "qualite": "Excellente",
  "fraicheur": "Très fraîche",
  "calibre": "Moyen",
  "conformite_L50": true,
  "ratio_L50_pct": "118",
  "conformite_export_ue": true,
  "raison_analyse": "Petit poisson argenté avec corps élancé et écailles brillantes caractéristiques de la sardine",
  "date": "2026-03-28T..."
}
```

**Erreurs :**
- `400` : Image manquante ou espèce non reconnue
- `500` : Erreur serveur ou ANTHROPIC_API_KEY manquante

### `GET /health`

Health check du serveur.

**Response :**
```json
{
  "status": "ok",
  "service": "BAHRIA Cam API"
}
```

## 🐟 Espèces reconnues

Le modèle identifie les 7 espèces cibles de Dakhla :

| Espèce | Nom scientifique | L50 (cm) | Caractéristiques |
|--------|------------------|----------|------------------|
| **Sardine** | *Sardina pilchardus* | 11 | Petit poisson argenté, écailles brillantes |
| **Maquereau** | *Scomber scombrus* | 24 | Rayures ondulées noires/bleues |
| **Chinchard** | *Trachurus trachurus* | 21 | Ligne latérale épineuse |
| **Anchois** | *Engraulis encrasicolus* | 9 | Très petit, translucide |
| **Poulpe** | *Octopus vulgaris* | — | 8 tentacules, corps mou |
| **Seiche** | *Sepia officinalis* | 10 | 10 tentacules, os interne |
| **Courbine** | *Argyrosomus regius* | 42 | Grand poisson argenté/doré |

## 🧠 Fonctionnement de l'IA

1. **Upload** : L'image est envoyée au serveur en multipart/form-data
2. **Conversion** : L'image est convertie en base64
3. **Analyse** : Claude 3.5 Sonnet avec vision analyse l'image
4. **Classification** : L'IA identifie l'espèce et estime les caractéristiques
5. **Enrichissement** : Les données allométriques sont appliquées (taille → poids)
6. **Conformité** : Vérification L50 et export UE

### Prompt technique

Le prompt demande à Claude de :
- Identifier précisément l'espèce parmi les 7 cibles
- Éviter les confusions courantes (ex: poulpe ≠ courbine)
- Compter le nombre d'individus visibles
- Estimer la taille en cm
- Évaluer la qualité et fraîcheur
- Fournir une explication de la classification

## 🔒 Sécurité

- La clé API Anthropic est côté serveur (pas exposée au frontend)
- Upload limité à 10 MB
- Types de fichiers autorisés : JPEG, PNG uniquement
- Les fichiers uploadés sont supprimés après analyse
- CORS activé pour le développement local

## 📊 Métriques

L'analyse fournit :
- **Espèce** avec confiance (%)
- **Taille** estimée en cm
- **Poids** calculé via équations allométriques (W = a × L^b)
- **Comptage** d'individus
- **Qualité** et **fraîcheur**
- **Conformité** L50 et export UE
- **Calibre** commercial

## 🐛 Dépannage

### Erreur : "ANTHROPIC_API_KEY non définie"
```bash
# Vérifiez que .env existe à la racine
cat .env | grep ANTHROPIC_API_KEY

# Si vide, ajoutez votre clé
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> .env
```

### Erreur : "Port 3001 already in use"
```bash
# Changer le port dans .env
echo "PORT=3002" >> .env

# Ou tuer le processus existant
lsof -ti:3001 | xargs kill
```

### Erreur : "Cannot find module 'express'"
```bash
# Réinstaller les dépendances
npm install
```

## 📁 Structure

```
server/
├── index.js          # Serveur Express principal
└── README.md         # Ce fichier

uploads/              # Fichiers temporaires (auto-nettoyés)
```

## 🚧 Roadmap v1.3

Améliorations prévues (Juin 2026) :
- ✅ Détection d'espèce unique avec IA
- 🔄 **Détection de captures mixtes** (plusieurs espèces)
- 🔄 **Comptage précis** en masse (> 50 individus)
- 🔄 **Segmentation d'instance** pour mesures individuelles
- 🔄 **Export modèle YOLOv8** pour Jetson Orin Nano
- 🔄 **API temps réel** pour traitement vidéo

## 📚 Ressources

- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/messages_post)
- [Guide des datasets](../DATASETS_GUIDE.md)
- [Scripts d'entraînement](../python/training/README.md)

---

**BAHRIA Cam v1.2.1 — Mars 2026**
