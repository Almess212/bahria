from ultralytics import YOLO
import torch

print("🔥 PHASE 1: Pré-entraînement sur dataset générique poissons\n")

# Fix pour PyTorch 2.6 - Autoriser le chargement des modèles YOLOv8
try:
    from ultralytics.nn.tasks import DetectionModel
    torch.serialization.add_safe_globals([DetectionModel])
    print("✅ Fix PyTorch 2.6 appliqué")
except:
    pass

# Charger YOLOv8m (medium) pré-entraîné sur COCO
print("📦 Chargement du modèle YOLOv8m pré-entraîné...")
model = YOLO('yolov8m.pt')

print("\n🔥 Démarrage de l'entraînement Phase 1...\n")

# Entraînement Phase 1
results = model.train(
    data=f"{BASE_DIR}/bahria_dataset.yaml",
    epochs=50,
    imgsz=640,
    batch=12,
    patience=15,
    save=True,
    save_period=10,
    device=0,
    project=f"{BASE_DIR}/runs/phase1",
    name='bahria_pretrain',
    exist_ok=True,
    resume=True,
    plots=True,
    verbose=True
)

print("\n✅ PHASE 1 terminée!")
print(f"📊 Meilleur mAP@50: {results.results_dict['metrics/mAP50(B)']:.3f}")
print(f"💾 Modèle sauvegardé: {BASE_DIR}/runs/phase1/bahria_pretrain/weights/best.pt")
