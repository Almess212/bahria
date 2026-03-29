# 🗺️ BAHRIA Map - Résumé des fonctionnalités

## Vue d'ensemble

La page Carte (`http://localhost:5173/app.html#map`) affiche maintenant **l'intégralité du littoral marocain** avec :

- ✅ **11 points géographiques de référence** (Cap Spartel → Cap Blanc)
- ✅ **8 grands ports de pêche** (Tanger → Sidi Ifni)
- ✅ **4 zones de pêche locales Dakhla** (zone historique du projet)
- ✅ **Arrêts biologiques officiels 2025-2026** (données gouvernementales)
- ✅ **Prédictions IA en temps réel** (modèle Random Forest 86.8% précision)
- ✅ **Zone de non-pêche permanente** (Dakhla Stock C)

---

## 📍 Points géographiques de référence

### Limites officielles du littoral marocain

| ID   | Nom                  | Coordonnées          | Rôle réglementaire                          | Région            |
|------|----------------------|----------------------|---------------------------------------------|-------------------|
| P1   | Cap Spartel          | 35.79°N, 5.92°W      | Limite Nord                                 | Atlantique Nord   |
| P2   | Safi                 | 32.30°N, 9.24°W      | Limite zone pélagiques Atlantique Centre    | Atlantique Nord   |
| P3   | Agadir               | 30.42°N, 9.60°W      | Limite zone courbine Z2                     | Atlantique Centre |
| P4   | Imessouane           | 30.85°N, 9.82°W      | Limite zone courbine Z3                     | Atlantique Centre |
| P5   | Sidi L'Ghazi         | 30.20°N, 9.82°W      | Limite zone seiche / sud                    | Atlantique Centre |
| P6   | Tan-Tan              | 28.44°N, 11.10°W     | Limite bande 8 milles poulpe                | Atlantique Centre |
| P7   | Laâyoune             | 27.16°N, 13.20°W     | Limite zone courbine Z2 (sud)               | Atlantique Sud    |
| P8   | Cap Boujdour         | 26.13°N, 14.49°W     | Limite Atlantique Centre/Sud pélagiques     | Atlantique Sud    |
| P9   | Dakhla               | 23.71°N, 15.94°W     | Zone non-pêche permanente (Stock C)         | Atlantique Sud    |
| P10  | Parallèle 22°43'N    | 22.72°N, 16.50°W     | Limite arrêt poulpe prolongé                | Atlantique Sud    |
| P11  | Cap Blanc            | 20.77°N, 17.05°W     | Limite Sud – Cap Blanc (Mauritanie)         | Atlantique Sud    |

**Source** : Secrétariat d'État à la Pêche Maritime • INRH • Arrêté ministériel n° 25/07

---

## ⚓ Grands ports de pêche

### Ports majeurs et activités principales

| ID   | Port            | Région            | Coordonnées          | Activités principales                  | Statut   |
|------|-----------------|-------------------|----------------------|----------------------------------------|----------|
| PA1  | Tanger          | Méditerranée      | 35.77°N, 5.80°W      | Petits pélagiques, Blanc               | Standard |
| PA2  | Larache         | Atlantique Nord   | 35.19°N, 6.15°W      | Sardine, Anchois                       | Standard |
| PA3  | Kénitra         | Atlantique Nord   | 34.26°N, 6.59°W      | Crevettes, Anchois                     | Standard |
| PA4  | **Casablanca**  | Atlantique Nord   | 33.60°N, 7.62°W      | Sardine, Commercial                    | **Majeur** |
| PA5  | Mohammedia      | Atlantique Nord   | 33.69°N, 7.39°W      | Petits pélagiques                      | Standard |
| PA6  | El Jadida       | Atlantique Nord   | 33.23°N, 8.50°W      | Sardine, Maquereau                     | Standard |
| PA7  | **Essaouira**   | Atlantique Centre | 31.51°N, 9.77°W      | Sardine, Poulpe                        | **Majeur** |
| PA8  | Sidi Ifni       | Atlantique Centre | 29.37°N, 10.17°W     | Poulpe, Petits pélagiques              | Standard |

**Ports majeurs** : Casablanca et Essaouira (infrastructure ⭐)

---

## 🎣 Zones de pêche locales Dakhla

4 zones historiques du projet BAHRIA (focus initial) :

