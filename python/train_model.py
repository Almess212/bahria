"""
Script d'entraînement du modèle Random Forest BAHRIA
Entraîne un classificateur pour prédire les arrêts biologiques
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import joblib
import json

# Configuration des couleurs BAHRIA
NAVY = '#041E42'
OCEAN = '#0EA5E9'

# Seed pour reproductibilité
np.random.seed(42)

print("🚀 ENTRAÎNEMENT DU MODÈLE BAHRIA")
print("=" * 80)
print()

# 1. Chargement des données
print("📁 Chargement du dataset...")
df = pd.read_csv('bahria_dataset_5000.csv')
print(f"   ✅ {len(df)} échantillons chargés")
print()

# 2. Préparation des données
print("🔧 Préparation des données...")
# Séparer features (X) et target (y)
# On retire 'species' et 'arret', on garde les 10 features numériques
feature_cols = ['avg_size_cm', 'avg_weight_g', 'size_maturity_ratio', 'month',
                'sst_current', 'sst_spawn_delta', 'upwelling_index',
                'cpue_recent', 'cpue_trend_2y_pct', 'months_to_repro']

X = df[feature_cols]
y = df['arret']

print(f"   Features : {X.shape[1]} variables")
print(f"   Target   : Arrêt biologique (0/1)")
print()

# 3. Split train/test stratifié
print("📊 Split train/test (80/20, stratifié)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"   Train : {len(X_train)} échantillons")
print(f"   Test  : {len(X_test)} échantillons")
print()

# 4. Entraînement du modèle
print("🌲 Entraînement du Random Forest...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_leaf=5,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)
print("   ✅ Modèle entraîné")
print()

# 5. Cross-validation
print("🔄 Validation croisée (5-fold)...")
cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
print(f"   Scores CV : {cv_scores}")
print(f"   Moyenne   : {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
print()

# 6. Évaluation sur le test set
print("📈 Évaluation sur le jeu de test...")
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f"   Accuracy  : {accuracy:.4f}")
print(f"   Precision : {precision:.4f}")
print(f"   Recall    : {recall:.4f}")
print(f"   F1-Score  : {f1:.4f}")
print()

# Rapport de classification détaillé
print("📋 Rapport de classification :")
print(classification_report(y_test, y_pred,
                          target_names=['Pas d\'arrêt', 'Arrêt recommandé']))
print()

# Matrice de confusion
print("🔢 Matrice de confusion :")
cm = confusion_matrix(y_test, y_pred)
print(cm)
print(f"   VN={cm[0,0]}  FP={cm[0,1]}")
print(f"   FN={cm[1,0]}  VP={cm[1,1]}")
print()

# 7. Feature importance
print("⭐ Importance des features...")
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=True)

print(feature_importance.to_string(index=False))
print()

# 8. Visualisation Feature Importance
print("📊 Génération du graphique d'importance des features...")
plt.figure(figsize=(10, 6))
plt.barh(feature_importance['feature'], feature_importance['importance'],
         color=[OCEAN if i % 2 == 0 else NAVY for i in range(len(feature_importance))])
plt.xlabel('Importance', fontsize=12, fontweight='bold')
plt.ylabel('Feature', fontsize=12, fontweight='bold')
plt.title('Importance des Features - Modèle BAHRIA RF', fontsize=14, fontweight='bold', color=NAVY)
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
print("   ✅ Graphique sauvegardé : feature_importance.png")
print()

# 9. Sauvegarde du modèle
print("💾 Sauvegarde du modèle...")
joblib.dump(model, 'bahria_rf_v1.joblib')
print("   ✅ Modèle sauvegardé : bahria_rf_v1.joblib")
print()

# 10. Sauvegarde des métriques
print("📝 Sauvegarde des métriques...")
metrics = {
    'accuracy': float(accuracy),
    'precision': float(precision),
    'recall': float(recall),
    'f1_score': float(f1),
    'cross_val_mean': float(cv_scores.mean()),
    'cross_val_std': float(cv_scores.std()),
    'confusion_matrix': cm.tolist(),
    'feature_importance': {
        row['feature']: float(row['importance'])
        for _, row in feature_importance.iterrows()
    },
    'model_params': {
        'n_estimators': 200,
        'max_depth': 12,
        'min_samples_leaf': 5,
        'class_weight': 'balanced'
    },
    'dataset_info': {
        'n_samples_total': len(df),
        'n_samples_train': len(X_train),
        'n_samples_test': len(X_test),
        'n_features': len(feature_cols)
    }
}

with open('model_metrics.json', 'w', encoding='utf-8') as f:
    json.dump(metrics, f, indent=2, ensure_ascii=False)

print("   ✅ Métriques sauvegardées : model_metrics.json")
print()

print("=" * 80)
print("✅ ENTRAÎNEMENT TERMINÉ AVEC SUCCÈS !")
print()
print("Fichiers générés :")
print("  - bahria_rf_v1.joblib          (modèle entraîné)")
print("  - model_metrics.json           (métriques détaillées)")
print("  - feature_importance.png       (graphique)")
print()
