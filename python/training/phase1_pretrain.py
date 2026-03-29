"""
BAHRIA Cam — Phase 1: Pré-entraînement
Entraîner un détecteur générique "fish" sur Community Fish Detection Dataset (1.9M images)
"""
import logging
from pathlib import Path
from ultralytics import YOLO
import torch

from config import (
    PHASE1_CONFIG,
    SUCCESS_METRICS,
    COMMUNITY_FISH_DIR,
    MODELS_DIR,
    LOGGING_CONFIG
)

# Setup logging
logging.basicConfig(
    level=LOGGING_CONFIG["level"],
    format=LOGGING_CONFIG["format"],
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOGGING_CONFIG["file"])
    ]
)
logger = logging.getLogger(__name__)


def check_dataset():
    """Vérifier que le dataset Community Fish est téléchargé et converti en YOLO."""
    data_yaml = COMMUNITY_FISH_DIR / "data.yaml"

    if not data_yaml.exists():
        logger.error(f"Dataset non trouvé: {data_yaml}")
        logger.error("Télécharger Community Fish Detection depuis:")
        logger.error("https://lila.science/datasets/community-fish-detection-dataset/")
        logger.error("\nPuis convertir en format YOLO avec:")
        logger.error("python utils/coco_to_yolo.py --input community-fish-detection/")
        return False

    logger.info(f"✓ Dataset trouvé: {data_yaml}")
    return True


def check_gpu():
    """Vérifier la disponibilité du GPU."""
    if not torch.cuda.is_available():
        logger.warning("⚠ GPU non détecté. L'entraînement sera TRÈS lent sur CPU.")
        logger.warning("Recommandé: NVIDIA RTX 3090+ avec 24GB VRAM")
        return False

    gpu_name = torch.cuda.get_device_name(0)
    gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9

    logger.info(f"✓ GPU détecté: {gpu_name}")
    logger.info(f"  VRAM: {gpu_memory:.1f} GB")

    if gpu_memory < 16:
        logger.warning(f"⚠ VRAM faible ({gpu_memory:.1f} GB). Réduire batch_size si OOM.")

    return True


def train_phase1():
    """Entraîner Phase 1: Pré-entraînement détection générique."""
    logger.info("=" * 80)
    logger.info("BAHRIA CAM — PHASE 1: PRÉ-ENTRAÎNEMENT DÉTECTION GÉNÉRIQUE")
    logger.info("=" * 80)

    # Vérifications
    if not check_dataset():
        return None

    check_gpu()

    # Charger le modèle pré-entraîné COCO
    logger.info(f"\n📦 Chargement du modèle: {PHASE1_CONFIG['model']}")
    model = YOLO(PHASE1_CONFIG['model'])

    # Info modèle
    logger.info(f"  Architecture: YOLOv8m-seg")
    logger.info(f"  Paramètres: ~27M")
    logger.info(f"  Pré-entraîné sur: MS COCO (80 classes)")

    # Paramètres d'entraînement
    logger.info(f"\n⚙️ Configuration d'entraînement:")
    logger.info(f"  Epochs: {PHASE1_CONFIG['epochs']}")
    logger.info(f"  Batch size: {PHASE1_CONFIG['batch']}")
    logger.info(f"  Image size: {PHASE1_CONFIG['imgsz']}")
    logger.info(f"  Learning rate: {PHASE1_CONFIG['lr0']} → {PHASE1_CONFIG['lrf']}")
    logger.info(f"  Warmup epochs: {PHASE1_CONFIG['warmup_epochs']}")

    logger.info(f"\n🎨 Augmentation:")
    logger.info(f"  HSV: h={PHASE1_CONFIG['hsv_h']}, s={PHASE1_CONFIG['hsv_s']}, v={PHASE1_CONFIG['hsv_v']}")
    logger.info(f"  Rotation: ±{PHASE1_CONFIG['degrees']}°")
    logger.info(f"  Mosaic: {PHASE1_CONFIG['mosaic']}, Mixup: {PHASE1_CONFIG['mixup']}")

    logger.info(f"\n🎯 Objectif:")
    logger.info(f"  Entraîner un détecteur générique 'fish' sur 1.9M images")
    logger.info(f"  Métrique cible: mAP50 > {SUCCESS_METRICS['phase1']['map50_min']}")

    logger.info("\n🚀 Lancement de l'entraînement...")
    logger.info("   (Durée estimée: 2-3 jours sur RTX 3090)\n")

    try:
        # Entraînement
        results = model.train(**PHASE1_CONFIG)

        logger.info("\n" + "=" * 80)
        logger.info("✓ PHASE 1 TERMINÉE")
        logger.info("=" * 80)

        # Métriques finales
        final_map50 = results.box.map50 if hasattr(results, 'box') else 0
        final_map = results.box.map if hasattr(results, 'box') else 0

        logger.info(f"\n📊 Métriques finales:")
        logger.info(f"  mAP50:    {final_map50:.3f}")
        logger.info(f"  mAP50-95: {final_map:.3f}")

        # Vérifier le succès
        success = final_map50 >= SUCCESS_METRICS['phase1']['map50_min']

        if success:
            logger.info(f"\n🎉 ✓ SUCCÈS — Objectif atteint (mAP50 > {SUCCESS_METRICS['phase1']['map50_min']})")
        else:
            logger.warning(f"\n⚠ ÉCHEC — Objectif non atteint")
            logger.warning(f"   mAP50 actuel: {final_map50:.3f}")
            logger.warning(f"   mAP50 cible:  {SUCCESS_METRICS['phase1']['map50_min']}")
            logger.warning("\nActions recommandées:")
            logger.warning("  - Augmenter le nombre d'epochs (100+)")
            logger.warning("  - Vérifier la qualité des annotations")
            logger.warning("  - Essayer YOLOv8x-seg (plus gros modèle)")

        # Sauvegarder le meilleur modèle
        best_model_path = Path(PHASE1_CONFIG['project']) / PHASE1_CONFIG['name'] / "weights" / "best.pt"
        output_path = MODELS_DIR / "phase1_pretrain_best.pt"

        if best_model_path.exists():
            import shutil
            shutil.copy(best_model_path, output_path)
            logger.info(f"\n💾 Modèle sauvegardé: {output_path}")
            logger.info(f"   À utiliser pour Phase 2: Fine-tuning pélagique")
        else:
            logger.error(f"\n❌ Modèle non trouvé: {best_model_path}")

        logger.info(f"\n📁 Résultats complets: {Path(PHASE1_CONFIG['project']) / PHASE1_CONFIG['name']}")

        return results

    except Exception as e:
        logger.error(f"\n❌ ERREUR durant l'entraînement:")
        logger.error(f"   {str(e)}")
        logger.error("\nActions de dépannage:")
        logger.error("  1. Vérifier que le GPU est disponible")
        logger.error("  2. Réduire batch_size si OOM (out of memory)")
        logger.error("  3. Vérifier le format du dataset (data.yaml)")
        logger.error("  4. Consulter les logs: training.log")
        raise


def main():
    """Point d'entrée principal."""
    print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    BAHRIA CAM — PHASE 1 TRAINING                         ║
║                   Pré-entraînement détection générique                   ║
║                                                                           ║
║  Dataset:  Community Fish Detection (1.9M images)                        ║
║  Objectif: Détecteur générique "fish"                                    ║
║  Durée:    2-3 jours (RTX 3090)                                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    """)

    results = train_phase1()

    if results:
        print("\n✓ Phase 1 terminée avec succès!")
        print("\nProchaine étape:")
        print("  python phase2_finetune.py")


if __name__ == "__main__":
    main()
