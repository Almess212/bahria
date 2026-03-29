# Guide d'utilisation des Datasets BAHRIA Cam

## 📚 Vue d'ensemble

Ce guide explique comment télécharger, convertir et utiliser les 6 datasets prioritaires identifiés pour l'entraînement de BAHRIA Cam.

**Datasets intégrés dans l'application :**
- ✅ Métadonnées complètes de 6 datasets (1.9M+ images totales)
- ✅ Interface de téléchargement dans `/dataset-library`
- ✅ Mapping espèces Dakhla → Datasets publics
- ✅ Plan d'entraînement recommandé

---

## 🎯 Datasets prioritaires (★★★★★)

### 1. Deep Vision Pelagic Dataset
**Téléchargement depuis l'app** : Menu "Bibliothèque" → Deep Vision Pelagic → Télécharger

```bash
# Téléchargement manuel
wget https://doi.org/10.1002/gdj3.114  # Lien dans l'article
# Extraire dans ~/bahria-cam/data/deep-vision-pelagic/

# Structure attendue :
~/bahria-cam/data/deep-vision-pelagic/
├── images/
│   ├── train/
│   └── val/
├── annotations/
│   ├── train.json  # Format COCO
│   └── val.json
└── synthetic_generator/  # Outil bonus
```

**Contenu** :
- 1,879 images annotées
- Espèces : Hareng (→ sardine), Maquereau, Merlan bleu
- Format : COCO + Outil de génération d'images synthétiques

**Conversion en YOLO** :
```python
from ultralytics.data.converter import convert_coco

convert_coco(
    labels_dir='~/bahria-cam/data/deep-vision-pelagic/annotations/',
    save_dir='~/bahria-cam/data/deep-vision-pelagic/yolo/',
    use_segments=False,
    cls91to80=False
)
```

---

### 2. DeepFish — Fish Market Instance Segmentation
**Téléchargement depuis l'app** : Menu "Bibliothèque" → DeepFish → Télécharger

```bash
# Téléchargement depuis Figshare
wget https://figshare.com/ndownloader/files/XXXXXX -O deepfish.zip
unzip deepfish.zip -d ~/bahria-cam/data/deepfish/

# Structure attendue :
~/bahria-cam/data/deepfish/
├── images/
├── masks/  # Masques de segmentation
├── annotations.json  # Format COCO
└── size_measurements.csv  # Mesures de taille
```

**Contenu** :
- 1,291 images, 7,339 spécimens
- 59 espèces méditerranéennes (dont Sardina pilchardus, Scomber, Trachurus, Engraulis)
- **Segmentation d'instance pixel-level**
- **Mesures de taille incluses** → parfait pour module d'estimation

**Filtrer les espèces pertinentes** :
```python
import json

with open('~/bahria-cam/data/deepfish/annotations.json') as f:
    data = json.load(f)

# Garder uniquement les espèces cibles Dakhla
TARGET_SPECIES = [
    'Sardina pilchardus',
    'Scomber scombrus',
    'Scomber colias',
    'Trachurus trachurus',
    'Trachurus mediterraneus',
    'Engraulis encrasicolus'
]

filtered_anns = [
    ann for ann in data['annotations']
    if ann['species_name'] in TARGET_SPECIES
]

# Sauvegarder le dataset filtré
filtered_data = {
    'images': data['images'],
    'annotations': filtered_anns,
    'categories': data['categories']
}

with open('~/bahria-cam/data/deepfish/annotations_filtered.json', 'w') as f:
    json.dump(filtered_data, f)
```

---

### 3. Roboflow Fish Detect
**Téléchargement depuis l'app** : Menu "Bibliothèque" → Roboflow Fish Detect → Télécharger

```bash
# Téléchargement via API Roboflow
pip install roboflow

python << EOF
from roboflow import Roboflow
rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("mathi-odfg0").project("fish-detect-okobf")
dataset = project.version(1).download("yolov8")
EOF

# Le dataset est automatiquement converti en format YOLO
```

**Contenu** :
- ~500 images (sardine, maquereau, anchois, thon)
- **Format YOLO natif** — prêt à l'emploi
- Export automatique avec augmentation

---

## 🚀 Datasets pour pré-entraînement

### 4. Community Fish Detection (LILA BC) — 1.9M images
**Utilisation** : Pré-entraîner un détecteur générique "fish" avant fine-tuning

```bash
# Télécharger depuis LILA BC
wget https://lila.science/datasets/community-fish-detection-dataset/
# ~85 Go — prévoir du temps et de l'espace

# Échantillonnage recommandé (100k images au lieu de 1.9M)
python scripts/sample_dataset.py \
    --input ~/bahria-cam/data/community-fish/ \
    --output ~/bahria-cam/data/community-fish-100k/ \
    --sample_size 100000 \
    --stratified
```

