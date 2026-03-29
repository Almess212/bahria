"""
Convertir annotations COCO en format YOLO
"""
import json
import argparse
from pathlib import Path
from tqdm import tqdm


def convert_coco_bbox(bbox, img_width, img_height):
    """
    Convertir bounding box COCO (x, y, w, h) en format YOLO (cx, cy, w, h normalisé).

    Args:
        bbox: [x, y, width, height] en pixels (COCO format)
        img_width: Largeur de l'image
        img_height: Hauteur de l'image

    Returns:
        [cx, cy, w, h] normalisé (YOLO format)
    """
    x, y, w, h = bbox

    # Centre de la box
    cx = (x + w / 2) / img_width
    cy = (y + h / 2) / img_height

    # Largeur/hauteur normalisées
    nw = w / img_width
    nh = h / img_height

    return [cx, cy, nw, nh]


def coco_to_yolo(coco_json_path, output_dir, img_dir=None):
    """
    Convertir un fichier JSON COCO en annotations YOLO.

    Args:
        coco_json_path: Chemin vers le fichier COCO annotations
        output_dir: Dossier de sortie pour les annotations YOLO
        img_dir: Dossier des images (optionnel, pour vérification)
    """
    print(f"🔄 Conversion COCO → YOLO")
    print(f"  Input:  {coco_json_path}")
    print(f"  Output: {output_dir}\n")

    # Charger COCO JSON
    with open(coco_json_path) as f:
        coco_data = json.load(f)

    # Créer le dossier de sortie
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Mapping category_id → class_index
    categories = {cat['id']: idx for idx, cat in enumerate(coco_data['categories'])}

    print(f"📊 Catégories détectées:")
    for cat in coco_data['categories']:
        print(f"  [{categories[cat['id']]}] {cat['name']}")

    # Grouper annotations par image
    img_annotations = {}
    for ann in coco_data['annotations']:
        img_id = ann['image_id']
        if img_id not in img_annotations:
            img_annotations[img_id] = []
        img_annotations[img_id].append(ann)

    # Créer annotations YOLO
    converted = 0
    skipped = 0

    for img in tqdm(coco_data['images'], desc="Conversion"):
        img_id = img['id']
        img_width = img['width']
        img_height = img['height']

        # Nom du fichier de sortie
        img_filename = Path(img['file_name']).stem
        output_file = output_dir / f"{img_filename}.txt"

        # Annotations pour cette image
        annotations = img_annotations.get(img_id, [])

        if not annotations:
            skipped += 1
            continue

        # Écrire les annotations YOLO
        with open(output_file, 'w') as f:
            for ann in annotations:
                # Ignorer si pas de bounding box
                if 'bbox' not in ann:
                    continue

                # Classe
                class_id = categories[ann['category_id']]

                # Convertir bbox
                yolo_bbox = convert_coco_bbox(ann['bbox'], img_width, img_height)

                # Format YOLO: class_id cx cy w h
                f.write(f"{class_id} {' '.join(f'{v:.6f}' for v in yolo_bbox)}\n")

        converted += 1

    print(f"\n✓ Conversion terminée:")
    print(f"  Images converties: {converted}")
    print(f"  Images sans annotations: {skipped}")
    print(f"  Total: {len(coco_data['images'])}")


def main():
    parser = argparse.ArgumentParser(description="Convertir COCO en YOLO")
    parser.add_argument('--input', required=True, help="Chemin vers le fichier COCO JSON")
    parser.add_argument('--output', required=True, help="Dossier de sortie pour annotations YOLO")
    parser.add_argument('--images', help="Dossier des images (optionnel)")

    args = parser.parse_args()

    coco_to_yolo(args.input, args.output, args.images)


if __name__ == "__main__":
    main()
