"""
Script de génération du dataset synthétique BAHRIA
Génère 5000 échantillons avec 10 features + target (arrêt biologique)
"""

import numpy as np
import pandas as pd

# Seed pour reproductibilité
np.random.seed(42)

# Données de référence par espèce
SPECIES_DATA = {
    'poulpe': {
        'L50': 11,
        'poids_mat': 500,
        'mois_repro': [3, 4, 9, 10],
        'sst_seuil': 18.5,
        'cpue_moy': 33,
        'tendance': -26,
        'proportion': 0.35
    },
    'sardine': {
        'L50': 16.5,
        'poids_mat': 25,
        'mois_repro': [11, 12, 1, 2],
        'sst_seuil': 17.5,
        'cpue_moy': 600,
        'tendance': -36,
        'proportion': 0.30
    },
    'seiche': {
        'L50': 10,
        'poids_mat': 200,
        'mois_repro': [4, 5, 6],
        'sst_seuil': 19.0,
        'cpue_moy': 25,
        'tendance': -21,
        'proportion': 0.20
    },
    'courbine': {
        'L50': 50,
        'poids_mat': 2000,
        'mois_repro': [5, 6, 7],
        'sst_seuil': 20.5,
        'cpue_moy': 11,
        'tendance': -47,
        'proportion': 0.15
    }
}

# SST mensuelle moyenne Dakhla (°C)
SST_MONTHLY = {
    1: 18, 2: 17, 3: 18, 4: 18, 5: 18, 6: 18,
    7: 19, 8: 20, 9: 20, 10: 20, 11: 19, 12: 18
}

def compute_months_to_repro(month, mois_repro):
    """Calcule la distance circulaire minimale aux mois de reproduction"""
    min_dist = 12
    for repro_month in mois_repro:
        forward = (repro_month - month + 12) % 12
        backward = (month - repro_month + 12) % 12
        dist = min(forward, backward)
        min_dist = min(min_dist, dist)
    return min_dist

def calculate_risk_score(row):
    """Calcule le score de risque selon les règles du modèle"""
    score = 0

    # Règle 1: size_maturity_ratio
    if row['size_maturity_ratio'] < 0.85:
        score += 35
    elif row['size_maturity_ratio'] < 1.0:
        score += 20
    elif row['size_maturity_ratio'] < 1.2:
        score += 10

    # Règle 2: months_to_repro
    if row['months_to_repro'] == 0:
        score += 25
    elif row['months_to_repro'] <= 1:
        score += 15
    elif row['months_to_repro'] <= 2:
        score += 5

    # Règle 3: sst_spawn_delta
    if row['sst_spawn_delta'] < 1.5:
        score += 20
    elif row['sst_spawn_delta'] < 3.0:
        score += 10

    # Règle 4: cpue_trend_2y_pct
    if row['cpue_trend_2y_pct'] < -25:
        score += 15
    elif row['cpue_trend_2y_pct'] < -10:
        score += 5

    # Règle 5: upwelling_index
    if row['upwelling_index'] < 0.3:
        score += 5

    # Ajouter du bruit
    score += np.random.normal(0, 8)

    return max(0, min(100, score))

# Génération du dataset
print("Génération du dataset BAHRIA...")
print("=" * 60)

n_samples = 5000
data = []

# Répartition des espèces
species_list = []
for species, info in SPECIES_DATA.items():
    count = int(n_samples * info['proportion'])
    species_list.extend([species] * count)

# Compléter pour atteindre exactement 5000
while len(species_list) < n_samples:
    species_list.append(np.random.choice(list(SPECIES_DATA.keys()),
                                         p=[info['proportion'] for info in SPECIES_DATA.values()]))

np.random.shuffle(species_list)

