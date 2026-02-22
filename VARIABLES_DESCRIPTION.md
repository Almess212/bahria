# 📊 Description détaillée des variables - Dataset BAHRIA

## Vue d'ensemble

Le dataset BAHRIA contient **12 variables** (11 features + 1 target) permettant de prédire si un arrêt biologique est recommandé pour préserver les stocks de poissons à Dakhla.

---

## 🎯 Variable cible (Target)

### **Arrêt biologique** / **Biological Rest**
- **Type** : Catégorielle binaire
- **Valeurs** :
  - `Oui` / `Yes` / `1` → Arrêt biologique recommandé
  - `Non` / `No` / `0` → Pas d'arrêt nécessaire
- **Signification** : Indique si un repos biologique (fermeture de la pêche) est recommandé pour permettre la reconstitution du stock
- **Distribution** : 63.6% Oui, 36.4% Non

---

## 📐 Variables explicatives (Features)

### 1️⃣ **Espèce** / **Species**
- **Type** : Catégorielle nominale
- **Valeurs possibles** :
  - `poulpe` / `octopus` - Poulpe commun (*Octopus vulgaris*)
  - `sardine` / `sardine` - Sardine commune (*Sardina pilchardus*)
  - `seiche` / `cuttlefish` - Seiche commune (*Sepia officinalis*)
  - `courbine` / `meagre` - Courbine (*Argyrosomus regius*)
- **Importance dans le modèle** : Variable de segmentation
- **Exemple** : `poulpe`

**Contexte biologique** :
Chaque espèce a ses propres caractéristiques biologiques (taille de maturité, périodes de reproduction, sensibilité aux variations environnementales).

---

