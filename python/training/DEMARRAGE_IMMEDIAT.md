# 🚀 DÉMARRAGE IMMÉDIAT - Votre session Colab

## ✅ VOTRE CLÉ API ROBOFLOW

```
9RpnZTfLqap7YCC8sCqp
```

---

## 📍 FICHIER NOTEBOOK

**Emplacement exact** :
```
/Users/alimessoudi/bahria/python/training/BAHRIA_Cam_Training_Colab.ipynb
```

**Pour l'ouvrir dans Finder** :
- Appuyez sur `Cmd + Shift + G`
- Collez : `/Users/alimessoudi/bahria/python/training/`
- Vous verrez le fichier !

---

## 🎯 CHECKLIST DE DÉMARRAGE (10 min)

### 1️⃣ Ouvrir Google Colab
👉 **https://colab.research.google.com**

### 2️⃣ Importer le notebook
1. `Fichier` → `Importer le notebook`
2. Onglet `Upload`
3. Sélectionnez `BAHRIA_Cam_Training_Colab.ipynb`

### 3️⃣ Activer le GPU (CRITIQUE ⚡)
1. `Runtime` → `Change runtime type`
2. **Hardware accelerator** : `GPU`
3. `Save`

### 4️⃣ Vérifier le GPU
Exécutez la **cellule 1** (bouton ▶️)

Doit afficher :
```
✅ GPU détecté : Tesla T4
   Mémoire GPU : 15 GB
   CUDA disponible : Oui
```

### 5️⃣ Configurer la clé Roboflow
Dans la **cellule 4.1**, remplacez :
```python
ROBOFLOW_API_KEY = "VOTRE_CLE_API_ICI"
```

Par :
```python
ROBOFLOW_API_KEY = "9RpnZTfLqap7YCC8sCqp"
```

### 6️⃣ Lancer l'entraînement 🔥
1. `Runtime` → `Run all`
2. Autorisez Google Drive quand demandé
3. Le téléchargement des datasets démarre (~30 min)
4. Phase 1 démarre automatiquement après

---

## ⏰ ALARMES À RÉGLER MAINTENANT

**IMPORTANT** : Colab gratuit déconnecte après 12h !

### Stratégie de relance (8 jours)

| Jour | Heure lancement | Heure relance (alarme!) |
|------|----------------|------------------------|
| **Jour 1** | 09:00 | 20:00 |
| **Jour 2** | 07:00 | 18:00 |
| **Jour 3** | 05:00 | 16:00 |
| **Jour 4** | 09:00 | 20:00 |
| **Jour 5** | 07:00 | 18:00 |
| **Jour 6** | 05:00 | 16:00 |
| **Jour 7** | 09:00 | 20:00 |
| **Jour 8** | 07:00 | Export final |

**Réglez MAINTENANT 8 alarmes sur votre téléphone !**

📱 Exemple : "Relancer Colab BAHRIA" toutes les 10-11h

---

## 📊 CE QUI VA SE PASSER

### Phase 1 : Téléchargement datasets (~30 min)
- Community Fish Dataset (1.9M images)
- Deep Vision Pelagic (1879 images)
- Total : ~2 GB

### Phase 2 : Pré-entraînement (~36h = 3 sessions)
- 50 epochs sur données génériques
- Sauvegarde automatique tous les 10 epochs
- Fichier : `bahria_phase1_best.pt`

### Phase 3 : Fine-tuning (~60h = 5 sessions)
- 100 epochs sur espèces pélagiques
- Sauvegarde automatique tous les 10 epochs
- Fichier : `bahria_phase2_best.pt`

### Phase 4 : Export (~2h)
- Formats : PyTorch, ONNX, TensorRT
- Téléchargement automatique : `BAHRIA_models_final.zip`

**Total : 8 jours, 98h d'entraînement, 8 relances manuelles**

---

## 🔧 EN CAS DE PROBLÈME

### "GPU non disponible"
- Attendez 1-2h (quotas Colab)
- Essayez en soirée (moins de monde)

### "Out of Memory"
Dans la cellule 5 (Phase 1), changez :
```python
batch=8  # Au lieu de 12
```

### "Session déconnectée avant 12h"
- Gardez l'onglet ouvert
- Évitez de mettre l'ordinateur en veille
- Bougez la souris de temps en temps

### Le notebook reprend où il s'était arrêté
**C'est automatique !** ✅
- Tout est sauvegardé sur Google Drive
- À chaque relance, faites juste `Run all`
- Le script détecte le dernier checkpoint et continue

---

## 🎬 LANCEZ MAINTENANT !

1. Ouvrez **https://colab.research.google.com**
2. Importez le notebook
3. Activez le GPU
4. Collez votre clé API : `9RpnZTfLqap7YCC8sCqp`
5. `Runtime` → `Run all`
6. **Réglez votre première alarme pour dans 10h !**

---

## 📞 Fichiers de référence

- **Guide détaillé** : `GUIDE_COLAB_PRO.md`
- **Stratégie sessions** : `DEMARRAGE_RAPIDE_COLAB_GRATUIT.md`

---

**Bon courage ! Vous allez y arriver ! 💪🐟**