| ID | Nom                      | Coordonnées          | Type         | Biomasse | Espèces principales           |
|----|--------------------------|----------------------|--------------|----------|-------------------------------|
| 1  | Zone Côtière Nord        | 23.85°N, 15.85°W     | Côtier       | Moyenne  | Sardine, Anchois, Poulpe      |
| 2  | Zone Offshore            | 23.50°N, 16.20°W     | Offshore     | Élevée   | Maquereau, Chinchard          |
| 3  | Zone Nourricerie         | 23.65°N, 15.75°W     | Nourricerie  | Faible   | Juvéniles (toutes espèces)    |
| 4  | Zone Côtière Sud         | 23.55°N, 15.95°W     | Côtier       | Moyenne  | Seiche, Courbine              |

---

## ⛔ Arrêts biologiques 2025-2026

### État actuel : Mars 2026

**Tous les arrêts biologiques de la saison 2025-2026 sont TERMINÉS.**

### Calendrier des arrêts terminés

| Espèce              | Période                   | Durée      | Zones concernées                                      | Base réglementaire                    |
|---------------------|---------------------------|------------|-------------------------------------------------------|---------------------------------------|
| **Poulpe**          | 16 sept → 31 déc 2025     | 3,5 mois   | Littoral national (Cap Spartel à Cap Blanc)           | Arrêté ministériel n° 25/07           |
| **Seiche**          | 16 sept → 15 déc 2025     | 3 mois     | Sud de Sidi L'Ghazi (Atlantique Centre-Sud)           | Arrêté n° 25/07 (synchronisé poulpe)  |
| **Petits pélagiques** (Sardine, Anchois, Maquereau, Chinchard) | 1er nov 2025 → 15 fév 2026 | ~3,5 mois | Atlantique Centre (Safi → Cap Boujdour) + Atlantique Sud (Cap Boujdour → Cap Blanc) | Décisions du 4 nov. 2025 + PP-01/26 |
| **Courbine**        | 1er → 31 déc 2025         | 1 mois     | 3 zones : Boujdour→Dakhla, Laâyoune→Agadir, Nord Imessouane | Décision ministérielle + quota annuel |

**Note** : 75 senneurs étaient autorisés à partir du 1er janvier 2026 pour les petits pélagiques.

### Zone de non-pêche PERMANENTE

| Zone                   | Coordonnées          | Rayon     | Espèces interdites | Date de début    | Fin          |
|------------------------|----------------------|-----------|--------------------|------------------|--------------|
| **Dakhla (Stock C)**   | 23.71°N, 15.94°W     | 15 km     | Toutes espèces     | 8 sept. 2025     | **Permanente** |

**Base légale** : Arrêté ministériel n° 25/07 – 11 septembre 2025

---

## 🤖 Intégration IA - Prédictions en temps réel

### Analyse prédictive pour 4 espèces

La carte affiche les **prédictions du modèle Random Forest** (86.8% précision) pour :

1. **Sardine** (Sardina pilchardus)
2. **Maquereau** (Scomber scombrus)
3. **Chinchard** (Trachurus spp.)
4. **Anchois** (Engraulis encrasicolus)

### Fonctionnalités IA

- **Score de risque** : 0-100 (calculé à partir de 10 indicateurs biologiques et océanographiques)
- **Recommandation** : Arrêt biologique conseillé ou non
- **Signaux détaillés** : 10 indicateurs avec niveau de risque (Critique / Attention / OK)
- **Croisement réglementaire** : Affichage de l'état de l'arrêt biologique officiel si actif

### 10 Indicateurs du modèle

| Indicateur                        | Description                                           |
|-----------------------------------|-------------------------------------------------------|
| **Ratio Taille/L50**              | Taille moyenne des captures vs. taille de maturité   |
| **Tendance CPUE**                 | Évolution des captures par unité d'effort (2 ans)    |
| **Poids/Poids maturité**          | Poids moyen vs. poids de reproduction                 |
| **Écart SST**                     | Température de surface vs. optimum espèce (°C)        |
| **Mois avant reproduction**       | Nombre de mois avant pic de reproduction              |
| **% Population mature**           | Pourcentage de poissons au-dessus de L50              |
| **Zone risque**                   | Type de zone (Côtier/Offshore/Nourricerie)            |
| **Saison reproduction**           | Période actuelle vs. pic de reproduction              |
| **Déclin biomasse**               | Baisse de biomasse sur 2 ans (%)                      |
| **Indice upwelling**              | Intensité de la remontée d'eau froide                 |

---

## 🌊 Données océanographiques en temps réel

### API NOAA ERDDAP

La carte récupère automatiquement les données océanographiques actuelles :