### 2️⃣ **Taille moyenne (cm)** / **Average Size (cm)**
- **Type** : Numérique continue
- **Unité** : Centimètres (cm)
- **Plage** : 5-80 cm selon l'espèce
- **Importance** : ⭐⭐⭐ (9.3% de l'importance du modèle)
- **Exemple** : `10.07` cm

**Contexte biologique** :
La taille moyenne des captures est un indicateur direct de la structure démographique du stock. Des captures de petite taille (juvéniles) indiquent une surpêche et nécessitent un arrêt.

**Valeurs typiques par espèce** :
- Poulpe : 8-15 cm
- Sardine : 10-25 cm
- Seiche : 8-16 cm
- Courbine : 40-80 cm

---

### 3️⃣ **Poids moyen (g)** / **Average Weight (g)**
- **Type** : Numérique continue
- **Unité** : Grammes (g)
- **Plage** : 5-6000 g selon l'espèce
- **Importance** : ⭐⭐ (5.9% de l'importance du modèle)
- **Exemple** : `326.2` g

**Contexte biologique** :
Le poids est corrélé à la taille mais apporte une information complémentaire sur l'état nutritionnel et la condition corporelle des individus. Une relation poids/taille anormalement faible peut indiquer un stress nutritionnel.

**Valeurs typiques par espèce** :
- Poulpe : 200-1200 g
- Sardine : 15-60 g
- Seiche : 150-600 g
- Courbine : 1500-5000 g

---

### 4️⃣ **Ratio taille/L50** / **Size/Maturity Ratio**
- **Type** : Numérique continue
- **Unité** : Sans dimension (ratio)
- **Plage** : 0.5-2.5
- **Importance** : ⭐⭐⭐⭐⭐ (28.6% - **Variable la plus importante !**)
- **Exemple** : `0.916`
- **Formule** : `Taille moyenne / L50`

**Contexte biologique** :
Le **L50** (Length at 50% maturity) est la taille à laquelle 50% des individus sont matures sexuellement et capables de se reproduire.

**Interprétation** :
- **< 0.85** : Captures majoritairement juvéniles → **ALERTE ROUGE** 🔴
- **0.85-1.0** : Captures de taille sous-optimale → **VIGILANCE** 🟡
- **1.0-1.2** : Captures de première reproduction → **ACCEPTABLE** 🟢
- **> 1.2** : Captures de géniteurs matures → **OPTIMAL** ✅

**Valeurs L50 de référence** :
- Poulpe : 11 cm
- Sardine : 16.5 cm
- Seiche : 10 cm
- Courbine : 50 cm

---

### 5️⃣ **Mois** / **Month**
- **Type** : Numérique discrète (entier)
- **Valeurs** : 1-12 (Janvier à Décembre)
- **Importance** : ⭐ (1.9% de l'importance du modèle)
- **Exemple** : `10` (Octobre)

**Contexte biologique** :
Le mois capture les variations saisonnières de productivité marine, température, et disponibilité alimentaire. Certains mois sont plus propices à la reproduction.

---

### 6️⃣ **SST actuelle (°C)** / **Current SST (°C)**
- **Type** : Numérique continue
- **Unité** : Degrés Celsius (°C)
- **Plage** : 14-24°C
- **Importance** : ⭐⭐ (4.7% de l'importance du modèle)
- **Exemple** : `22.14` °C

**Contexte océanographique** :
La **SST** (Sea Surface Temperature) est la température de surface de la mer mesurée par satellite (NOAA). Elle influence directement :
- Le métabolisme des espèces marines
- Les migrations
- Le déclenchement de la reproduction
- La productivité planctonique

**Températures optimales** :
- Zone de Dakhla : 17-20°C (moyenne annuelle)
- Variations saisonnières : 15-22°C
- Upwelling actif : 15-18°C (eaux froides et riches)

---

### 7️⃣ **Delta SST ponte (°C)** / **SST Spawn Delta (°C)**
- **Type** : Numérique continue
- **Unité** : Degrés Celsius (°C)
- **Plage** : 0-6°C
- **Importance** : ⭐⭐⭐ (11.9% de l'importance du modèle)
- **Exemple** : `3.64` °C
- **Formule** : `|SST actuelle - SST seuil ponte|`

**Contexte biologique** :
Mesure l'écart entre la température actuelle et la température optimale de ponte pour chaque espèce. Un écart faible (<1.5°C) indique des conditions favorables à la reproduction.

**Interprétation** :
- **< 1.5°C** : Conditions optimales de ponte → **Arrêt recommandé** 🔴
- **1.5-3.0°C** : Conditions sub-optimales → **Surveillance** 🟡
- **> 3.0°C** : Hors période de reproduction → **OK** 🟢

**Seuils de ponte par espèce** :
- Poulpe : 18.5°C
- Sardine : 17.5°C
- Seiche : 19.0°C
- Courbine : 20.5°C

---

### 8️⃣ **Indice upwelling** / **Upwelling Index**
- **Type** : Numérique continue
- **Unité** : Sans dimension (indice normalisé)
- **Plage** : 0.1-1.5
- **Importance** : ⭐ (3.0% de l'importance du modèle)
- **Exemple** : `0.100`

**Contexte océanographique** :
L'**upwelling** (remontée d'eaux profondes) est un phénomène crucial pour Dakhla :
- Apporte des nutriments en surface
- Stimule la productivité planctonique
- Attire les poissons pélagiques (sardine)
- Eaux plus froides et riches en oxygène

**Interprétation** :
- **< 0.3** : Upwelling faible → Productivité basse
- **0.3-0.6** : Upwelling modéré → Normal
- **> 0.6** : Upwelling fort → Haute productivité

**Saisonnalité** :
- Pic en été (juin-août) : vents alizés forts
- Minimum en hiver (décembre-février)

---

### 9️⃣ **CPUE récente** / **Recent CPUE**
- **Type** : Numérique continue
- **Unité** : Kilogrammes par sortie de pêche (kg/sortie)
- **Plage** : 5-800 kg/sortie selon l'espèce
- **Importance** : ⭐ (2.8% de l'importance du modèle)
- **Exemple** : `39.3` kg/sortie

**Contexte halieutique** :
La **CPUE** (Capture Par Unité d'Effort) mesure l'abondance relative du stock :
- **CPUE élevée** → Stock abondant, accessibilité facile
- **CPUE faible** → Stock déprimé, effort de pêche inefficace

**Valeurs moyennes par espèce** :
- Poulpe : 20-50 kg/sortie
- Sardine : 400-800 kg/sortie
- Seiche : 15-35 kg/sortie
- Courbine : 8-15 kg/sortie

---

### 🔟 **Tendance CPUE 2 ans (%)** / **CPUE Trend 2y (%)**
- **Type** : Numérique continue
- **Unité** : Pourcentage (%)
- **Plage** : -60% à +30%
- **Importance** : ⭐⭐⭐ (8.9% de l'importance du modèle)
- **Exemple** : `-17.8` %

**Contexte halieutique** :
Mesure l'évolution de la CPUE sur les 2 dernières années. C'est un **indicateur de tendance du stock**.

**Interprétation** :
- **< -25%** : Chute forte → **Surpêche probable** 🔴
- **-25% à -10%** : Déclin modéré → **Vigilance** 🟡
- **-10% à +10%** : Stabilité → **Normal** 🟢
- **> +10%** : Amélioration → **Bonne gestion** ✅

**Tendances actuelles (données réelles ONP)** :
- Poulpe : -26%
- Sardine : -36%
- Seiche : -21%
- Courbine : -47%

---

### 1️⃣1️⃣ **Mois avant repro** / **Months to Reproduction**
- **Type** : Numérique discrète (entier)
- **Unité** : Mois
- **Valeurs** : 0-6
- **Importance** : ⭐⭐⭐⭐ (22.9% - **2ème variable la plus importante !**)
- **Exemple** : `0` (en pleine reproduction)

**Contexte biologique** :
Mesure la **distance circulaire minimale** entre le mois actuel et les mois de reproduction de l'espèce. Un calcul circulaire est nécessaire car l'année est cyclique (décembre → janvier).

**Interprétation** :
- **0** : En pleine période de reproduction → **ARRÊT IMPÉRATIF** 🔴
- **1** : Un mois avant/après la reproduction → **VIGILANCE MAXIMALE** 🟡
- **2** : Deux mois avant/après → **Surveillance** 🟢
- **≥ 3** : Hors période reproductive → **OK** ✅

**Périodes de reproduction** :
- **Poulpe** : Mars, Avril, Septembre, Octobre
- **Sardine** : Novembre, Décembre, Janvier, Février
- **Seiche** : Avril, Mai, Juin
- **Courbine** : Mai, Juin, Juillet

**Exemple de calcul** :
- Si mois actuel = Octobre et espèce = Poulpe
- Mois de repro poulpe : [3, 4, 9, 10]
- Distance minimale : 0 (octobre est un mois de reproduction)
- → `months_to_repro = 0` → **Arrêt recommandé !**

---

## 📊 Classement par importance dans le modèle

| Rang | Variable | Importance | Impact |
|------|----------|------------|--------|
| 🥇 | **Ratio taille/L50** | 28.6% | Critique |
| 🥈 | **Mois avant repro** | 22.9% | Très élevé |
| 🥉 | **Delta SST ponte** | 11.9% | Élevé |
| 4 | Taille moyenne | 9.3% | Moyen |
| 5 | Tendance CPUE 2 ans | 8.9% | Moyen |
| 6 | Poids moyen | 5.9% | Faible |
| 7 | SST actuelle | 4.7% | Faible |
| 8 | Indice upwelling | 3.0% | Faible |
| 9 | CPUE récente | 2.8% | Faible |
| 10 | Mois | 1.9% | Faible |

---

## 🔬 Relations entre variables

### Corrélations fortes
1. **Taille ↔ Poids** : Relation allométrique (W = a × L³)
2. **Ratio taille/L50 ↔ Arrêt** : Plus le ratio est faible, plus l'arrêt est probable
3. **Mois ↔ SST** : Variation saisonnière de la température
4. **Mois ↔ Mois avant repro** : Chaque espèce a ses périodes fixes

### Variables indépendantes
1. **CPUE ⊥ SST** : Pas de corrélation directe
2. **Upwelling ⊥ Taille** : Indépendants
3. **Espèce** : Segmente naturellement le dataset

---

## 📚 Sources des données

- **ONP** (Office National des Pêches) : CPUE, tendances, statistiques de pêche
- **INRH** (Institut National de Recherche Halieutique) : L50, biologie des espèces, périodes de reproduction
- **NOAA ERDDAP** : SST (satellite), données océanographiques
- **Littérature scientifique** : Paramètres biologiques, seuils de ponte

---

## 💡 Utilisation pratique

### Pour la prise de décision
Les **3 variables critiques** à surveiller en priorité :
1. **Ratio taille/L50** < 0.85 → Signal d'alarme immédiat
2. **Mois avant repro** = 0 ou 1 → Période sensible
3. **Delta SST ponte** < 1.5°C → Conditions de reproduction optimales

**Règle simple** :
> Si ces 3 indicateurs sont dans le rouge simultanément → **Arrêt biologique fortement recommandé**

---

*Document généré le 22 février 2026 • BAHRIA v1.0 • 🐙 بحرية*
