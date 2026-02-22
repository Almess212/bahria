"""
Script d'export du dataset BAHRIA nettoyé
Formate le dataset pour Excel français (séparateur ; et virgule décimale)
"""

import pandas as pd

print("📦 EXPORT DU DATASET BAHRIA")
print("=" * 70)

# Charger le dataset
input_file = 'bahria_dataset_5000.csv'
print(f"📁 Chargement du dataset : {input_file}")
df = pd.read_csv(input_file)

# Traduire les colonnes en français
df_fr = df.copy()
df_fr.columns = [
    'Espèce',
    'Taille moyenne (cm)',
    'Poids moyen (g)',
    'Ratio taille/L50',
    'Mois',
    'SST actuelle (°C)',
    'Delta SST ponte (°C)',
    'Indice upwelling',
    'CPUE récente',
    'Tendance CPUE 2 ans (%)',
    'Mois avant repro',
    'Arrêt biologique'
]

# Mapper les valeurs d'arrêt
df_fr['Arrêt biologique'] = df_fr['Arrêt biologique'].map({0: 'Non', 1: 'Oui'})

# Exporter en CSV français (séparateur ; et virgule décimale)
output_fr = 'bahria_dataset_export_fr.csv'
df_fr.to_csv(output_fr, index=False, sep=';', decimal=',', encoding='utf-8-sig')
print(f"✅ Export FR sauvegardé : {output_fr}")
print(f"   Format : CSV (séparateur ; / virgule décimale)")
print(f"   Encodage : UTF-8 avec BOM (compatible Excel)")

# Exporter aussi en version anglaise standard
output_en = 'bahria_dataset_export_en.csv'
df_en = df.copy()
df_en.columns = [
    'Species',
    'Average Size (cm)',
    'Average Weight (g)',
    'Size/Maturity Ratio',
    'Month',
    'Current SST (°C)',
    'SST Spawn Delta (°C)',
    'Upwelling Index',
    'Recent CPUE',
    'CPUE Trend 2y (%)',
    'Months to Reproduction',
    'Biological Rest'
]
df_en['Biological Rest'] = df_en['Biological Rest'].map({0: 'No', 1: 'Yes'})
df_en.to_csv(output_en, index=False, encoding='utf-8')
print(f"✅ Export EN sauvegardé : {output_en}")
print(f"   Format : CSV standard (séparateur , / point décimal)")
print()

# Statistiques
print("📊 STATISTIQUES DU DATASET")
print("=" * 70)
print(f"Nombre total d'échantillons : {len(df):,}")
print()

print("Distribution des arrêts biologiques :")
arret_counts = df['arret'].value_counts()
print(f"  Non (0) : {arret_counts[0]:>5,} ({arret_counts[0]/len(df)*100:>5.1f}%)")
print(f"  Oui (1) : {arret_counts[1]:>5,} ({arret_counts[1]/len(df)*100:>5.1f}%)")
print()

print("Répartition par espèce :")
species_names = {
    'poulpe': 'Poulpe',
    'sardine': 'Sardine',
    'seiche': 'Seiche',
    'courbine': 'Courbine'
}
for species in sorted(df['species'].unique()):
    count = len(df[df['species'] == species])
    arret_count = len(df[(df['species'] == species) & (df['arret'] == 1)])
    print(f"  {species_names[species]:>10} : {count:>5,} échantillons ({arret_count:>4,} avec arrêt - {arret_count/count*100:>5.1f}%)")
print()

print("Statistiques descriptives (5 premiers échantillons) :")
print(df_fr.head(5).to_string(index=False))
print()

print("=" * 70)
print("✅ EXPORT TERMINÉ AVEC SUCCÈS !")
print()
print("Fichiers générés :")
print(f"  1. {output_fr}  (Excel français)")
print(f"  2. {output_en}  (CSV standard)")
