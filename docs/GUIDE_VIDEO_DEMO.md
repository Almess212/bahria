# Guide - Vidéo de démo BAHRIA

## 🎬 Plan de tournage (3-5 minutes)

### Matériel nécessaire
- [ ] Application BAHRIA lancée (`npm run dev:all`)
- [ ] Logiciel d'enregistrement d'écran (QuickTime, OBS, Loom, etc.)
- [ ] 3-4 photos de poissons de test pour BAHRIA Cam
- [ ] Micro de qualité (ou micro intégré dans un endroit calme)
- [ ] Script de narration préparé

---

## 📝 Script détaillé

### **SÉQUENCE 1: Intro** (0:00 - 0:20)
**Écran:** Page d'accueil (`http://localhost:5173/`)

**Narration:**
> "Bonjour, je vous présente BAHRIA, la première plateforme d'aide à la décision pour la gestion durable des pêches à Dakhla. BAHRIA combine intelligence artificielle, données océanographiques en temps réel, et vision par ordinateur."

**Actions:**
1. Montrer le logo BAHRIA
2. Scroller lentement sur la page d'accueil
3. Mettre en évidence la section "Le défi de la pêche durable"

**Durée:** 20 secondes

---

### **SÉQUENCE 2: Problématique** (0:20 - 0:40)
**Écran:** Section problème sur landing page

**Narration:**
> "Les stocks halieutiques de Dakhla sont en déclin critique: moins 26% pour le poulpe, moins 36% pour la sardine, moins 47% pour la courbine. 43% des captures sont des juvéniles sous la taille de maturité. Les arrêts biologiques actuels manquent de base scientifique."

**Actions:**
1. Zoomer sur les cartes de statistiques (déclin, captures juvéniles, décisions tardives)
2. Rester 2-3 secondes sur chaque chiffre

**Durée:** 20 secondes

---

### **SÉQUENCE 3: Dashboard** (0:40 - 1:10)
**Écran:** `http://localhost:5173/app.html#dashboard` (connecté)

**Narration:**
> "Le dashboard BAHRIA offre une vue en temps réel des 7 espèces suivies: sardine, maquereau, chinchard, anchois, poulpe, seiche, et courbine. Chaque indicateur est calculé à partir de données biologiques et océanographiques actuelles."

**Actions:**
1. Se connecter avec `admin@bahria.com` / `admin123`
2. Montrer les cartes de statistiques (biomasse, CPUE, captures)
3. Défiler pour montrer les graphiques de tendances
4. Afficher une alerte si disponible (sinon passer)

**Durée:** 30 secondes

---

### **SÉQUENCE 4: Analyse & Prédiction** (1:10 - 2:00)
**Écran:** `http://localhost:5173/app.html#analysis`

**Narration:**
> "Le module d'analyse utilise un modèle Random Forest entraîné sur 5000 échantillons avec 86.8% de précision. Je vais tester avec des données réalistes pour la sardine."

**Actions:**
1. Cliquer sur "Analyse" dans le menu
2. Remplir le formulaire rapidement:
   - Espèce: Sardine
   - Taille moyenne: 16 cm
   - Poids moyen: 55 g
   - CPUE actuel: 280 kg/jour
   - Zone: Côtier
3. Cliquer sur "Analyser"
4. Attendre les résultats (2-3 sec)

