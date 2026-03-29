"""
BAHRIA Cam — Phase 2: Fine-tuning pélagique
Fine-tuner sur Deep Vision + DeepFish + Roboflow pour classification espèces Dakhla
"""
import logging
from pathlib import Path
from ultralytics import YOLO
import torch

from config import (
    PHASE2_CONFIG,
    SUCCESS_METRICS,
    PELAGIC_MERGED_DIR,
    MODELS_DIR,
    BAHRIA_CLASSES,
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


def check_pretrained_model():
    """Vérifier que le modèle de Phase 1 existe."""
    phase1_model = MODELS_DIR / "phase1_pretrain_best.pt"

    if not phase1_model.exists():
        logger.error(f"❌ Modèle Phase 1 non trouvé: {phase1_model}")
        logger.error("\nVous devez d'abord exécuter:")
        logger.error("  python phase1_pretrain.py")
        logger.error("\nOu télécharger un modèle pré-entraîné depuis:")
        logger.error("  https://github.com/ultralytics/assets/releases")
        return False

    logger.info(f"✓ Modèle Phase 1 trouvé: {phase1_model}")
    return phase1_model


def check_dataset():
    """Vérifier que le dataset pélagique fusionné existe."""
    data_yaml = PELAGIC_MERGED_DIR / "data.yaml"

    if not data_yaml.exists():
        logger.error(f"❌ Dataset pélagique fusionné non trouvé: {data_yaml}")
        logger.error("\nVous devez d'abord fusionner les datasets:")
        logger.error("  python utils/merge_datasets.py \\")
        logger.error("    --datasets deep-vision-pelagic deepfish roboflow-fish-detect \\")
        logger.error("    --output pelagic_merged")
        return False

    logger.info(f"✓ Dataset trouvé: {data_yaml}")
    return True


def print_species_distribution(data_yaml):
    """Afficher la distribution des espèces dans le dataset."""
    import yaml

    try:
        with open(data_yaml) as f:
            data = yaml.safe_load(f)

        logger.info("\n🐟 Classes du dataset:")
        for idx, name in data.get('names', {}).items():
            logger.info(f"  [{idx}] {name}")

    except Exception as e:
        logger.warning(f"Impossible de lire data.yaml: {e}")


def train_phase2():
    """Entraîner Phase 2: Fine-tuning pélagique."""
    logger.info("=" * 80)
    logger.info("BAHRIA CAM — PHASE 2: FINE-TUNING PÉLAGIQUE")
    logger.info("=" * 80)

    # Vérifications
    phase1_model = check_pretrained_model()
    if not phase1_model:
        return None

    if not check_dataset():
        return None

    # Afficher les espèces
    print_species_distribution(PELAGIC_MERGED_DIR / "data.yaml")

    # Charger le modèle Phase 1
    logger.info(f"\n📦 Chargement du modèle Phase 1: {phase1_model}")
    model = YOLO(str(phase1_model))

    # Configuration
    logger.info(f"\n⚙️ Configuration de fine-tuning:")
    logger.info(f"  Epochs: {PHASE2_CONFIG['epochs']}")
    logger.info(f"  Batch size: {PHASE2_CONFIG['batch']}")
    logger.info(f"  Image size: {PHASE2_CONFIG['imgsz']}")
    logger.info(f"  Learning rate: {PHASE2_CONFIG['lr0']} → {PHASE2_CONFIG['lrf']}")
    logger.info(f"  Warmup epochs: {PHASE2_CONFIG['warmup_epochs']}")
    logger.info(f"  Freeze backbone: {PHASE2_CONFIG['freeze']} premières couches")

    logger.info(f"\n🎨 Augmentation (adaptée usine):")
    logger.info(f"  HSV: h={PHASE2_CONFIG['hsv_h']}, s={PHASE2_CONFIG['hsv_s']}, v={PHASE2_CONFIG['hsv_v']}")
    logger.info(f"  Rotation: 360° (poissons dans toutes orientations)")
    logger.info(f"  Flip: LR + UD (poissons en vrac)")
    logger.info(f"  Copy-paste: {PHASE2_CONFIG['copy_paste']} (simule vrac)")

    logger.info(f"\n🎯 Objectifs:")
    logger.info(f"  mAP50 > {SUCCESS_METRICS['phase2']['map50_min']}")
    logger.info(f"  Precision > {SUCCESS_METRICS['phase2']['precision_min']}")
    logger.info(f"  Recall > {SUCCESS_METRICS['phase2']['recall_min']}")

    logger.info("\n🚀 Lancement du fine-tuning...")
    logger.info("   (Durée estimée: 3-4 jours sur RTX 3090)\n")

    try:
        # Mettre à jour la config avec le modèle Phase 1
        config = PHASE2_CONFIG.copy()
        config['model'] = str(phase1_model)

        # Entraînement
        results = model.train(**config)

        logger.info("\n" + "=" * 80)
        logger.info("✓ PHASE 2 TERMINÉE")
        logger.info("=" * 80)

        # Métriques finales
        final_map50 = results.box.map50 if hasattr(results, 'box') else 0
        final_map = results.box.map if hasattr(results, 'box') else 0
        final_precision = results.box.mp if hasattr(results, 'box') else 0
        final_recall = results.box.mr if hasattr(results, 'box') else 0

        logger.info(f"\n📊 Métriques finales:")
        logger.info(f"  mAP50:     {final_map50:.3f}")
        logger.info(f"  mAP50-95:  {final_map:.3f}")
        logger.info(f"  Precision: {final_precision:.3f}")
        logger.info(f"  Recall:    {final_recall:.3f}")

        # Métriques par espèce
        if hasattr(results, 'box'):
            logger.info(f"\n📊 Performance par espèce:")
            for i, name in BAHRIA_CLASSES.items():
                if i < len(results.box.ap50):
                    ap50 = results.box.ap50[i]
                    logger.info(f"  {name:12s}: AP50={ap50:.3f}")

        # Vérifier le succès
        success = (
            final_map50 >= SUCCESS_METRICS['phase2']['map50_min'] and
            final_precision >= SUCCESS_METRICS['phase2']['precision_min'] and
            final_recall >= SUCCESS_METRICS['phase2']['recall_min']
        )

        if success:
            logger.info(f"\n🎉 ✓ SUCCÈS — Tous les objectifs atteints!")
        else:
            logger.warning(f"\n⚠ ÉCHEC — Certains objectifs non atteints")
            logger.warning(f"\nMétriques actuelles vs cibles:")
            logger.warning(f"  mAP50:     {final_map50:.3f} / {SUCCESS_METRICS['phase2']['map50_min']}")
            logger.warning(f"  Precision: {final_precision:.3f} / {SUCCESS_METRICS['phase2']['precision_min']}")
            logger.warning(f"  Recall:    {final_recall:.3f} / {SUCCESS_METRICS['phase2']['recall_min']}")
            logger.warning("\nActions recommandées:")
            logger.warning("  - Continuer l'entraînement (epochs +50)")
            logger.warning("  - Vérifier la qualité des annotations")
            logger.warning("  - Augmenter le dataset (plus d'images)")
            logger.warning("  - Essayer YOLOv8x-seg (modèle plus gros)")

        # Sauvegarder le meilleur modèle
        best_model_path = Path(PHASE2_CONFIG['project']) / PHASE2_CONFIG['name'] / "weights" / "best.pt"
        output_path = MODELS_DIR / "phase2_finetune_best.pt"

        if best_model_path.exists():
            import shutil
            shutil.copy(best_model_path, output_path)
            logger.info(f"\n💾 Modèle sauvegardé: {output_path}")
            logger.info(f"   À utiliser pour Phase 3: Production Dakhla")
        else:
            logger.error(f"\n❌ Modèle non trouvé: {best_model_path}")

        # Matrice de confusion
        confusion_matrix_path = Path(PHASE2_CONFIG['project']) / PHASE2_CONFIG['name'] / "confusion_matrix.png"
        if confusion_matrix_path.exists():
            logger.info(f"\n📊 Matrice de confusion: {confusion_matrix_path}")

        logger.info(f"\n📁 Résultats complets: {Path(PHASE2_CONFIG['project']) / PHASE2_CONFIG['name']}")

        return results

    except Exception as e:
        logger.error(f"\n❌ ERREUR durant l'entraînement:")
        logger.error(f"   {str(e)}")
        logger.error("\nActions de dépannage:")
        logger.error("  1. Vérifier que le GPU est disponible")
        logger.error("  2. Réduire batch_size si OOM")
        logger.error("  3. Vérifier le format du dataset fusionné")
        logger.error("  4. Consulter les logs: training.log")
        raise


def main():
    """Point d'entrée principal."""
    print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    BAHRIA CAM — PHASE 2 TRAINING                         ║
║                      Fine-tuning pélagique Dakhla                        ║
║                                                                           ║
║  Datasets: Deep Vision + DeepFish + Roboflow (fusionnés)                ║
║  Classes:  Sardine, Maquereau, Chinchard, Anchois, Seiche               ║
║  Durée:    3-4 jours (RTX 3090)                                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    """)

    results = train_phase2()

    if results:
        print("\n✓ Phase 2 terminée avec succès!")
        print("\nProchaine étape:")
        print("  python phase3_production.py")
        print("\nOu tester le modèle:")
        print("  python utils/evaluate.py --model phase2_finetune_best.pt")


if __name__ == "__main__":
    main()
