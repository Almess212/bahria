/**
 * Fonction de recommandation fallback (sans API Claude)
 * @param {Object} species - Données de l'espèce
 * @param {Object} result - Résultat de la prédiction
 * @param {Object} impact - Impact socio-économique
 * @returns {string} Recommandation
 */
export function fallbackRecommendation(species, result, impact) {
  if (result.riskScore >= 70) {
    return `Arrêt biologique immédiat recommandé pour ${species.nom_commun}. Taille moyenne des captures inférieure au seuil de maturité (L50 = ${species.L50_cm} cm), CPUE en chute de ${Math.abs(species.tendance_cpue_2y_pct)}% sur 2 ans. Urgence : immédiate. Durée suggérée : ${impact.duree_jours} jours.`;
  }

  if (result.riskScore >= 45) {
    return `Surveillance renforcée recommandée pour ${species.nom_commun}. Plusieurs indicateurs approchent les seuils critiques. Réévaluation dans 7 jours avec nouveaux échantillons.`;
  }

  return `Situation normale pour ${species.nom_commun}. Les indicateurs biologiques et océanographiques ne justifient pas d'arrêt anticipé. Prochain contrôle dans 15 jours.`;
}

/**
 * Génère une recommandation intelligente avec l'API Claude
 * @param {Object} species - Données de l'espèce
 * @param {Object} features - Features calculées
 * @param {Object} result - Résultat de la prédiction
 * @param {Object} impact - Impact socio-économique
 * @returns {Promise<string>} Recommandation
 */
export async function generateRecommendation(species, features, result, impact) {
  // Vérifier si la clé API existe
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log('Pas de clé API Claude, utilisation du fallback');
    return fallbackRecommendation(species, result, impact);
  }

  try {
    // Date du jour en français
    const today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Construction du prompt
    const classification = result.classification ? 'ARRÊT BIOLOGIQUE RECOMMANDÉ' : 'Pas d\'arrêt nécessaire';

    let impactText = '';
    if (result.classification) {
      impactText = `\nImpact estimé : ${impact.duree_jours} jours d'arrêt, ${impact.tonnes_non_pechees.toFixed(0)} T non pêchées, ${impact.valeur_mdh.toFixed(2)} MDH de manque à gagner, ${impact.marins_impactes.toLocaleString()} marins impactés.`;
    }

    const prompt = `Tu es BAHRIA, un système expert en gestion halieutique au Maroc.
Analyse cette situation et produis une recommandation en 3-4 phrases maximum, en français, pour un décideur du Secrétariat d'État de la Pêche Maritime.

Espèce : ${species.nom_commun} (${species.nom_scientifique})
Zone : Dakhla, Atlantique Sud
Date : ${today}

Données échantillon :
- Taille moyenne captures : ${features.avg_size_cm} cm (maturité L50 : ${species.L50_cm} cm)
- Poids moyen : ${features.avg_weight_g} g
- SST actuelle : ${features.sst_current}°C (seuil ponte : ${species.sst_seuil_ponte}°C)
- CPUE récent : ${species.cpue_2025} kg/sortie (tendance 2 ans : ${species.tendance_cpue_2y_pct}%)

Résultat analyse :
- Classification : ${classification}
- Score de risque : ${result.riskScore}/100
- Confiance : ${result.confidence}%${impactText}

Donne ta recommandation opérationnelle précise.`;

    // Appel à l'API Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Claude: ${response.status}`);
    }

    const data = await response.json();

    // Parser la réponse
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }

    throw new Error('Format de réponse inattendu');

  } catch (error) {
    console.error('Erreur lors de l\'appel à Claude API:', error);
    return fallbackRecommendation(species, result, impact);
  }
}