**Narration (pendant l'analyse):**
> "L'IA analyse 11 variables: ratio taille/L50, tendance CPUE, température de surface de l'océan récupérée en temps réel via l'API NOAA, mois avant reproduction, et 7 autres indicateurs."

**Actions (résultats):**
5. Montrer le score de risque (ex: 76/100)
6. Scroller pour afficher la recommandation
7. Montrer les signaux détaillés (critiques, attention, OK)
8. Afficher l'impact estimé (durée arrêt, tonnes, MDH, marins, gain biomasse)

**Narration:**
> "Le système recommande un arrêt biologique de 35 jours, avec un gain de biomasse attendu de 18%."

**Durée:** 50 secondes

---

### **SÉQUENCE 5: BAHRIA Cam** ⭐ (2:00 - 3:00)
**Écran:** `http://localhost:5173/app.html#cam`

**Narration:**
> "Et maintenant, notre grande nouveauté: BAHRIA Cam. C'est un système de vision par intelligence artificielle qui identifie les espèces en moins de 3 secondes."

**Actions:**
1. Cliquer sur "BAHRIA Cam" dans le menu
2. Montrer l'interface vide
3. Cliquer sur "Choisir une image"
4. Sélectionner une photo de sardine (ou autre espèce)

**Narration (pendant le chargement):**
> "J'uploade une photo de sardine prise ce matin au port de Dakhla. L'IA analyse la photo en utilisant Claude Sonnet 4.6, le modèle de vision le plus avancé d'Anthropic."

**Actions (résultats - 2-3 sec):**
5. Montrer les résultats:
   - Espèce identifiée (ex: Sardine - 96.8% confiance)
   - Taille estimée (ex: 18 cm)
   - Poids moyen (ex: 65 g)
   - Calibre (ex: Moyen)
   - Conformité L50 (✅ Conforme ou ⚠️ Non conforme)
   - Conformité export UE (✅ Oui ou ❌ Non)
   - Nombre d'individus (ex: 1)
   - Poids total (ex: 65 g)
   - Qualité (ex: Excellente)
   - Fraîcheur (ex: Très fraîche)

**Narration:**
> "En 2 secondes, BAHRIA Cam a identifié une sardine avec 96% de confiance, estimé sa taille à 18 centimètres et son poids à 65 grammes, et validé sa conformité pour l'export européen. Ce système est utilisable en usine, au port, ou même embarqué sur les navires."

**Actions:**
6. Tester une 2e photo (différente espèce, ex: maquereau) en accéléré
7. Montrer rapidement le résultat

**Durée:** 60 secondes

---

### **SÉQUENCE 6: Carte interactive** (3:00 - 3:30)
**Écran:** `http://localhost:5173/app.html#map`

**Narration:**
> "La carte interactive géolocalise les zones de pêche de Dakhla avec une heatmap de densité de biomasse."

**Actions:**
1. Cliquer sur "Carte" dans le menu
2. Zoomer sur Dakhla (23.7°N, 15.9°W)
3. Cliquer sur un ou deux markers pour afficher les infos
4. Montrer la légende (zones côtières, offshore, nourricerie)

**Durée:** 30 secondes

---

### **SÉQUENCE 7: Assistant IA** (3:30 - 4:00)
**Écran:** `http://localhost:5173/app.html#assistant`

**Narration:**
> "L'assistant IA répond à vos questions sur les stocks et recommande des actions basées sur les données scientifiques."

**Actions:**
1. Cliquer sur "Assistant" dans le menu
2. Taper une question: "Quelles sont les prévisions pour la sardine ce mois-ci?"
3. Envoyer
4. Montrer la réponse de Claude (2-3 secondes)

**Narration:**
> "L'assistant analyse les données en temps réel et fournit des recommandations personnalisées."

**Durée:** 30 secondes

---

### **SÉQUENCE 8: Conclusion & Impact** (4:00 - 4:30)
**Écran:** Page d'accueil - section Impact

**Narration:**
> "BAHRIA permet d'optimiser les arrêts biologiques: moins de jours mais mieux placés, pour un gain de biomasse de 15 à 25%. Des décisions scientifiques au service de la durabilité ET de l'économie locale."

**Actions:**
1. Scroller sur la section Impact
2. Montrer les 3 cartes (gain biomasse, durabilité, précision)
3. Afficher le testimonial (Dr. Hassan El Idrissi)

**Durée:** 30 secondes

---

### **SÉQUENCE 9: Roadmap & Fermeture** (4:30 - 5:00)
**Écran:** Page d'accueil - section Technologies + CTA

**Narration:**
> "BAHRIA v1.2 est opérationnel aujourd'hui. Notre roadmap inclut le déploiement sur Jetson Orin Nano pour du temps réel embarqué, la détection de captures mixtes, et le comptage en masse. BAHRIA, c'est la gestion durable des pêches par l'intelligence artificielle. Merci!"

**Actions:**
1. Scroller sur la section Technologies
2. Montrer le CTA "Accéder à l'application"
3. Afficher le footer avec logo BAHRIA
4. Fondu au noir

**Durée:** 30 secondes

---

## 🎥 Paramètres d'enregistrement

### Logiciel recommandé

**Sur macOS:**
- **QuickTime Player** (gratuit, intégré)
  - `Fichier` → `Nouvel enregistrement de l'écran`
  - Sélectionner le micro
  - Cliquer sur l'enregistrement
  - Cmd+Ctrl+Esc pour arrêter

**Sur Windows:**
- **OBS Studio** (gratuit, open-source)
  - Télécharger: https://obsproject.com/
  - Ajouter source "Capture d'écran"
  - Ajouter source "Capture audio"

**Multiplateforme:**
- **Loom** (gratuit pour vidéos courtes)
  - Extension Chrome: https://www.loom.com/
  - Très simple d'utilisation
  - Partage instantané

### Résolution
- **1920x1080** (Full HD) recommandé
- Minimum: 1280x720 (HD)

### Format
- **MP4** (H.264) pour compatibilité maximale
- Frame rate: 30 FPS minimum

### Audio
- Micro de qualité dans un endroit calme
- Réduire bruits de fond
- Tester le niveau sonore avant

---

## ✅ Checklist pré-enregistrement

### Technique
- [ ] Application lancée et testée
- [ ] Backend API fonctionnel (curl http://localhost:3001/health)
- [ ] Connexion internet stable
- [ ] Navigateur en plein écran (F11)
- [ ] Notifications désactivées (mode concentration)
- [ ] Bureaux/onglets inutiles fermés
- [ ] Logiciel d'enregistrement testé
- [ ] Micro testé et niveau audio correct

### Contenu
- [ ] 3-4 photos de poissons préparées et renommées
- [ ] Données de test pour formulaire analyse notées
- [ ] Script de narration lu et chronométré
- [ ] Compte admin vérifié (`admin@bahria.com` / `admin123`)

### Environnement
- [ ] Pièce calme (pas de bruits de fond)
- [ ] Éclairage correct (pas de reflets sur l'écran)
- [ ] Téléphone en mode silencieux
- [ ] "Ne pas déranger" activé sur l'ordinateur

---

## 📋 Photos de test recommandées

Préparez 3-4 photos de poissons:

1. **Sardine** - photo nette, individu unique
2. **Maquereau** - photo nette, individu unique
3. **Chinchard** - photo nette, individu unique
4. **Poulpe** (optionnel) - pour montrer la diversité

**Sources:**
- Cherchez sur Google Images: "sardine fish market"
- Utilisez des photos libres de droits (Unsplash, Pexels)
- Ou prenez vos propres photos au marché de Dakhla

**Nommez-les clairement:**
- `sardine_test.jpg`
- `maquereau_test.jpg`
- etc.

---

## 🎬 Processus d'enregistrement

### 1. Préparation (10 min)
- Lancer l'application
- Ouvrir le navigateur en plein écran
- Préparer les photos
- Tester le micro
- Relire le script

### 2. Essai à blanc (5 min)
- Faire un tour complet sans enregistrer
- Chronométrer (objectif: 4-5 min)
- Ajuster si trop long/court

### 3. Enregistrement (10-15 min)
- Lancer l'enregistrement
- Suivre le script séquence par séquence
- Parler clairement et lentement
- **Ne pas stresser si erreur:** on peut couper au montage

### 4. Visionnage (5 min)
- Regarder la vidéo en entier
- Vérifier:
  - Audio audible et clair
  - Pas de bugs visuels
  - Transitions fluides
  - Durée acceptable (4-5 min)

### 5. Retakes (si nécessaire)
- Refaire uniquement les séquences problématiques
- Ou tout refaire si globalement insatisfaisant

---

## ✂️ Post-production (optionnel)

### Montage simple
Si vous voulez améliorer la vidéo:
- **iMovie** (macOS, gratuit)
- **DaVinci Resolve** (multiplateforme, gratuit)
- **OpenShot** (Linux, gratuit)

### Améliorations possibles
1. **Intro/outro** (5-10 sec)
   - Logo BAHRIA
   - Titre: "BAHRIA - Gestion durable des pêches par IA"
   - Musique de fond subtile (optionnel)

2. **Sous-titres** (recommandé)
   - Ajoutez les chiffres clés en texte à l'écran
   - Facilite la compréhension sans son

3. **Transitions**
   - Coupes franches entre les séquences
   - Fondus si changement de section majeure

4. **Annotations**
   - Flèches pour pointer des éléments clés
   - Encadrés pour mettre en évidence

### Musique de fond (optionnel)
- Gratuit et libre de droits:
  - YouTube Audio Library
  - Incompetech
  - Bensound
- **Important:** Volume très faible pour ne pas couvrir la voix

---

## 📤 Export et partage

### Paramètres d'export
- Format: **MP4**
- Codec: **H.264**
- Résolution: **1920x1080** ou **1280x720**
- Bitrate: 5-10 Mbps

### Plateformes de partage
1. **YouTube** (privé ou non listé)
   - Meilleure qualité
   - Partage facile par lien

2. **Google Drive**
   - Partage direct avec jury
   - Pas de compression

3. **Vimeo**
   - Interface professionnelle
   - Contrôle de confidentialité

### Nom du fichier
`BAHRIA_Demo_RamadanIA_2026_v1.mp4`

---

## 💡 Conseils professionnels

1. **Parlez lentement**: Plus lent que vous pensez nécessaire
2. **Respirez**: Faites des pauses entre les phrases
3. **Souriez**: On l'entend dans la voix!
4. **Variez le ton**: Évitez la monotonie
5. **Mettez l'accent sur les chiffres**: 26%, 86.8%, <3 secondes
6. **Terminez fort**: Message d'impact durable

### Phrases d'accroche
- "En moins de 3 secondes..." (BAHRIA Cam)
- "Avec 86.8% de précision..." (IA)
- "Un gain de biomasse de 15 à 25%..." (Impact)

---

## 🚨 En cas de problème technique pendant l'enregistrement

### L'app plante
- Pause enregistrement
- Redémarrer l'app
- Reprendre où vous étiez

### BAHRIA Cam ne répond pas
- Vérifier backend (port 3001)
- Vérifier connexion internet
- Utiliser une autre photo

### Audio saturé
- Éloigner le micro
- Réduire le gain dans les paramètres
- Parler moins fort

---

## ✅ Checklist finale

- [ ] Vidéo enregistrée (4-5 min)
- [ ] Audio clair et audible
- [ ] Toutes les séquences présentes
- [ ] Pas de bugs visuels majeurs
- [ ] Format exporté en MP4 H.264
- [ ] Fichier renommé correctement
- [ ] Uploadé sur plateforme de partage
- [ ] Lien de partage testé

---

**Bonne chance pour votre vidéo! 🎬**

**Tips final:** Faites plusieurs prises. La première est rarement la meilleure. Et n'oubliez pas: l'authenticité vaut mieux que la perfection! 😊
