# 📊 Description des variables - BAHRIA (Version courte)

## 🎯 Variable cible

| Variable | Type | Valeurs | Description |
|----------|------|---------|-------------|
| **Arrêt biologique** | Oui/Non | Oui (63.6%), Non (36.4%) | Arrêt de pêche recommandé pour reconstituer le stock |

---

## 📐 Variables explicatives (11 features)

| # | Variable | Type | Unité | Plage | Importance | Description courte |
|---|----------|------|-------|-------|------------|-------------------|
| 1 | **Espèce** | Catégorielle | - | poulpe, sardine, seiche, courbine | - | Espèce ciblée par la pêche |
| 2 | **Taille moyenne** | Numérique | cm | 5-80 | ⭐⭐⭐ (9.3%) | Taille moyenne des captures |
| 3 | **Poids moyen** | Numérique | g | 5-6000 | ⭐⭐ (5.9%) | Poids moyen des captures |
| 4 | **Ratio taille/L50** | Numérique | - | 0.5-2.5 | ⭐⭐⭐⭐⭐ (28.6%) | Taille / Taille de maturité sexuelle |
| 5 | **Mois** | Entier | - | 1-12 | ⭐ (1.9%) | Mois de l'échantillon |
| 6 | **SST actuelle** | Numérique | °C | 14-24 | ⭐⭐ (4.7%) | Température de surface de la mer |
| 7 | **Delta SST ponte** | Numérique | °C | 0-6 | ⭐⭐⭐ (11.9%) | Écart à la température optimale de ponte |
| 8 | **Indice upwelling** | Numérique | - | 0.1-1.5 | ⭐ (3.0%) | Intensité de la remontée d'eaux profondes |
| 9 | **CPUE récente** | Numérique | kg/sortie | 5-800 | ⭐ (2.8%) | Capture par unité d'effort |
| 10 | **Tendance CPUE 2 ans** | Numérique | % | -60 à +30 | ⭐⭐⭐ (8.9%) | Évolution de la CPUE sur 2 ans |
| 11 | **Mois avant repro** | Entier | mois | 0-6 | ⭐⭐⭐⭐ (22.9%) | Distance au mois de reproduction |

---

## 🏆 Top 3 des variables les plus importantes

### 🥇 Ratio taille/L50 (28.6%)
- **< 0.85** → Captures de juvéniles → **ALERTE**
- **0.85-1.0** → Captures sous-optimales → **VIGILANCE**
- **> 1.0** → Captures matures → **OK**

### 🥈 Mois avant repro (22.9%)
- **0** → En reproduction → **ARRÊT IMPÉRATIF**
- **1** → 1 mois avant/après → **VIGILANCE**
- **≥ 2** → Hors période → **OK**

### 🥉 Delta SST ponte (11.9%)
- **< 1.5°C** → Conditions optimales de ponte → **ARRÊT**
- **1.5-3.0°C** → Conditions sub-optimales → **SURVEILLANCE**
- **> 3.0°C** → Hors saison → **OK**

---

## 📋 Références par espèce

| Espèce | L50 (cm) | Poids mat. (g) | Mois repro | SST ponte (°C) | CPUE moy. | Tendance |
|--------|----------|----------------|------------|----------------|-----------|----------|
| **Poulpe** | 11 | 500 | Mar, Avr, Sep, Oct | 18.5 | 33 | -26% |
| **Sardine** | 16.5 | 25 | Nov, Déc, Jan, Fév | 17.5 | 600 | -36% |
| **Seiche** | 10 | 200 | Avr, Mai, Jun | 19.0 | 25 | -21% |
| **Courbine** | 50 | 2000 | Mai, Jun, Jul | 20.5 | 11 | -47% |

---

## 💡 Règle de décision simplifiée

### ⚠️ Arrêt biologique recommandé si :
1. **Ratio taille/L50 < 0.85** (captures de juvéniles)
2. **ET** Mois avant repro ≤ 1 (période de reproduction)
3. **ET** Delta SST ponte < 1.5°C (conditions favorables à la ponte)
4. **OU** Tendance CPUE < -25% (chute forte du stock)

---

## 📊 Distribution du dataset

- **Total** : 5,000 échantillons
- **Poulpe** : 1,750 (35%) → 69.4% avec arrêt
- **Sardine** : 1,500 (30%) → 65.1% avec arrêt
- **Seiche** : 1,000 (20%) → 52.8% avec arrêt
- **Courbine** : 750 (15%) → 61.7% avec arrêt

---

## 🔗 Voir aussi

- **VARIABLES_DESCRIPTION.md** - Documentation complète et détaillée
- **DATASET_README.md** - Guide d'utilisation du dataset
- **model_metrics.json** - Performance du modèle ML

---

*BAHRIA v1.0 • Hackathon RamadanIA 2026 • 🐙 بحرية*
