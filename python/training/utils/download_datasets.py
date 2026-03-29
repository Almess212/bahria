"""
Script pour télécharger les datasets d'entraînement BAHRIA Cam
"""
import argparse
import os
import sys
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# Métadonnées des datasets
DATASETS = {
    'deep-vision-pelagic': {
        'name': 'Deep Vision Pelagic Dataset',
        'size_gb': 0.85,
        'images': 1879,
        'url': 'https://doi.org/10.1002/gdj3.114',
        'format': 'COCO',
        'notes': 'Nécessite téléchargement manuel depuis DOI'
    },
    'deepfish': {
        'name': 'DeepFish Dataset',
        'size_gb': 3.5,
        'images': 40000,
        'url': 'https://alzayats.github.io/DeepFish/',
        'format': 'COCO',
        'notes': 'Segmentation + classification, 20 espèces marines'
    },
    'roboflow-fish-detect': {
        'name': 'Roboflow Fish Detection',
        'size_gb': 1.2,
        'images': 15000,
        'url': 'https://universe.roboflow.com/fish-detection',
        'format': 'YOLO',
        'api': 'roboflow',
        'notes': 'Nécessite clé API Roboflow'
    },
    'community-fish-detection': {
        'name': 'Community Fish Detection Dataset',
        'size_gb': 180,
        'images': 1900000,
        'url': 'https://lila.science/datasets/community-fish-detection-dataset/',
        'format': 'COCO',
        'notes': 'Dataset massif (180 GB), téléchargement par chunks recommandé'
    },
    'fishnet': {
        'name': 'FishNet Open Images Dataset',
        'size_gb': 5.0,
        'images': 34000,
        'url': 'https://github.com/alzayats/DeepFish',
        'format': 'COCO',
        'notes': 'Extraction depuis Open Images, 5 classes de poissons'
    },
    'noaa-puget-sound': {
        'name': 'NOAA Labeled Fishes - Puget Sound',
        'size_gb': 12.0,
        'images': 50000,
        'url': 'https://lila.science/datasets/noaa-puget-sound-labeled-fishes/',
        'format': 'COCO',
        'notes': 'Images sous-marines haute qualité, 30 espèces'
    }
}


def download_roboflow_dataset(dataset_id, api_key, output_dir):
    """Télécharger un dataset depuis Roboflow."""
    try:
        from roboflow import Roboflow
    except ImportError:
        logger.error("❌ Module 'roboflow' non installé")
        logger.error("   Installation: pip install roboflow")
        return False

    logger.info(f"🔄 Téléchargement depuis Roboflow...")
    logger.info(f"   Dataset: {dataset_id}")

    try:
        rf = Roboflow(api_key=api_key)
        project = rf.workspace().project(dataset_id)
        dataset = project.version(1).download("yolov8", location=output_dir)

        logger.info(f"✓ Téléchargement terminé: {dataset.location}")
        return True

    except Exception as e:
        logger.error(f"❌ Erreur Roboflow: {e}")
        return False


def download_dataset(dataset_key, output_dir, api_key=None):
    """
    Télécharger un dataset.

    Args:
        dataset_key: Clé du dataset (ex: 'deep-vision-pelagic')
        output_dir: Dossier de sortie
        api_key: Clé API (si nécessaire)
    """
    if dataset_key not in DATASETS:
        logger.error(f"❌ Dataset inconnu: {dataset_key}")
        logger.error(f"   Datasets disponibles: {', '.join(DATASETS.keys())}")
        return False

    dataset = DATASETS[dataset_key]
    output_dir = Path(output_dir) / dataset_key
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("=" * 80)
    logger.info(f"📦 {dataset['name']}")
    logger.info("=" * 80)
    logger.info(f"  Taille: {dataset['size_gb']} GB")
    logger.info(f"  Images: {dataset['images']:,}")
    logger.info(f"  Format: {dataset['format']}")
    logger.info(f"  Output: {output_dir}")
    logger.info("")

    # Téléchargement selon le type
    if dataset.get('api') == 'roboflow':
        if not api_key:
            logger.error("❌ Clé API Roboflow requise")
            logger.error("   Usage: --api-key YOUR_KEY")
            logger.error("   Obtenir une clé: https://roboflow.com")
            return False

        return download_roboflow_dataset(dataset_key, api_key, output_dir)

    else:
        # Téléchargement manuel
        logger.warning("⚠ Ce dataset nécessite un téléchargement manuel")
        logger.warning(f"   URL: {dataset['url']}")
        logger.warning(f"   Notes: {dataset['notes']}")
        logger.warning("")
        logger.warning("Étapes:")
        logger.warning(f"  1. Télécharger depuis: {dataset['url']}")
        logger.warning(f"  2. Extraire dans: {output_dir}")

        if dataset['format'] == 'COCO':
            logger.warning(f"  3. Convertir en YOLO:")
            logger.warning(f"     python utils/coco_to_yolo.py \\")
            logger.warning(f"       --input {output_dir}/annotations.json \\")
            logger.warning(f"       --output {output_dir}/labels/")

        return False


def list_datasets():
    """Afficher la liste des datasets disponibles."""
    logger.info("=" * 80)
    logger.info("DATASETS DISPONIBLES POUR BAHRIA CAM")
    logger.info("=" * 80)
    logger.info("")

    for key, dataset in DATASETS.items():
        logger.info(f"📦 {key}")
        logger.info(f"   Nom:    {dataset['name']}")
        logger.info(f"   Taille: {dataset['size_gb']} GB")
        logger.info(f"   Images: {dataset['images']:,}")
        logger.info(f"   Format: {dataset['format']}")
        logger.info(f"   URL:    {dataset['url']}")
        logger.info("")

    logger.info("=" * 80)
    logger.info("USAGE")
    logger.info("=" * 80)
    logger.info("")
    logger.info("Télécharger un dataset:")
    logger.info("  python download_datasets.py --dataset deep-vision-pelagic --output ~/bahria-cam/data/")
    logger.info("")
    logger.info("Télécharger depuis Roboflow (nécessite clé API):")
    logger.info("  python download_datasets.py --dataset roboflow-fish-detect --api-key YOUR_KEY --output ~/bahria-cam/data/")
    logger.info("")


def main():
    parser = argparse.ArgumentParser(
        description="Télécharger les datasets d'entraînement BAHRIA Cam"
    )
    parser.add_argument(
        '--list',
        action='store_true',
        help="Lister les datasets disponibles"
    )
    parser.add_argument(
        '--dataset',
        choices=list(DATASETS.keys()),
        help="Dataset à télécharger"
    )
    parser.add_argument(
        '--output',
        default='~/bahria-cam/data/',
        help="Dossier de sortie (défaut: ~/bahria-cam/data/)"
    )
    parser.add_argument(
        '--api-key',
        help="Clé API (pour Roboflow)"
    )

    args = parser.parse_args()

    if args.list or not args.dataset:
        list_datasets()
        sys.exit(0)

    # Résoudre le chemin
    output_dir = Path(args.output).expanduser()

    # Télécharger
    success = download_dataset(args.dataset, output_dir, args.api_key)

    if success:
        logger.info("\n✓ Téléchargement terminé!")
    else:
        logger.info("\n⚠ Téléchargement manuel requis")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
