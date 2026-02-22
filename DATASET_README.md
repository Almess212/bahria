# 📊 Dataset BAHRIA - Aide à la décision pour les repos biologiques

## Description

Ce dataset synthétique contient **5000 échantillons** générés pour entraîner un modèle Random Forest de prédiction des arrêts biologiques pour la pêche à Dakhla (Maroc).

Le dataset est basé sur des données réelles de l'**ONP** (Office National des Pêches) et de l'**INRH** (Institut National de Recherche Halieutique), ainsi que des données océanographiques de la **NOAA**.

---

## 📁 Fichiers disponibles

### 1. **bahria_dataset_5000.csv** (Dataset brut)
- Format : CSV standard (séparateur `,` / point décimal `.`)
- Encodage : UTF-8
- Taille : ~294 KB
- Usage : Entraînement du modèle ML

### 2. **bahria_dataset_export_fr.csv** ✨ (Export Excel français)
- Format : CSV (séparateur `;` / virgule décimale `,`)
- Encodage : UTF-8 avec BOM
- Taille : ~297 KB
- Usage : **Import direct dans Excel français**
- Colonnes traduites en français
- Valeurs d'arrêt : "Oui" / "Non"

### 3. **bahria_dataset_export_en.csv** (Export international)
- Format : CSV standard (séparateur `,` / point décimal `.`)
- Encodage : UTF-8
- Taille : ~295 KB
- Usage : Import dans outils d'analyse (Python, R, etc.)
- Colonnes en anglais
- Valeurs d'arrêt : "Yes" / "No"

---

## 📋 Structure du dataset

### Colonnes (version française)

| Colonne | Type | Description | Unité | Exemple |
|---------|------|-------------|-------|---------|
| **Espèce** | Texte | Espèce cible | - | poulpe, sardine, seiche, courbine |
| **Taille moyenne (cm)** | Numérique | Taille moyenne des captures | cm | 10.07 |
| **Poids moyen (g)** | Numérique | Poids moyen des captures | g | 326.2 |
| **Ratio taille/L50** | Numérique | Ratio taille / taille de maturité (L50) | - | 0.916 |
| **Mois** | Entier | Mois de l'échantillon (1-12) | - | 10 |
| **SST actuelle (°C)** | Numérique | Température de surface de la mer | °C | 22.14 |
| **Delta SST ponte (°C)** | Numérique | Écart entre SST et seuil de ponte | °C | 3.64 |
| **Indice upwelling** | Numérique | Indice d'upwelling côtier | - | 0.100 |
| **CPUE récente** | Numérique | Capture par unité d'effort récente | kg/sortie | 39.3 |
| **Tendance CPUE 2 ans (%)** | Numérique | Variation CPUE sur 2 ans | % | -17.8 |
| **Mois avant repro** | Entier | Distance au mois de reproduction | mois | 0 |
| **Arrêt biologique** | Texte | Arrêt recommandé ? | Oui/Non | Oui |

---

## 📊 Statistiques globales

### Distribution des classes
- **Pas d'arrêt (Non)** : 1,818 échantillons (36.4%)
- **Arrêt recommandé (Oui)** : 3,182 échantillons (63.6%)

### Répartition par espèce

| Espèce | Total | Avec arrêt | % arrêt |
|--------|-------|------------|---------|
| **Poulpe** | 1,750 | 1,215 | 69.4% |
| **Sardine** | 1,500 | 976 | 65.1% |
| **Courbine** | 750 | 463 | 61.7% |
| **Seiche** | 1,000 | 528 | 52.8% |

---

## 🎯 Usage

### Excel (recommandé pour l'export français)
1. Ouvrir Excel
2. Fichier > Ouvrir
3. Sélectionner `bahria_dataset_export_fr.csv`
4. Excel détectera automatiquement le séparateur `;` et la virgule décimale

### Python (Pandas)
```python
import pandas as pd

# Charger le dataset en français
df = pd.read_csv('bahria_dataset_export_fr.csv',
                 sep=';',
                 decimal=',',
                 encoding='utf-8-sig')

# Ou charger le dataset brut
df = pd.read_csv('bahria_dataset_5000.csv')
```

### R
```r
# Charger le dataset en français
df <- read.csv2('bahria_dataset_export_fr.csv',
                encoding = 'UTF-8')

# Ou charger le dataset brut
df <- read.csv('bahria_dataset_5000.csv')
```

---

## 🔬 Méthodologie de génération

### Règles de labellisation (score de risque)

Le label `arrêt` est calculé selon un score de risque combinant plusieurs facteurs :

1. **Ratio taille/maturité (size_maturity_ratio)** - Poids : 28.6%
   - < 0.85 → +35 points
   - 0.85-1.0 → +20 points
   - 1.0-1.2 → +10 points

2. **Proximité reproduction (months_to_repro)** - Poids : 22.9%
   - En reproduction (0) → +25 points
   - 1 mois avant → +15 points
   - 2 mois avant → +5 points

3. **Delta SST ponte (sst_spawn_delta)** - Poids : 11.9%
   - < 1.5°C → +20 points
   - 1.5-3.0°C → +10 points

4. **Tendance CPUE (cpue_trend_2y_pct)** - Poids : 8.9%
   - < -25% → +15 points
   - -25% à -10% → +5 points

5. **Indice upwelling (upwelling_index)** - Poids : 3.0%
   - < 0.3 → +5 points

**Seuil d'arrêt** : Score ≥ 45/100

---

## 🌊 Données de référence par espèce

### Poulpe (Octopus vulgaris)
- L50 : 11 cm
- Poids maturité : 500 g
- Mois repro : Mars, Avril, Sept, Oct
- SST seuil ponte : 18.5°C
- CPUE moyenne : 33 kg/sortie
- Tendance : -26%

### Sardine (Sardina pilchardus)
- L50 : 16.5 cm
- Poids maturité : 25 g
- Mois repro : Nov, Déc, Jan, Fév
- SST seuil ponte : 17.5°C
- CPUE moyenne : 600 kg/sortie
- Tendance : -36%

### Seiche (Sepia officinalis)
- L50 : 10 cm
- Poids maturité : 200 g
- Mois repro : Avril, Mai, Juin
- SST seuil ponte : 19.0°C
- CPUE moyenne : 25 kg/sortie
- Tendance : -21%

### Courbine (Argyrosomus regius)
- L50 : 50 cm
- Poids maturité : 2000 g
- Mois repro : Mai, Juin, Juillet
- SST seuil ponte : 20.5°C
- CPUE moyenne : 11 kg/sortie
- Tendance : -47%

---

## 📈 Performance du modèle

Le modèle Random Forest entraîné sur ce dataset atteint :
- **Accuracy** : 86.8%
- **Precision** : 90.3%
- **Recall** : 88.8%
- **F1-Score** : 89.5%

---

## 📝 Citation

Si vous utilisez ce dataset, merci de citer :

```
BAHRIA Dataset v1.0 (2026)
Hackathon RamadanIA 2026 - Dakhla
NEGAM SAS / Smart Sailors
Données sources : ONP, INRH, NOAA
```

---

## 📧 Contact

Pour toute question ou suggestion : **contact@negam.ma**

---

*Généré le 22 février 2026 • BAHRIA v1.0 • 🐙 بحرية*