**Entraînement Phase 1** :
```python
from ultralytics import YOLO

model = YOLO('yolov8m-seg.pt')  # Modèle pré-entraîné COCO

# Pré-entraîner sur Community Fish (détection générique)
results = model.train(
    data='~/bahria-cam/data/community-fish-100k/data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    project='bahria-cam',
    name='pretrain_fish_generic'
)
```

---

## 📋 Plan d'entraînement complet

### Phase 1 : Pré-entraînement (50 epochs) — 2-3 jours
**Dataset** : Community Fish Detection (100k échantillon)
**Objectif** : Détecteur générique "fish"

```bash
python train_phase1_pretraining.py
```

### Phase 2 : Fine-tuning pélagique (100 epochs) — 3-4 jours
**Datasets fusionnés** : Deep Vision + DeepFish (filtré) + Roboflow
**Objectif** : Classification espèces pélagiques Dakhla

```bash
# Fusionner les datasets
python scripts/merge_datasets.py \
    --datasets deep-vision-pelagic deepfish roboflow-fish-detect \
    --output ~/bahria-cam/data/pelagic_merged/

# Fine-tuning
python train_phase2_finetune.py
```

**data.yaml pour le dataset fusionné** :
```yaml
path: ~/bahria-cam/data/pelagic_merged
train: images/train
val: images/val
test: images/test

nc: 5
names:
  0: sardine
  1: maquereau
  2: chinchard
  3: anchois
  4: seiche
```

### Phase 3 : Adaptation terrain (50 epochs) — 2 jours
**Dataset** : Images réelles MFQF Dakhla (quand disponibles)
**Objectif** : Modèle production optimisé usine

```bash
python train_phase3_production.py
```

---

## 🛠️ Scripts d'automatisation

### Téléchargement automatique de tous les datasets prioritaires

```bash
# Script fourni dans l'app
python scripts/download_all_datasets.py \
    --priority 5 \
    --output ~/bahria-cam/data/
```

### Conversion batch COCO → YOLO

```bash
python scripts/batch_convert_coco_to_yolo.py \
    --input_dir ~/bahria-cam/data/ \
    --recursive
```

### Fusion des datasets

```bash
python scripts/merge_datasets.py \
    --datasets deep-vision-pelagic deepfish roboflow-fish-detect \
    --output ~/bahria-cam/data/pelagic_merged/ \
    --split train:0.7 val:0.2 test:0.1 \
    --balance_classes
```

---

## 📊 Mapping espèces

| Espèce BAHRIA Cam | Deep Vision | DeepFish | Roboflow | Notes |
|-------------------|-------------|----------|----------|-------|
| **Sardine** | Hareng atlantique | Sardina pilchardus | Sardine | Clupéidé similaire |
| **Maquereau** | Maquereau atlantique | Scomber scombrus/colias | Mackerel | Espèce identique |
| **Chinchard** | — | Trachurus trachurus/med. | — | DeepFish uniquement |
| **Anchois** | — | Engraulis encrasicolus | Anchovy | DeepFish + Roboflow |
| **Seiche** | — | Sepia officinalis | — | À compléter |

---

## 🔧 Configuration recommandée

### Hardware minimum
- **GPU** : NVIDIA RTX 3090 (24 GB VRAM) ou supérieur
- **RAM** : 64 GB
- **Stockage** : 500 GB SSD (datasets + checkpoints)

### Environnement Python
```bash
conda create -n bahria-cam python=3.10
conda activate bahria-cam

pip install ultralytics==8.2.0
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install albumentations roboflow supervision opencv-python-headless
```

---

## 📈 Métriques de succès attendues

### Phase 1 (Pré-entraînement)
- mAP50 > 0.70 (détection générique "fish")

### Phase 2 (Fine-tuning pélagique)
- mAP50 > 0.85
- Précision classification > 0.90
- Recall > 0.85

### Phase 3 (Production)
- Erreur identification espèce < 5%
- Erreur estimation taille < ±1.5 cm
- FPS Jetson Orin Nano > 15

---

## 🆘 Support

Pour toute question sur l'utilisation des datasets :
1. Consulter la page **Bibliothèque** dans l'app BAHRIA
2. Voir le **Plan technique d'entraînement IA** (document complet)
3. Contacter l'équipe dev NEGAM SAS

---

**Document mis à jour** : Mars 2026
**Version BAHRIA Cam** : v1.2.1