# Générer chaque échantillon
for i, species in enumerate(species_list):
    sp_data = SPECIES_DATA[species]

    # Mois aléatoire
    month = np.random.randint(1, 13)

    # SST avec bruit
    sst_base = SST_MONTHLY[month]
    sst_current = sst_base + np.random.normal(0, 1.5)
    sst_current = max(14, min(24, sst_current))  # Clamp réaliste

    # Taille moyenne
    avg_size = np.random.normal(sp_data['L50'] * 1.1, sp_data['L50'] * 0.3)
    avg_size = np.clip(avg_size, sp_data['L50'] * 0.5, sp_data['L50'] * 2.5)

    # Poids moyen (relation allométrique avec bruit)
    # W = a * L^b avec bruit
    avg_weight = sp_data['poids_mat'] * (avg_size / sp_data['L50']) ** 3
    avg_weight *= np.random.uniform(0.8, 1.2)
    avg_weight = max(sp_data['poids_mat'] * 0.3, avg_weight)

    # Ratio taille/maturité
    size_maturity_ratio = avg_size / sp_data['L50']

    # Delta SST
    sst_spawn_delta = abs(sst_current - sp_data['sst_seuil'])

    # Upwelling index (plus élevé en été)
    month_factor = np.sin((month - 1) * np.pi / 6)  # Pic en juillet
    upwelling = 0.3 + 0.15 * month_factor + np.random.normal(0, 0.2)
    upwelling = np.clip(upwelling, 0.1, 1.5)

    # CPUE récent
    cpue_recent = np.random.normal(sp_data['cpue_moy'], sp_data['cpue_moy'] * 0.25)
    cpue_recent = max(1, cpue_recent)

    # Tendance CPUE
    cpue_trend = np.random.normal(sp_data['tendance'], 12)
    cpue_trend = np.clip(cpue_trend, -60, 30)

    # Distance aux mois de reproduction
    months_to_repro = compute_months_to_repro(month, sp_data['mois_repro'])

    # Créer la ligne
    row = {
        'species': species,
        'avg_size_cm': round(avg_size, 2),
        'avg_weight_g': round(avg_weight, 1),
        'size_maturity_ratio': round(size_maturity_ratio, 3),
        'month': month,
        'sst_current': round(sst_current, 2),
        'sst_spawn_delta': round(sst_spawn_delta, 2),
        'upwelling_index': round(upwelling, 3),
        'cpue_recent': round(cpue_recent, 1),
        'cpue_trend_2y_pct': round(cpue_trend, 1),
        'months_to_repro': months_to_repro
    }

    data.append(row)

# Créer le DataFrame
df = pd.DataFrame(data)

# Calculer le score de risque et le label
df['risk_score'] = df.apply(calculate_risk_score, axis=1)
df['arret'] = (df['risk_score'] >= 45).astype(int)

# Supprimer la colonne risk_score (utilisée uniquement pour labellisation)
df = df.drop('risk_score', axis=1)

# Sauvegarder le dataset
output_file = 'bahria_dataset_5000.csv'
df.to_csv(output_file, index=False)

print(f"✅ Dataset sauvegardé : {output_file}")
print()

# Statistiques
print("📊 STATISTIQUES DU DATASET")
print("=" * 60)
print(f"Nombre total d'échantillons : {len(df)}")
print()

print("Distribution des classes (arrêt biologique) :")
class_counts = df['arret'].value_counts()
print(f"  0 (Pas d'arrêt)  : {class_counts[0]:>5} ({class_counts[0]/len(df)*100:>5.1f}%)")
print(f"  1 (Arrêt)        : {class_counts[1]:>5} ({class_counts[1]/len(df)*100:>5.1f}%)")
print()

print("Répartition par espèce :")
for species in df['species'].unique():
    count = len(df[df['species'] == species])
    arrêt_count = len(df[(df['species'] == species) & (df['arret'] == 1)])
    print(f"  {species:>10} : {count:>5} échantillons ({arrêt_count:>4} avec arrêt - {arrêt_count/count*100:>5.1f}%)")
print()

print("Statistiques descriptives des features :")
print(df.drop(['species', 'arret'], axis=1).describe().round(2))
print()

print("✅ Génération terminée avec succès !")
