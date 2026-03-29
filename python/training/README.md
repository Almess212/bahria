# BAHRIA Cam — Pipeline d'entraînement

Scripts complets pour entraîner le modèle de vision par ordinateur BAHRIA Cam (YOLOv8-seg).

---

## 📦 Installation

### 1. Environnement Python

```bash
# Créer l'environnement
conda create -n bahria-cam python=3.10
conda activate bahria-cam

# Installer les dépendances
cd python/training
pip install -r requirements.txt

# Installer PyTorch avec CUDA 12.1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### 2. Vérifier l'installation

```bash
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA: {torch.cuda.is_available()}')"
python -c "from ultralytics import YOLO; print('Ultralytics OK')"
```

---

## 🚀 Utilisation

### Pipeline complet en 3 phases

```bash
# Phase 1: Pré-entraînement (2-3 jours)
python phase1_pretrain.py

# Phase 2: Fine-tuning pélagique (3-4 jours)
python phase2_finetune.py

# Phase 3: Adaptation production (1-2 jours)
python phase3_production.py
```

### Phase 1 — Pré-entraînement détection générique

**Dataset**: Community Fish Detection (1.9M images)
**Objectif**: Détecteur générique "fish"

```bash
# Télécharger le dataset
wget https://lila.science/datasets/community-fish-detection-dataset/

# Convertir en YOLO
python utils/coco_to_yolo.py \
  --input ~/bahria-cam/data/community-fish-detection/annotations.json \
  --output ~/bahria-cam/data/community-fish-detection/labels/

# Lancer l'entraînement
python phase1_pretrain.py
```

**Sortie**: `~/bahria-cam/models/phase1_pretrain_best.pt`

---

### Phase 2 — Fine-tuning pélagique

**Datasets**: Deep Vision + DeepFish + Roboflow (fusionnés)
**Objectif**: Classification espèces Dakhla (sardine, maquereau, chinchard, anchois, seiche)

```bash
# Fusionner les datasets (automatique si déjà téléchargés)
python utils/merge_datasets.py \
  --datasets deep-vision-pelagic deepfish roboflow-fish-detect \
  --output pelagic_merged

# Lancer le fine-tuning
python phase2_finetune.py
```

**Sortie**: `~/bahria-cam/models/phase2_finetune_best.pt`

---

### Phase 3 — Production Dakhla

**Dataset**: Images réelles MFQF Dakhla
**Objectif**: Modèle production optimisé Jetson Orin Nano

```bash
# Lancer l'adaptation (quand dataset Dakhla disponible)
python phase3_production.py
```

**Sorties**:
- `~/bahria-cam/models/bahria_cam_production.pt` (PyTorch)
- `~/bahria-cam/models/bahria_cam_production.engine` (TensorRT)
- `~/bahria-cam/models/bahria_cam_production.onnx` (ONNX)

---

## 🛠️ Scripts utilitaires

### Conversion COCO → YOLO

```bash
python utils/coco_to_yolo.py \
  --input /path/to/coco/annotations.json \
  --output /path/to/yolo/labels/
```

### Fusion de datasets

```bash
python utils/merge_datasets.py \
  --datasets deep-vision-pelagic deepfish roboflow-fish-detect \
  --output ~/bahria-cam/data/pelagic_merged/ \
  --split train:0.7 val:0.2 test:0.1
```

---

## 📊 Métriques de succès

| Phase | mAP50 | Precision | Recall | Durée |
|-------|-------|-----------|--------|-------|
| Phase 1 | > 0.70 | — | — | 2-3 jours |
| Phase 2 | > 0.85 | > 0.90 | > 0.85 | 3-4 jours |
| Phase 3 | > 0.90 | > 0.92 | > 0.88 | 1-2 jours |

---

## 🖥️ Hardware recommandé

### Entraînement
- **GPU**: NVIDIA RTX 3090 (24 GB VRAM) ou supérieur
- **RAM**: 64 GB
- **Stockage**: 500 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Déploiement (usine)
- **Edge device**: NVIDIA Jetson Orin Nano 8GB
- **Caméra**: GigE Vision industrielle (FLIR, Basler)
- **Éclairage**: LED 5000K anti-reflet
- **FPS cible**: > 15 FPS

---

## 📁 Structure des fichiers

```
training/
├── config.py                   # Configuration centrale
├── requirements.txt            # Dépendances Python
├── phase1_pretrain.py          # Phase 1: Pré-entraînement
├── phase2_finetune.py          # Phase 2: Fine-tuning pélagique
├── phase3_production.py        # Phase 3: Production Dakhla
├── utils/
│   ├── __init__.py
│   ├── coco_to_yolo.py         # Conversion COCO → YOLO
│   ├── merge_datasets.py       # Fusion datasets
│   └── evaluate.py             # Évaluation modèle
└── README.md                   # Ce fichier
```

---

## 🔧 Configuration

Modifier `config.py` pour ajuster :

- Chemins des datasets
- Hyperparamètres d'entraînement
- Augmentation des données
- Mapping espèces
- Coefficients allométriques (L→W)

**Exemple** : Changer le learning rate de Phase 2

```python
# Dans config.py
PHASE2_CONFIG = {
    "lr0": 0.0005,  # Défaut
    # ...
}

# Pour un learning rate plus élevé
PHASE2_CONFIG["lr0"] = 0.001
```

---

## 📈 Monitoring (optionnel)

### Weights & Biases

```bash
pip install wandb
wandb login

# Ajouter dans phase1_pretrain.py
PHASE1_CONFIG["wandb"] = True
```

### TensorBoard

```bash
tensorboard --logdir ~/bahria-cam/results/
```

---

## ⚠️ Dépannage

### OOM (Out of Memory)

```python
# Réduire batch_size dans config.py
PHASE1_CONFIG["batch"] = 8  # Au lieu de 16
PHASE2_CONFIG["batch"] = 8
```

### Dataset non trouvé

```bash
# Vérifier la structure
ls -R ~/bahria-cam/data/community-fish-detection/

# Doit contenir:
#   images/train/, images/val/
#   labels/train/, labels/val/
#   data.yaml
```

### GPU non détecté

```bash
# Vérifier CUDA
nvidia-smi
python -c "import torch; print(torch.cuda.is_available())"

# Réinstaller PyTorch avec CUDA
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## 📚 Ressources

- **Plan technique complet**: `DATASETS_GUIDE.md` (racine du projet)
- **Datasets**: [Bibliothèque dans l'app BAHRIA](/dataset-library)
- **Ultralytics Docs**: https://docs.ultralytics.com
- **YOLOv8**: https://github.com/ultralytics/ultralytics
- **FishBase** (coefficients allométriques): https://www.fishbase.org

---

## 👥 Support

Pour toute question :
- Consulter `DATASETS_GUIDE.md`
- Vérifier les logs : `~/bahria-cam/results/training.log`
- Contacter l'équipe dev NEGAM SAS

---

**BAHRIA Cam v1.2.1 — Mars 2026**
