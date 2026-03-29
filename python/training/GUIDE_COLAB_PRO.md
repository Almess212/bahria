# 🚀 Guide de démarrage - BAHRIA Cam Training sur Google Colab Pro

## 📋 Checklist avant de commencer

- [ ] Compte Google avec Google Drive
- [ ] Abonnement Colab Pro (12$/mois) - [S'abonner ici](https://colab.research.google.com/signup)
- [ ] Compte Roboflow gratuit - [Créer ici](https://roboflow.com/signup)
- [ ] Au moins 50 GB d'espace libre sur Google Drive

---

## 🎯 Démarrage rapide (5 minutes)

### 1. Ouvrir le notebook

**Option A - Via Google Drive:**
1. Upload `BAHRIA_Cam_Training_Colab.ipynb` dans votre Google Drive
2. Double-cliquez dessus → "Ouvrir avec Google Colaboratory"

**Option B - Directement:**
1. Allez sur [colab.research.google.com](https://colab.research.google.com)
2. Fichier → Importer le notebook
3. Onglet "Upload" → Sélectionnez `BAHRIA_Cam_Training_Colab.ipynb`

### 2. Activer le GPU

⚠️ **CRITIQUE** - Sans GPU, l'entraînement prendra des semaines!

1. Cliquez sur `Runtime` dans le menu
2. `Change runtime type`
3. **Hardware accelerator**: Sélectionnez `GPU`
4. **GPU type** (Colab Pro): Choisissez `V100` ou `A100` si disponible
5. Cliquez `Save`

### 3. Configurer les clés API

Dans la cellule `4.1`, remplacez:

```python
ROBOFLOW_API_KEY = "VOTRE_CLE_API_ICI"
```

Par votre clé Roboflow (obtenue sur https://roboflow.com/account)

### 4. Lancer l'entraînement

**Exécutez les cellules dans l'ordre:**

1. **Cellule 1** - Vérification GPU (doit afficher Tesla T4/V100/A100)
2. **Cellule 2** - Installation dépendances (~2 min)
3. **Cellule 3** - Connexion Google Drive (vous devrez autoriser l'accès)
4. **Cellules 4.1 et 4.2** - Téléchargement dataset (~30 min pour 2 GB)
5. **Cellule 5** - PHASE 1 (⏱️ 24-48h sur T4)
6. **Cellule 6** - PHASE 2 (⏱️ 48-72h sur T4)
7. **Cellule 7** - PHASE 3 (optionnel, si vous avez des photos Dakhla)

### 5. Surveiller l'entraînement

Le notebook affiche automatiquement:
- ⏱️ Temps écoulé
- 📊 Loss (doit diminuer)
- 🎯 mAP (doit augmenter)
- 💾 Sauvegardes automatiques tous les 10 epochs

**Astuce**: Laissez tourner la nuit et vérifiez le matin!

---

## ⚠️ Points d'attention

### GPU déconnecté après 12h (Colab gratuit)

**Solution**: Colab Pro permet des sessions de 24h.

Si vous utilisez Colab gratuit:
- Exécutez cette cellule toutes les 12h pour éviter la déconnexion:

```python
# Empêcher déconnexion
from IPython.display import Javascript
Javascript('''
  function KeepAlive() {
    console.log("Keeping alive...");
  }
  setInterval(KeepAlive, 60000);
''')
```

### Manque d'espace disque

Si vous voyez "Disk quota exceeded":
1. Supprimez les anciens datasets dans Google Drive
2. Nettoyez le cache:

```python
!rm -rf ~/.cache/*
!du -sh /content  # Vérifier l'espace utilisé
```

### Erreur "Out of Memory"

Réduisez le batch size:
```python
batch=8  # Au lieu de 16
```

---

## 📊 Durées estimées par GPU

| GPU | Phase 1 | Phase 2 | Phase 3 | Total |
|-----|---------|---------|---------|-------|
| **T4** (Colab gratuit/Pro) | 36-48h | 60-72h | 18-24h | **4-6 jours** |
| **V100** (Colab Pro) | 24-36h | 40-48h | 12-18h | **3-4 jours** |
| **A100** (Colab Pro+) | 18-24h | 30-36h | 8-12h | **2-3 jours** |

---

## 💡 Optimisations pour accélérer

### 1. Utiliser un dataset plus petit pour tester

Remplacez dans la cellule 5 (Phase 1):
```python
epochs=100  →  epochs=10  # Pour tester
```

### 2. Skip Phase 1 (utiliser pré-entraîné COCO)

Si vous êtes pressé, sautez Phase 1 et commencez directement Phase 2:
```python
model_phase2 = YOLO('yolov8m.pt')  # Au lieu de charger Phase 1
```

### 3. Utiliser YOLOv8n (nano) pour prototyper

Plus rapide mais moins précis:
```python
model = YOLO('yolov8n.pt')  # Au lieu de yolov8m.pt
```

---

## 📤 Après l'entraînement

### 1. Télécharger les modèles

La dernière cellule (10.2) téléchargera automatiquement:
- `BAHRIA_models_final.zip` (~100-200 MB)

### 2. Extraire localement

```bash
cd ~/bahria/python/training/
unzip BAHRIA_models_final.zip -d models/
```

### 3. Tester le modèle

```python
from ultralytics import YOLO

model = YOLO('models/best.pt')
results = model.predict('test_image.jpg')
```

---

## 🆘 Dépannage

### Le notebook plante

1. `Runtime` → `Restart runtime`
2. Relancez depuis la dernière cellule sauvegardée

### GPU non disponible

1. Vérifiez que vous avez activé GPU dans Runtime settings
2. Attendez quelques minutes (quotas GPU Colab)
3. Si Colab gratuit → limitez utilisation à 12h/jour

### Dataset ne se télécharge pas

1. Vérifiez votre clé Roboflow
2. Téléchargez manuellement: https://universe.roboflow.com/brad-dwyer/fish-detection-5-species
3. Uploadez dans `/content/drive/MyDrive/BAHRIA_Training/datasets/`

---

## 📞 Support

- **Documentation Ultralytics**: https://docs.ultralytics.com
- **Forum Colab**: https://discuss.tensorflow.org/c/colab
- **Roboflow Universe**: https://universe.roboflow.com

---

## ✅ Checklist finale

Avant de déployer votre modèle:

- [ ] Phase 1 terminée (ou skippée)
- [ ] Phase 2 terminée avec mAP@50 > 0.85
- [ ] Phase 3 terminée (si photos Dakhla disponibles)
- [ ] Modèles exportés (PyTorch, ONNX, TensorRT)
- [ ] Modèles téléchargés localement
- [ ] Test sur images de validation OK
- [ ] Performance par espèce vérifiée

**Une fois terminé, passez à l'étape suivante**: Créer l'API Flask pour déployer le modèle!

---

**Bon entraînement! 🐟🤖**