- **SST** (Sea Surface Temperature) : Température de surface de l'océan
- **Source** : NOAA ERDDAP — Serveur de données scientifiques
- **Zone** : Dakhla (23.7°N, 15.95°W)
- **Mise à jour** : Temps réel (affichée en direct sur la carte)

---

## 📊 Interface utilisateur

### Paramètres de la carte

- **Centre** : 28.0°N, 10.0°W (vue panoramique du Maroc)
- **Zoom** : 6 (échelle nationale)
- **Hauteur** : 600px
- **Provider** : OpenStreetMap

### Légende interactive

La légende est organisée en 3 sections :

#### 1. Points et Zones
- 📍 Points géographiques de référence
- ⚓ Ports de pêche standard
- ⚓⭐ Ports majeurs (Casablanca, Essaouira)
- 🎣 Zones de pêche locales Dakhla

#### 2. Régions halieutiques
- 🔵 Atlantique Nord (Cap Spartel → Safi)
- 🟢 Atlantique Centre (Safi → Cap Boujdour)
- 🟡 Atlantique Sud (Cap Boujdour → Cap Blanc)
- 🔴 Méditerranée (Tanger)

#### 3. Zones réglementaires
- ⛔ Zone permanente interdite (Dakhla Stock C)
- 🚫 Arrêt biologique temporaire (si actif)
- 🌡️ SST en temps réel (température océan)

### Compteur de points

**Total affiché** : 11 points de référence • 8 grands ports • 4 zones locales Dakhla

---

## 🛠️ Technologies utilisées

| Technologie       | Usage                                      |
|-------------------|--------------------------------------------|
| **React 19**      | Framework frontend                         |
| **Leaflet.js**    | Bibliothèque de cartographie interactive   |
| **Zustand**       | Gestion d'état (espèces, prédictions)      |
| **TailwindCSS**   | Styles et interface utilisateur            |
| **Random Forest** | Modèle de prédiction IA (86.8% précision)  |
| **NOAA ERDDAP**   | API données océanographiques temps réel    |

---

## 📂 Fichiers sources

- **Frontend** : `/Users/alimessoudi/bahria/src/features/map/MapPage.jsx`
- **Données officielles** : `/tmp/arrets_biologiques.txt` (document gouvernemental converti)
- **Modèle IA** : `/Users/alimessoudi/bahria/src/features/analysis/analysisUtils.js`

---

## ✅ Statut actuel

| Fonctionnalité                              | Statut     |
|---------------------------------------------|------------|
| Affichage carte interactive                 | ✅ Opérationnel |
| Points géographiques officiels (11)         | ✅ Intégré |
| Grands ports du Maroc (8)                   | ✅ Intégré |
| Zones locales Dakhla (4)                    | ✅ Intégré |
| Arrêts biologiques officiels 2025-2026      | ✅ Intégré |
| Zone permanente Dakhla Stock C              | ✅ Intégré |
| Prédictions IA 4 espèces                    | ✅ Opérationnel |
| Données SST temps réel (NOAA)               | ✅ Opérationnel |
| Croisement prédictions/réglementation       | ✅ Opérationnel |
| Signaux détaillés (10 indicateurs)          | ✅ Opérationnel |

---

## 🎯 Cas d'usage

### Pour les décideurs (ONP, INRH, Ministère)
- Visualiser l'état actuel des arrêts biologiques sur l'ensemble du littoral
- Consulter les prédictions IA pour anticiper les futures décisions
- Comprendre les zones à risque grâce aux signaux détaillés

### Pour les pêcheurs et armateurs
- Vérifier les zones autorisées et interdites en temps réel
- Consulter les recommandations scientifiques par espèce
- Planifier les campagnes de pêche en fonction des prévisions

### Pour les chercheurs (INRH, universités)
- Accéder aux données océanographiques en temps réel
- Croiser les prédictions IA avec les mesures réglementaires
- Évaluer l'impact des arrêts biologiques sur les stocks

---

## 🔮 Prochaines améliorations possibles

- [ ] Ajout de polygones pour délimiter les zones réglementaires (Atlantique Nord/Centre/Sud)
- [ ] Affichage des routes de migration des espèces pélagiques
- [ ] Historique des arrêts biologiques sur 5 ans avec timeline interactive
- [ ] Intégration de données de captures réelles (API ONP)
- [ ] Export des données cartographiques au format GeoJSON
- [ ] Mode comparaison : 2025 vs 2026 (prédictions vs réalité)

---

**Document généré le 29 mars 2026**
**BAHRIA v1.2.1 — Hackathon RamadanIA 2026 — Dakhla**
**NEGAM SAS / Smart Sailors**
