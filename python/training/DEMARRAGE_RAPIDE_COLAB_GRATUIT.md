# 🚀 DÉMARRAGE RAPIDE - Colab Gratuit (0€)

## ⏱️ CE QU'IL FAUT SAVOIR

- **Session max**: 12 heures
- **Vous devrez relancer**: 8-12 fois sur 7-10 jours
- **GPU**: Tesla T4 (suffisant!)
- **C'est faisable**: Avec discipline et alarmes 😊

---

## 🎯 DÉMARRAGE EN 3 ÉTAPES (15 min)

### **Étape 1: Ouvrir Google Colab**

1. Allez sur **https://colab.research.google.com**
2. Créez un compte Google si besoin
3. Cliquez sur `Fichier` → `Importer un notebook`
4. Onglet `Upload` → Sélectionnez `BAHRIA_Cam_Training_Colab.ipynb`

### **Étape 2: Activer le GPU** ⚡

1. `Runtime` → `Change runtime type`
2. **Hardware accelerator**: `GPU`
3. `Save`
4. **Vérifiez**: Exécutez la 1ère cellule → doit afficher "Tesla T4"

### **Étape 3: Obtenir clé Roboflow** (2 min)

1. Allez sur **https://roboflow.com/signup** (gratuit)
2. Créez un compte
3. Cliquez sur votre profil → `Settings` → `Workspace Settings`
4. Copiez votre **API Key**
5. Collez-la dans la cellule 4.1 du notebook

---

## ⏰ STRATÉGIE DE RELANCE (IMPORTANT!)

### **Système d'alarmes**

Réglez des alarmes toutes les **10-11 heures**:

```
Jour 1:
- 09:00 → Lancer entraînement
- 20:00 → Relancer (alarme!)

Jour 2:
- 07:00 → Relancer (alarme!)
- 18:00 → Relancer (alarme!)

... etc pendant 7-10 jours
```

### **Avant chaque déconnexion**

Le notebook **sauvegarde automatiquement** tous les 10 epochs sur Google Drive.

**Rien à faire manuellement!** ✅

### **À chaque relance**

1. Ouvrir le notebook
2. `Runtime` → `Run all` (▶️ Tout exécuter)
3. Le script **reprend automatiquement** où il s'était arrêté

---

## 📊 CALENDRIER RÉALISTE

| Jour | Phase | Heures | Relances |
|------|-------|--------|----------|
| **J1-J3** | Phase 1 (50 epochs) | 36h | 3x |
| **J4-J7** | Phase 2 (100 epochs) | 60h | 5x |
| **J8** | Export modèles | 2h | 0x |
| **Total** | **8 jours** | 98h | **8 relances** |

---

## 🔧 OPTIMISATIONS APPLIQUÉES

Le notebook a été optimisé pour Colab gratuit:

✅ **Epochs réduits**: 50 + 100 au lieu de 100 + 150
✅ **Sauvegardes auto**: Tous les 10 epochs
✅ **Reprise auto**: Détecte checkpoint et continue
✅ **Batch optimisé**: 12 au lieu de 16
✅ **Early stopping**: Arrête si pas d'amélioration

---

## 📱 ASTUCE: Notifications sur téléphone

Pour ne pas rater les relances:

1. **Android**: Google Calendar avec alarmes
2. **iPhone**: Rappels avec notifications
3. **Tous**: Alarme téléphone classique "Relancer Colab"

---

## ❓ FAQ

### **Q: Que se passe-t-il si j'oublie une relance?**

R: Pas de panique! Vos progrès sont sauvegardés sur Google Drive. Relancez dès que possible, le script reprendra au dernier checkpoint.

### **Q: Puis-je fermer mon navigateur?**

R: OUI, mais Colab se déconnecte après 90 min d'inactivité. Gardez l'onglet ouvert ou utilisez:

```python
# Cellule anti-déconnexion (optionnel)
from IPython.display import Javascript
display(Javascript('''
  function ClickConnect(){
    console.log("Auto-reconnect");
    document.querySelector("colab-toolbar-button").click()
  }
  setInterval(ClickConnect,60000)
'''))
```

### **Q: Le GPU n'est pas disponible**

R: Colab gratuit a des quotas. Attendez 1-2h ou utilisez en soirée (moins de monde).

### **Q: "Out of Memory" error**

R: Réduisez le batch:
```python
batch=8  # Au lieu de 12
```

---

## ✅ CHECKLIST DE DÉMARRAGE

Avant de lancer la 1ère session:

- [ ] Notebook uploadé sur Colab
- [ ] GPU T4 activé et vérifié
- [ ] Clé Roboflow configurée
- [ ] Google Drive connecté (50+ GB libres)
- [ ] **8 alarmes programmées** sur 10 jours
- [ ] Café préparé ☕

---

## 🚀 PRÊT? LANCEZ MAINTENANT!

1. Ouvrez le notebook
2. `Runtime` → `Run all`
3. Attendez que ça télécharge les datasets (~30 min)
4. L'entraînement commence! 🔥

**Réglez votre 1ère alarme pour dans 10h!**

---

## 📞 Problème?

- Relisez le `GUIDE_COLAB_PRO.md` (section Dépannage)
- Vérifiez que GPU est activé
- Assurez-vous d'avoir 50+ GB sur Drive

**Bon courage! Vous pouvez le faire! 💪🐟**
