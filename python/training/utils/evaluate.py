"""
Évaluer un modèle YOLO sur un dataset de test
"""
import argparse
from pathlib import Path
from ultralytics import YOLO
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def evaluate_model(model_path, data_yaml, save_dir=None):
    """
    Évaluer un modèle YOLO sur un dataset.

    Args:
        model_path: Chemin vers le modèle (.pt)
        data_yaml: Chemin vers data.yaml du dataset
        save_dir: Dossier pour sauvegarder les résultats

    Returns:
        dict: Métriques d'évaluation
    """
    logger.info("=" * 80)
    logger.info("ÉVALUATION MODÈLE BAHRIA CAM")
    logger.info("=" * 80)

    logger.info(f"\n📦 Chargement du modèle: {model_path}")
    model = YOLO(model_path)

    logger.info(f"📊 Dataset: {data_yaml}")
    logger.info(f"\n🚀 Lancement de l'évaluation...\n")

    # Évaluation
    results = model.val(
        data=data_yaml,
        save_json=True,
        save_hybrid=True,
        conf=0.001,  # Threshold bas pour recall
        iou=0.6,
        max_det=300,
        plots=True,
        project=save_dir or './runs/val',
        name='eval'
    )

    # Extraire les métriques
    metrics = {
        'model': str(model_path),
        'dataset': str(data_yaml),
        'metrics': {
            'mAP50': float(results.box.map50),
            'mAP50-95': float(results.box.map),
            'precision': float(results.box.mp),
            'recall': float(results.box.mr),
        }
    }

    # Métriques par classe
    if hasattr(results.box, 'maps'):
        class_names = model.names
        class_metrics = {}

        for idx, (ap50, ap) in enumerate(zip(results.box.ap50, results.box.ap)):
            class_name = class_names.get(idx, f'class_{idx}')
            class_metrics[class_name] = {
                'AP50': float(ap50),
                'AP50-95': float(ap),
            }

        metrics['per_class'] = class_metrics

    # Afficher les résultats
    logger.info("\n" + "=" * 80)
    logger.info("✓ ÉVALUATION TERMINÉE")
    logger.info("=" * 80)

    logger.info(f"\n📊 Métriques globales:")
    logger.info(f"  mAP50:     {metrics['metrics']['mAP50']:.4f}")
    logger.info(f"  mAP50-95:  {metrics['metrics']['mAP50-95']:.4f}")
    logger.info(f"  Precision: {metrics['metrics']['precision']:.4f}")
    logger.info(f"  Recall:    {metrics['metrics']['recall']:.4f}")

    if 'per_class' in metrics:
        logger.info(f"\n📊 Métriques par classe:")
        for class_name, class_metrics in metrics['per_class'].items():
            logger.info(f"  {class_name:15s} — AP50: {class_metrics['AP50']:.4f}, AP50-95: {class_metrics['AP50-95']:.4f}")

    # Sauvegarder les métriques
    if save_dir:
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        metrics_file = save_dir / 'eval' / 'metrics.json'

        with open(metrics_file, 'w') as f:
            json.dump(metrics, f, indent=2)

        logger.info(f"\n💾 Métriques sauvegardées: {metrics_file}")
        logger.info(f"📁 Résultats: {save_dir / 'eval'}")

    return metrics


def compare_models(model_paths, data_yaml, save_dir=None):
    """
    Comparer plusieurs modèles sur le même dataset.

    Args:
        model_paths: Liste des chemins vers les modèles
        data_yaml: Chemin vers data.yaml du dataset
        save_dir: Dossier pour sauvegarder les résultats

    Returns:
        list: Liste des métriques pour chaque modèle
    """
    logger.info("=" * 80)
    logger.info("COMPARAISON DE MODÈLES")
    logger.info("=" * 80)

    results = []

    for model_path in model_paths:
        logger.info(f"\n🔄 Évaluation: {Path(model_path).name}")
        metrics = evaluate_model(model_path, data_yaml, save_dir)
        results.append(metrics)

    # Afficher le tableau comparatif
    logger.info("\n" + "=" * 80)
    logger.info("TABLEAU COMPARATIF")
    logger.info("=" * 80)

    logger.info(f"\n{'Modèle':<40} {'mAP50':>8} {'mAP':>8} {'Prec':>8} {'Recall':>8}")
    logger.info("-" * 80)

    for metrics in results:
        model_name = Path(metrics['model']).stem
        m = metrics['metrics']
        logger.info(
            f"{model_name:<40} "
            f"{m['mAP50']:>8.4f} "
            f"{m['mAP50-95']:>8.4f} "
            f"{m['precision']:>8.4f} "
            f"{m['recall']:>8.4f}"
        )

    # Sauvegarder la comparaison
    if save_dir:
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        comparison_file = save_dir / 'comparison.json'

        with open(comparison_file, 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"\n💾 Comparaison sauvegardée: {comparison_file}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Évaluer un ou plusieurs modèles YOLO")
    parser.add_argument(
        '--model',
        nargs='+',
        required=True,
        help="Chemin(s) vers le(s) modèle(s) à évaluer"
    )
    parser.add_argument(
        '--data',
        required=True,
        help="Chemin vers data.yaml du dataset"
    )
    parser.add_argument(
        '--save-dir',
        default='./runs/eval',
        help="Dossier pour sauvegarder les résultats"
    )
    parser.add_argument(
        '--compare',
        action='store_true',
        help="Mode comparaison (si plusieurs modèles)"
    )

    args = parser.parse_args()

    if len(args.model) > 1 or args.compare:
        # Mode comparaison
        compare_models(args.model, args.data, args.save_dir)
    else:
        # Mode évaluation simple
        evaluate_model(args.model[0], args.data, args.save_dir)


if __name__ == "__main__":
    main()
