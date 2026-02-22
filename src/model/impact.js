/**
 * Captures journalières par espèce (en tonnes)
 */
const CAPTURES_JOURNALIERES = {
  poulpe: 55,
  sardine: 1500,
  seiche: 25,
  courbine: 8
};

/**
 * Nombre de marins impactés par espèce
 */
const MARINS_IMPACTES = {
  poulpe: 4500,
  sardine: 3200,
  seiche: 2000,
  courbine: 800
};

/**
 * Calcule l'impact socio-économique d'un repos biologique
 * @param {Object} species - Données de l'espèce
 * @param {number} riskScore - Score de risque (0-100)
 * @returns {Object} Impact calculé
 */
export function computeImpact(species, riskScore) {
  // Calcul de la durée du repos en fonction du score
  let dureeJours;
  if (riskScore >= 70) {
    dureeJours = 75;
  } else if (riskScore >= 45) {
    dureeJours = 45;
  } else {
    dureeJours = 0;
  }

  // Récupération des captures journalières pour l'espèce
  const capturesJour = CAPTURES_JOURNALIERES[species.code] || 0;

  // Calcul des tonnes non pêchées
  const tonnesNonPechees = capturesJour * dureeJours;

  // Calcul de la valeur en millions de dirhams
  const valeurMdh = (tonnesNonPechees * species.prix_moyen_dh) / 1000000;

  // Nombre de marins impactés
  const marinsImpactes = MARINS_IMPACTES[species.code] || 0;

  // Gain de biomasse estimé
  let gainBiomassePct;
  if (riskScore >= 70) {
    gainBiomassePct = '15-25%';
  } else if (riskScore >= 45) {
    gainBiomassePct = '5-15%';
  } else {
    gainBiomassePct = '0%';
  }

  return {
    duree_jours: dureeJours,
    tonnes_non_pechees: tonnesNonPechees,
    valeur_mdh: valeurMdh,
    marins_impactes: marinsImpactes,
    gain_biomasse_pct: gainBiomassePct
  };
}
