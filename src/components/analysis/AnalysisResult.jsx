import { useState, useEffect } from 'react';
import Pipeline from './Pipeline';
import RiskGauge from './RiskGauge';
import SignalCard from './SignalCard';
import { fetchCurrentSST } from '../../services/noaa';
import { computeFeatures } from '../../model/features';
import { predict } from '../../model/predict';
import { computeImpact } from '../../model/impact';

/**
 * Composant principal du résultat d'analyse
 * @param {Object} props
 * @param {Object} props.sample - Données de l'échantillon
 * @param {Object} props.species - Données de l'espèce
 * @param {Function} props.onBack - Callback pour revenir au formulaire
 */
export default function AnalysisResult({ sample, species, onBack }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [oceanData, setOceanData] = useState(null);
  const [features, setFeatures] = useState(null);
  const [result, setResult] = useState(null);
  const [impact, setImpact] = useState(null);
  const [analysisTime, setAnalysisTime] = useState(0);

  useEffect(() => {
    // Orchestration de l'analyse
    const runAnalysis = async () => {
      const startTime = Date.now();
      // Étape 0-1 : Échantillon reçu + Données océano
      const timer = setInterval(() => {
        setCurrentStep(s => {
          if (s < 6) return s + 1;
          return s;
        });
      }, 500);

      // Étape 1-2 : Récupérer SST
      const sstData = await fetchCurrentSST();
      setOceanData({
        sst: sstData.sst,
        upwelling: 0.5, // Valeur par défaut
        date: sstData.date,
        source: sstData.source,
        live: sstData.live
      });

      // Attendre l'étape 3 pour calculer features
      setTimeout(() => {
        const sampleWithDate = { ...sample, date: sample.date || new Date().toISOString() };
        const computedFeatures = computeFeatures(sampleWithDate, species, {
          sst: sstData.sst,
          upwelling: 0.5
        });
        setFeatures(computedFeatures);

        // Étape 4-5 : Prédiction et calcul impact
        setTimeout(() => {
          const predictionResult = predict(computedFeatures, species);
          setResult(predictionResult);

          const impactResult = computeImpact(species, predictionResult.riskScore);
          setImpact(impactResult);

          // Étape 6 : Fin de l'analyse
          setTimeout(() => {
            const endTime = Date.now();
            setAnalysisTime((endTime - startTime) / 1000); // En secondes
            setAnalyzing(false);
            clearInterval(timer);
          }, 500);
        }, 1000);
      }, 1500);
    };

    runAnalysis();
  }, [sample, species]);

  // Phase 1 : Analyse en cours
  if (analyzing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <Pipeline currentStep={currentStep} />
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0EA5E9] border-t-transparent mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  // Phase 2 : Résultat complet
  if (!result || !impact) return null;

  // Compteur de signaux par type
  const signalCounts = {
    critical: result.signals.filter(s => s.type === 'critical').length,
    warning: result.signals.filter(s => s.type === 'warning').length,
    ok: result.signals.filter(s => s.type === 'ok').length
  };

  // Trier les signaux : critiques d'abord
  const sortedSignals = [...result.signals].sort((a, b) => {
    const order = { critical: 0, warning: 1, ok: 2 };
    return order[a.type] - order[b.type];
  });

  // Badge urgence
  const urgencyConfig = {
    immediat: { label: 'Immédiat', color: 'bg-red-100 text-red-800' },
    sous_15j: { label: 'Sous 15 jours', color: 'bg-amber-100 text-amber-800' },
    surveillance: { label: 'Surveillance', color: 'bg-blue-100 text-blue-800' },
    normal: { label: 'Normal', color: 'bg-green-100 text-green-800' }
  };

  // Recommandation
  const getRecommendation = () => {
    if (result.riskScore >= 70) {
      return `Arrêt biologique immédiat recommandé pour ${species.nom_commun}. Taille moyenne des captures (${sample.avgSize} cm) inférieure au seuil de maturité L50 (${species.L50_cm} cm), CPUE en chute de ${Math.abs(species.tendance_cpue_2y_pct)}% sur 2 ans. Urgence : immédiate. Durée suggérée : ${impact.duree_jours} jours.`;
    }
    if (result.riskScore >= 45) {
      return `Surveillance renforcée recommandée pour ${species.nom_commun}. Plusieurs indicateurs approchent les seuils critiques. Réévaluation dans 7 jours avec nouveaux échantillons.`;
    }
    return `Situation normale pour ${species.nom_commun}. Les indicateurs biologiques et océanographiques ne justifient pas d'arrêt anticipé. Prochain contrôle dans 15 jours.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* En-tête avec Pipeline et bouton retour */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 md:px-4 text-[#041E42] hover:bg-gray-100 rounded-lg transition-colors text-sm md:text-base"
            >
              <span>←</span>
              <span className="hidden sm:inline">Nouvelle analyse</span>
              <span className="sm:hidden">Retour</span>
            </button>
          </div>
          <Pipeline currentStep={6} />
        </div>

        {/* Section 1 : Décision */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Jauge de risque */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex items-center justify-center">
            <RiskGauge score={result.riskScore} />
          </div>

          {/* Carte décision */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 ${result.classification ? 'text-red-600' : 'text-green-600'}`}>
              {result.classification ? 'ARRÊT BIOLOGIQUE RECOMMANDÉ' : 'PAS D\'ARRÊT NÉCESSAIRE'}
            </h2>

            <p className="text-base md:text-lg text-gray-700 mb-3 md:mb-4">
              {species.icone} {species.nom_commun} • {sample.zone}
            </p>

            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${urgencyConfig[result.urgency].color}`}>
                {urgencyConfig[result.urgency].label}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                Confiance: {result.confidence}%
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Analyse du {new Date(sample.date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Section 2 : Signaux détaillés */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-lg md:text-xl font-bold text-[#041E42]">Signaux détaillés</h2>
            <span className="text-sm text-gray-600">
              {signalCounts.critical} critiques, {signalCounts.warning} attention, {signalCounts.ok} OK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSignals.map((signal, i) => (
              <SignalCard key={i} signal={signal} />
            ))}
          </div>
        </div>

        {/* Section 3 : Impact et Conditions océano */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Impact socio-économique */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-[#041E42] mb-3 md:mb-4">Impact socio-économique</h2>

            {result.classification ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">Durée estimée</span>
                  <span className="text-2xl font-bold text-[#041E42]">{impact.duree_jours} jours</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">Tonnes non pêchées</span>
                  <span className="text-lg font-semibold text-gray-900">{impact.tonnes_non_pechees.toFixed(0)} T</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">Manque à gagner</span>
                  <span className="text-lg font-semibold text-gray-900">{impact.valeur_mdh.toFixed(2)} MDH</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-700">Marins impactés</span>
                  <span className="text-lg font-semibold text-gray-900">{impact.marins_impactes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Gain biomasse attendu</span>
                  <span className="text-lg font-semibold text-green-600">{impact.gain_biomasse_pct}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-600 font-semibold text-lg">
                  Aucun arrêt nécessaire — Pas d'impact estimé
                </p>
              </div>
            )}
          </div>

          {/* Conditions océanographiques */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-[#041E42] mb-3 md:mb-4">Conditions océanographiques</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-700">SST actuelle</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">{oceanData.sst.toFixed(1)}°C</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${oceanData.live ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {oceanData.live ? 'Live NOAA' : 'Cache'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-700">Seuil de ponte espèce</span>
                <span className="text-lg font-semibold text-gray-900">{species.sst_seuil_ponte}°C</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-700">Écart</span>
                <span className="text-lg font-semibold text-gray-900">{features.sst_spawn_delta.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-700">Indice upwelling</span>
                <span className="text-lg font-semibold text-gray-900">{features.upwelling_index.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Date des données</span>
                <span className="text-sm text-gray-600">{oceanData.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 : Recommandation */}
        <div className="bg-blue-50 border-l-4 border-[#0EA5E9] rounded-xl shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-[#041E42] mb-3 md:mb-4">📋 Recommandation</h2>
          <p className="text-sm md:text-base text-gray-800 leading-relaxed">
            {getRecommendation()}
          </p>
        </div>

        {/* Compteur de temps d'analyse */}
        <div className="text-center text-xs text-gray-500 px-2">
          Analyse complétée en {analysisTime.toFixed(1)} secondes • Modèle RF v1 • 10 features • {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
