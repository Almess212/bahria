"""
Fusionner plusieurs datasets YOLO en un seul dataset unifié
"""
import argparse
import shutil
from pathlib import Path
from tqdm import tqdm
import yaml
import random


def merge_datasets(dataset_paths, output_dir, split_ratios=None):
    """
    Fusionner plusieurs datasets YOLO.

    Args:
        dataset_paths: Liste des chemins vers les datasets à fusionner
        output_dir: Dossier de sortie pour le dataset fusionné
        split_ratios: Dict avec train/val/test ratios (ex: {'train': 0.7, 'val': 0.2, 'test': 0.1})
    """
    if split_ratios is None:
        split_ratios = {'train': 0.7, 'val': 0.2, 'test': 0.1}

    print(f"🔄 Fusion de {len(dataset_paths)} datasets")
    print(f"  Output: {output_dir}\n")

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Créer structure de sortie
    for split in ['train', 'val', 'test']:
        (output_dir / 'images' / split).mkdir(parents=True, exist_ok=True)
        (output_dir / 'labels' / split).mkdir(parents=True, exist_ok=True)

    # Collecter toutes les images/labels
    all_items = []
    all_classes = set()

    for dataset_path in dataset_paths:
        dataset_path = Path(dataset_path)
        print(f"📦 Traitement: {dataset_path.name}")

        # Charger data.yaml pour obtenir les classes
        data_yaml_path = dataset_path / 'data.yaml'
        if data_yaml_path.exists():
            with open(data_yaml_path) as f:
                data_yaml = yaml.safe_load(f)
                classes = data_yaml.get('names', [])
                all_classes.update(classes)

        # Collecter images et labels de tous les splits
        for split in ['train', 'val', 'test']:
            img_dir = dataset_path / 'images' / split
            lbl_dir = dataset_path / 'labels' / split

            if not img_dir.exists():
                continue

            for img_path in img_dir.glob('*.*'):
                # Vérifier que l'extension est valide
                if img_path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.bmp']:
                    continue

                # Chercher le label correspondant
                lbl_path = lbl_dir / f"{img_path.stem}.txt"

                if lbl_path.exists():
                    all_items.append({
                        'image': img_path,
                        'label': lbl_path,
                        'dataset': dataset_path.name
                    })

        print(f"  Images: {len([i for i in all_items if i['dataset'] == dataset_path.name])}")

    print(f"\n📊 Total images collectées: {len(all_items)}")
    print(f"📊 Classes détectées: {len(all_classes)}")

    # Mélanger les items
    random.shuffle(all_items)

    # Calculer les tailles de splits
    n_total = len(all_items)
    n_train = int(n_total * split_ratios['train'])
    n_val = int(n_total * split_ratios['val'])
    n_test = n_total - n_train - n_val

    print(f"\n🎯 Répartition:")
    print(f"  Train: {n_train} ({split_ratios['train']*100:.0f}%)")
    print(f"  Val:   {n_val} ({split_ratios['val']*100:.0f}%)")
    print(f"  Test:  {n_test} ({split_ratios['test']*100:.0f}%)")

    # Répartir les items
    splits = {
        'train': all_items[:n_train],
        'val': all_items[n_train:n_train + n_val],
        'test': all_items[n_train + n_val:]
    }

    # Copier les fichiers
    print(f"\n📁 Copie des fichiers...")

    for split_name, items in splits.items():
        for idx, item in enumerate(tqdm(items, desc=f"  {split_name}")):
            # Nouveau nom de fichier unique
            new_name = f"{item['dataset']}_{item['image'].stem}_{idx}"

            # Copier image
            img_dst = output_dir / 'images' / split_name / f"{new_name}{item['image'].suffix}"
            shutil.copy2(item['image'], img_dst)

            # Copier label
            lbl_dst = output_dir / 'labels' / split_name / f"{new_name}.txt"
            shutil.copy2(item['label'], lbl_dst)

    # Créer data.yaml
    data_yaml = {
        'path': str(output_dir.absolute()),
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'nc': len(all_classes),
        'names': sorted(list(all_classes))
    }

    yaml_path = output_dir / 'data.yaml'
    with open(yaml_path, 'w') as f:
        yaml.dump(data_yaml, f, default_flow_style=False, sort_keys=False)

    print(f"\n✓ Fusion terminée!")
    print(f"  Dataset fusionné: {output_dir}")
    print(f"  Configuration: {yaml_path}")

    return output_dir


def main():
    parser = argparse.ArgumentParser(description="Fusionner plusieurs datasets YOLO")
    parser.add_argument(
        '--datasets',
        nargs='+',
        required=True,
        help="Chemins vers les datasets à fusionner"
    )
    parser.add_argument(
        '--output',
        required=True,
        help="Dossier de sortie pour le dataset fusionné"
    )
    parser.add_argument(
        '--split',
        nargs='+',
        default=['train:0.7', 'val:0.2', 'test:0.1'],
        help="Ratios de split (ex: train:0.7 val:0.2 test:0.1)"
    )

    args = parser.parse_args()

    # Parser les ratios
    split_ratios = {}
    for ratio_str in args.split:
        split_name, ratio = ratio_str.split(':')
        split_ratios[split_name] = float(ratio)

    # Vérifier que la somme = 1.0
    total = sum(split_ratios.values())
    if abs(total - 1.0) > 0.01:
        print(f"⚠ Avertissement: La somme des ratios est {total:.2f}, pas 1.0")
        print("  Normalisation automatique...")
        split_ratios = {k: v/total for k, v in split_ratios.items()}

    # Fusionner
    merge_datasets(args.datasets, args.output, split_ratios)


if __name__ == "__main__":
    main()
