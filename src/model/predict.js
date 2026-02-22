import { generateSignals } from './signals.js';

/**
 * Calcule le score de risque basé sur les features pondérées
 * @param {Object} features - Les 10 features calculées
 * @returns {number} Score de risque (0-100)
 */
function calculateRiskScore(features) {
  let score = 0;

  // Règle 1 : Ratio taille/maturité
  if (features.size_maturity_ratio < 0.85) {
    score += 35;
  } else if (features.size_maturity_ratio < 1.0) {
    score += 20;
  } else if (features.size_maturity_ratio < 1.2) {
    score += 10;
  }

  // Règle 2 : Distance à la période de reproduction
  if (features.months_to_repro === 0) {
    score += 25;
  } else if (features.months_to_repro <= 1) {
    score += 15;
  } else if (features.months_to_repro <= 2) {
    score += 5;
  }

  // Règle 3 : Delta SST par rapport au seuil de ponte
  if (features.sst_spawn_delta < 1.5) {
    score += 20;
  } else if (features.sst_spawn_delta < 3.0) {
    score += 10;
  }

  // Règle 4 : Tendance CPUE sur 2 ans
  if (features.cpue_trend_2y_pct < -25) {
    score += 15;
  } else if (features.cpue_trend_2y_pct < -10) {
    score += 5;
  }

  // Règle 5 : Indice d'upwelling
  if (features.upwelling_index < 0.3) {
    score += 5;
  }

  // Clamp le score entre 0 et 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Détermine le niveau d'urgence basé sur le score de risque
 * @param {number} riskScore - Score de risque (0-100)
 * @returns {string} Niveau d'urgence
 */
function determineUrgency(riskScore) {
  if (riskScore >= 70) {
    return 'immediat';
  } else if (riskScore >= 45) {
    return 'sous_15j';
  } else if (riskScore >= 30) {
    return 'surveillance';
  } else {
    return 'normal';
  }
}

/**
 * Calcule le niveau de confiance de la prédiction
 * @param {number} riskScore - Score de risque (0-100)
 * @returns {number} Confiance (0-100)
 */
function calculateConfidence(riskScore) {
  const confidence = 70 + Math.abs(riskScore - 45);
  return Math.min(98, confidence);
}

/**
 * Prédiction principale : détermine si un repos biologique est recommandé
 * @param {Object} features - Les 10 features calculées
 * @param {Object} species - Données de l'espèce
 * @returns {Object} Résultat de la prédiction
 */
export function predict(features, species) {
  // Calcul du score de risque
  const riskScore = calculateRiskScore(features);

  // Classification : repos recommandé si score >= 45
  const classification = riskScore >= 45;

  // Calcul de la confiance
  const confidence = calculateConfidence(riskScore);

  // Détermination de l'urgence
  const urgency = determineUrgency(riskScore);

  // Génération des signaux d'alerte
  const signals = generateSignals(features, species);

  return {
    classification,
    riskScore,
    confidence,
    urgency,
    signals
  };
}
