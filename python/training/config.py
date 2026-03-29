"""
Configuration centrale pour l'entraînement BAHRIA Cam
"""
from pathlib import Path

# === CHEMINS ===
BASE_DIR = Path.home() / "bahria-cam"
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"

# Datasets
COMMUNITY_FISH_DIR = DATA_DIR / "community-fish-detection"
DEEP_VISION_DIR = DATA_DIR / "deep-vision-pelagic"
DEEPFISH_DIR = DATA_DIR / "deepfish"
ROBOFLOW_DIR = DATA_DIR / "roboflow-fish-detect"
PELAGIC_MERGED_DIR = DATA_DIR / "pelagic_merged"
DAKHLA_REAL_DIR = DATA_DIR / "dakhla_real"

# Créer les dossiers
for dir_path in [DATA_DIR, MODELS_DIR, RESULTS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# === MAPPING ESPÈCES ===
SPECIES_MAPPING = {
    # Deep Vision → BAHRIA Cam
    "atlantic_herring": "sardine",
    "atlantic_mackerel": "maquereau",
    "blue_whiting": "merlan_bleu",
    "mesopelagic": None,  # Exclure

    # DeepFish → BAHRIA Cam
    "Sardina pilchardus": "sardine",
    "Scomber scombrus": "maquereau",
    "Scomber colias": "maquereau",
    "Trachurus trachurus": "chinchard",
    "Trachurus mediterraneus": "chinchard",
    "Engraulis encrasicolus": "anchois",
    "Sepia officinalis": "seiche",

    # Roboflow → BAHRIA Cam
    "sardine": "sardine",
    "Mackerel": "maquereau",
    "Anchovy": "anchois",
}

# Classes BAHRIA Cam (ordre important pour YOLOv8)
BAHRIA_CLASSES = {
    0: "sardine",
    1: "maquereau",
    2: "chinchard",
    3: "anchois",
    4: "seiche",
    5: "poulpe",
}

# === HYPERPARAMÈTRES PHASE 1 (Pré-entraînement) ===
PHASE1_CONFIG = {
    "model": "yolov8m-seg.pt",  # Modèle pré-entraîné COCO
    "task": "detect",
    "epochs": 50,
    "imgsz": 640,
    "batch": 16,
    "device": 0,
    "workers": 8,
    "project": str(RESULTS_DIR / "phase1_pretrain"),
    "name": "community_fish_generic",

    # Learning rate
    "lr0": 0.001,
    "lrf": 0.01,
    "warmup_epochs": 3,

    # Augmentation
    "hsv_h": 0.015,
    "hsv_s": 0.7,
    "hsv_v": 0.4,
    "degrees": 15,
    "translate": 0.1,
    "scale": 0.5,
    "fliplr": 0.5,
    "mosaic": 1.0,
    "mixup": 0.1,

    # Data
    "data": str(COMMUNITY_FISH_DIR / "data.yaml"),
}

# === HYPERPARAMÈTRES PHASE 2 (Fine-tuning pélagique) ===
PHASE2_CONFIG = {
    "model": None,  # Sera défini dynamiquement (best.pt de Phase 1)
    "task": "segment",
    "epochs": 100,
    "imgsz": 640,
    "batch": 16,
    "device": 0,
    "workers": 8,
    "project": str(RESULTS_DIR / "phase2_finetune"),
    "name": "pelagic_v1",

    # Learning rate (plus bas pour fine-tuning)
    "lr0": 0.0005,
    "lrf": 0.01,
    "warmup_epochs": 5,
    "freeze": 10,  # Freeze backbone pour le début

    # Augmentation (adaptée conditions usine)
    "hsv_h": 0.02,
    "hsv_s": 0.8,       # Variation saturation (éclairage variable)
    "hsv_v": 0.5,       # Variation luminosité
    "degrees": 180,     # Poissons dans toutes orientations
    "translate": 0.2,
    "scale": 0.6,
    "fliplr": 0.5,
    "flipud": 0.5,      # Retournement vertical (poissons en vrac)
    "mosaic": 1.0,
    "mixup": 0.15,
    "copy_paste": 0.1,  # Simule le vrac

    # Data
    "data": str(PELAGIC_MERGED_DIR / "data.yaml"),
}

# === HYPERPARAMÈTRES PHASE 3 (Production Dakhla) ===
PHASE3_CONFIG = {
    "model": None,  # Sera défini dynamiquement (best.pt de Phase 2)
    "task": "segment",
    "epochs": 50,
    "imgsz": 640,
    "batch": 8,
    "device": 0,
    "workers": 8,
    "project": str(RESULTS_DIR / "phase3_production"),
    "name": "dakhla_v1",

    # Learning rate (très bas — on affine seulement)
    "lr0": 0.0001,
    "lrf": 0.01,
    "warmup_epochs": 3,
    "freeze": 15,  # Freeze plus de couches

    # Augmentation minimale (données réelles déjà représentatives)
    "hsv_h": 0.01,
    "hsv_s": 0.3,
    "hsv_v": 0.3,
    "degrees": 180,
    "mosaic": 0.5,

    # Data
    "data": str(DAKHLA_REAL_DIR / "data.yaml"),
}

# === EXPORT TENSORRT ===
EXPORT_CONFIG = {
    "format": "engine",  # TensorRT pour Jetson
    "imgsz": 640,
    "half": True,        # FP16 — 2x plus rapide
    "device": 0,
    "workspace": 4,      # Go de VRAM
    "simplify": True,
}

# === MÉTRIQUES DE SUCCÈS ===
SUCCESS_METRICS = {
    "phase1": {
        "map50_min": 0.70,
        "map_min": 0.45,
    },
    "phase2": {
        "map50_min": 0.85,
        "map_min": 0.60,
        "precision_min": 0.90,
        "recall_min": 0.85,
    },
    "phase3": {
        "map50_min": 0.90,
        "map_min": 0.65,
        "precision_min": 0.92,
        "recall_min": 0.88,
        "fps_jetson_min": 15,
    }
}

# === COEFFICIENTS ALLOMÉTRIQUES (L→W) ===
# Source: FishBase — longueur totale (cm) → poids (g)
ALLOMETRIC_COEFFICIENTS = {
    "sardine": {"a": 0.0052, "b": 3.12},
    "maquereau": {"a": 0.0035, "b": 3.23},
    "chinchard": {"a": 0.0058, "b": 3.08},
    "anchois": {"a": 0.0042, "b": 3.15},
    "seiche": {"a": 0.0055, "b": 2.95},
    "poulpe": {"a": 0.0048, "b": 2.88},
}

# === LOGGING ===
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "handlers": ["console", "file"],
    "file": str(RESULTS_DIR / "training.log"),
}
