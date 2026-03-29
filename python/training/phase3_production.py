"""
BAHRIA Cam — Phase 3: Adaptation terrain (Production)
Fine-tuner sur images réelles de l'usine MFQF Dakhla pour modèle production
"""
import logging
from pathlib import Path
from ultralytics import YOLO
import torch

from config import (
    PHASE3_CONFIG,
    SUCCESS_METRICS,
    DAKHLA_REAL_DIR,
    MODELS_DIR,
    EXPORT_CONFIG,
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
    """Vérifier que le modèle de Phase 2 existe."""
    phase2_model = MODELS_DIR / "phase2_finetune_best.pt"

    if not phase2_model.exists():
        logger.error(f"❌ Modèle Phase 2 non trouvé: {phase2_model}")
        logger.error("\nVous devez d'abord exécuter:")
        logger.error("  python phase2_finetune.py")
        return False

    logger.info(f"✓ Modèle Phase 2 trouvé: {phase2_model}")
    return phase2_model


def check_dataset():
    """Vérifier que le dataset Dakhla réel existe."""
    data_yaml = DAKHLA_REAL_DIR / "data.yaml"

    if not data_yaml.exists():
        logger.error(f"❌ Dataset Dakhla réel non trouvé: {data_yaml}")
        logger.error("\nVous devez d'abord collecter des images de l'usine MFQF et les annoter.")
        logger.error("Structure attendue:")
        logger.error(f"  {DAKHLA_REAL_DIR}/")
        logger.error("    ├── images/")
        logger.error("    │   ├── train/")
        logger.error("    │   └── val/")
        logger.error("    ├── labels/")
        logger.error("    │   ├── train/")
        logger.error("    │   └── val/")
        logger.error("    └── data.yaml")
        return False

    logger.info(f"✓ Dataset Dakhla trouvé: {data_yaml}")
    return True


def train_phase3():
    """Entraîner Phase 3: Production Dakhla."""
    logger.info("=" * 80)
    logger.info("BAHRIA CAM — PHASE 3: ADAPTATION PRODUCTION DAKHLA")
    logger.info("=" * 80)

    # Vérifications
    phase2_model = check_pretrained_model()
    if not phase2_model:
        return None

    if not check_dataset():
        logger.warning("\n⚠ Dataset Dakhla non disponible.")
        logger.warning("Cette phase sera exécutée plus tard avec les données réelles de l'usine.")
        return None

    # Charger le modèle Phase 2
    logger.info(f"\n📦 Chargement du modèle Phase 2: {phase2_model}")
    model = YOLO(str(phase2_model))

    # Configuration
    logger.info(f"\n⚙️ Configuration de production:")
    logger.info(f"  Epochs: {PHASE3_CONFIG['epochs']}")
    logger.info(f"  Batch size: {PHASE3_CONFIG['batch']}")
    logger.info(f"  Image size: {PHASE3_CONFIG['imgsz']}")
    logger.info(f"  Learning rate: {PHASE3_CONFIG['lr0']} (très bas — affinage)")
    logger.info(f"  Freeze backbone: {PHASE3_CONFIG['freeze']} couches")

    logger.info(f"\n🎨 Augmentation (minimale — données réelles):")
    logger.info(f"  HSV: h={PHASE3_CONFIG['hsv_h']}, s={PHASE3_CONFIG['hsv_s']}, v={PHASE3_CONFIG['hsv_v']}")
    logger.info(f"  Mosaic: {PHASE3_CONFIG['mosaic']}")

    logger.info(f"\n🎯 Objectifs production:")
    logger.info(f"  mAP50 > {SUCCESS_METRICS['phase3']['map50_min']}")
    logger.info(f"  Precision > {SUCCESS_METRICS['phase3']['precision_min']}")
    logger.info(f"  Recall > {SUCCESS_METRICS['phase3']['recall_min']}")
    logger.info(f"  FPS Jetson > {SUCCESS_METRICS['phase3']['fps_jetson_min']}")

    logger.info("\n🚀 Lancement de l'adaptation...")
    logger.info("   (Durée estimée: 1-2 jours sur RTX 3090)\n")

    try:
        # Mettre à jour la config avec le modèle Phase 2
        config = PHASE3_CONFIG.copy()
        config['model'] = str(phase2_model)

        # Entraînement
        results = model.train(**config)

        logger.info("\n" + "=" * 80)
        logger.info("✓ PHASE 3 TERMINÉE")
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

        # Vérifier le succès
        success = (
            final_map50 >= SUCCESS_METRICS['phase3']['map50_min'] and
            final_precision >= SUCCESS_METRICS['phase3']['precision_min'] and
            final_recall >= SUCCESS_METRICS['phase3']['recall_min']
        )

        if success:
            logger.info(f"\n🎉 ✓ SUCCÈS — Modèle production prêt!")
        else:
            logger.warning(f"\n⚠ Certains objectifs non atteints")
            logger.warning("\nMétriques actuelles vs cibles:")
            logger.warning(f"  mAP50:     {final_map50:.3f} / {SUCCESS_METRICS['phase3']['map50_min']}")
            logger.warning(f"  Precision: {final_precision:.3f} / {SUCCESS_METRICS['phase3']['precision_min']}")
            logger.warning(f"  Recall:    {final_recall:.3f} / {SUCCESS_METRICS['phase3']['recall_min']}")

        # Sauvegarder le meilleur modèle
        best_model_path = Path(PHASE3_CONFIG['project']) / PHASE3_CONFIG['name'] / "weights" / "best.pt"
        output_path = MODELS_DIR / "bahria_cam_production.pt"

        if best_model_path.exists():
            import shutil
            shutil.copy(best_model_path, output_path)
            logger.info(f"\n💾 Modèle production sauvegardé: {output_path}")

            # Export TensorRT pour Jetson
            logger.info("\n🔧 Export TensorRT pour Jetson Orin Nano...")
            export_for_jetson(str(output_path))
        else:
            logger.error(f"\n❌ Modèle non trouvé: {best_model_path}")

        logger.info(f"\n📁 Résultats: {Path(PHASE3_CONFIG['project']) / PHASE3_CONFIG['name']}")

        return results

    except Exception as e:
        logger.error(f"\n❌ ERREUR durant l'entraînement:")
        logger.error(f"   {str(e)}")
        raise


def export_for_jetson(model_path):
    """Exporter le modèle en TensorRT pour Jetson Orin Nano."""
    try:
        logger.info(f"  Chargement: {model_path}")
        model = YOLO(model_path)

        logger.info(f"  Format: {EXPORT_CONFIG['format']} (TensorRT)")
        logger.info(f"  Précision: FP16 (2x plus rapide)")
        logger.info(f"  Image size: {EXPORT_CONFIG['imgsz']}")

        # Export
        export_path = model.export(**EXPORT_CONFIG)

        logger.info(f"\n✓ Export TensorRT terminé: {export_path}")
        logger.info(f"  À copier sur Jetson: /opt/bahria-cam/models/")

        # Export ONNX (alternative)
        logger.info(f"\n🔧 Export ONNX (backup)...")
        onnx_config = EXPORT_CONFIG.copy()
        onnx_config['format'] = 'onnx'
        onnx_config['opset'] = 17
        onnx_path = model.export(**onnx_config)

        logger.info(f"✓ Export ONNX terminé: {onnx_path}")

        return export_path

    except Exception as e:
        logger.error(f"❌ Erreur durant l'export: {e}")
        logger.error("Le modèle PyTorch (.pt) reste utilisable, mais pas optimisé pour Jetson.")
        return None


def main():
    """Point d'entrée principal."""
    print("""
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    BAHRIA CAM — PHASE 3 TRAINING                         ║
║                   Adaptation production usine MFQF                       ║
║                                                                           ║
║  Dataset:  Images réelles collectées à Dakhla                            ║
║  Objectif: Modèle production optimisé pour Jetson Orin Nano             ║
║  Durée:    1-2 jours (RTX 3090)                                          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    """)

    results = train_phase3()

    if results:
        print("\n✓ Phase 3 terminée avec succès!")
        print("\n🎉 Modèle BAHRIA Cam production prêt!")
        print("\nFichiers générés:")
        print(f"  - PyTorch:   {MODELS_DIR}/bahria_cam_production.pt")
        print(f"  - TensorRT:  {MODELS_DIR}/bahria_cam_production.engine")
        print(f"  - ONNX:      {MODELS_DIR}/bahria_cam_production.onnx")
        print("\nDéploiement:")
        print("  1. Copier les fichiers sur Jetson Orin Nano")
        print("  2. Tester l'inférence temps réel")
        print("  3. Calibrer le tapis de tri (homographie)")
        print("  4. Déployer en production")
    else:
        print("\n⚠ Phase 3 non exécutée (dataset Dakhla non disponible)")
        print("\nCette phase sera lancée plus tard avec les données réelles de l'usine.")


if __name__ == "__main__":
    main()
