/**
 * Calcule la distance circulaire minimale entre un mois et une liste de mois de reproduction
 * @param {number} currentMonth - Mois actuel (1-12)
 * @param {number[]} reproMonths - Liste des mois de reproduction (1-12)
 * @returns {number} Distance minimale en mois (0-6)
 */
function computeMonthsToRepro(currentMonth, reproMonths) {
  let minDistance = 12;

  for (const reproMonth of reproMonths) {
    // Distance dans le sens direct
    const forwardDist = (reproMonth - currentMonth + 12) % 12;
    // Distance dans le sens inverse
    const backwardDist = (currentMonth - reproMonth + 12) % 12;
    // Distance minimale
    const distance = Math.min(forwardDist, backwardDist);

    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

/**
 * Calcule les 10 features pour le modèle de prédiction
 * @param {Object} sample - Échantillon de capture (date, avgSize, avgWeight)
 * @param {Object} species - Données de l'espèce
 * @param {Object} oceanData - Données océanographiques (sst, upwelling)
 * @returns {Object} Objet contenant les 10 features
 */
export function computeFeatures(sample, species, oceanData) {
  // Extraire le mois de la date (1-12)
  const date = new Date(sample.date);
  const month = date.getMonth() + 1; // getMonth() retourne 0-11

  // Calcul de la distance aux mois de reproduction
  const monthsToRepro = computeMonthsToRepro(month, species.mois_reproduction);

  // Calcul du delta SST par rapport au seuil de ponte
  const sstSpawnDelta = Math.abs(oceanData.sst - species.sst_seuil_ponte);

  return {
    // Features biologiques
    avg_size_cm: sample.avgSize,
    avg_weight_g: sample.avgWeight,
    size_maturity_ratio: sample.avgSize / species.L50_cm,
    month: month,
    months_to_repro: monthsToRepro,

    // Features océanographiques
    sst_current: oceanData.sst,
    sst_spawn_delta: sstSpawnDelta,
    upwelling_index: oceanData.upwelling || 0.5,

    // Features halieutiques
    cpue_recent: species.cpue_2025,
    cpue_trend_2y_pct: species.tendance_cpue_2y_pct
  };
}
