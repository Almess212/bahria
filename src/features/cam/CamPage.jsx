import { useState } from 'react';
import { Camera, Upload, Image as ImageIcon, CheckCircle, XCircle, Loader2, BarChart3, History, TrendingUp } from 'lucide-react';
import camAnalyses from './data/cam-analyses.json';
import modelStats from './data/model-stats.json';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function CamPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // upload, history, stats

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload vers le serveur
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Appel à l'API backend
      setAnalyzing(true);
      setUploading(false);

      const response = await fetch('http://localhost:3001/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse');
      }

      const analysisData = await response.json();

      // Formater le résultat pour l'affichage
      const result = {
        espece: analysisData.espece,
        nom_scientifique: analysisData.nom_scientifique,
        icone: analysisData.icone,
        confidence: analysisData.confidence,
        tailleEstimee: `${analysisData.taille_moyenne_cm} cm`,
        poidsEstime: `${analysisData.poids_moyen_g} g`,
        poidsTotal: analysisData.poids_total_kg ? `${analysisData.poids_total_kg} kg` : 'N/A',
        qualite: analysisData.qualite,
        fraicheur: analysisData.fraicheur,
        calibre: analysisData.calibre,
        comptage: analysisData.comptage,
        mix: false, // Sera amélioré en v1.3
        especes_secondaires: [],
        juveniles: false,
        raison_analyse: analysisData.raison_analyse,
        hors_plan_gestion: analysisData.hors_plan_gestion || false, // Nouvelle propriété
        details: [
          {
            label: 'Fraîcheur',
            value: analysisData.fraicheur,
            status: analysisData.fraicheur === 'Très fraîche' ? 'ok' : analysisData.fraicheur === 'N/A' ? 'error' : 'warning'
          },
          {
            label: 'Taille vs L50',
            value: analysisData.ratio_L50_pct > 0 ? `${analysisData.ratio_L50_pct}% de L50` : 'N/A',
            status: analysisData.conformite_L50 ? 'ok' : 'error'
          },
          {
            label: 'Conformité export',
            value: analysisData.conformite_export_ue ? 'Conforme UE' : 'Non conforme',
            status: analysisData.conformite_export_ue ? 'ok' : 'error'
          },
        ],
      };

      setResult(result);
      setAnalyzing(false);

    } catch (error) {
      console.error('Erreur analyse:', error);
      setAnalyzing(false);
      setUploading(false);

      alert(`Erreur lors de l'analyse: ${error.message}\n\nAssurez-vous que:\n1. Le serveur API est démarré (npm run dev:server)\n2. La clé ANTHROPIC_API_KEY est configurée dans .env`);

      // Reset
      setPreviewUrl(null);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPreviewUrl(null);
    setUploading(false);
    setAnalyzing(false);
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#041E42]">{t.cam.title}</h1>
        <p className="text-gray-600 mt-1">{t.cam.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-5 h-5" />
            {t.cam.analyzePhoto}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-5 h-5" />
            {t.cam.history} ({camAnalyses.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {t.cam.modelPerformance}
          </button>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100">
        <h2 className="text-xl font-bold text-[#041E42] mb-4">{t.cam.roadmap}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-xs text-blue-600 font-bold mb-1">2026 S2</p>
            <p className="font-semibold text-gray-900">{t.cam.recognition}</p>
            <p className="text-xs text-gray-600 mt-1">{t.cam.identificationPelagic}</p>
            <p className="text-xs text-green-600 mt-2 font-semibold">✓ {t.cam.inDevelopment}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-xs text-green-600 font-bold mb-1">2027 S1</p>
            <p className="font-semibold text-gray-900">{t.cam.counting}</p>
            <p className="text-xs text-gray-600 mt-1">{t.cam.volumeEstimation}</p>
            <p className="text-xs text-gray-500 mt-2">{t.cam.comingSoon}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-xs text-purple-600 font-bold mb-1">2027 S2</p>
            <p className="font-semibold text-gray-900">{t.cam.calibration}</p>
            <p className="text-xs text-gray-600 mt-1">{t.cam.automaticMeasurement}</p>
            <p className="text-xs text-gray-500 mt-2">{t.cam.comingSoon}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
            <p className="text-xs text-orange-600 font-bold mb-1">2027 S2</p>
            <p className="font-semibold text-gray-900">{t.cam.deployment}</p>
            <p className="text-xs text-gray-600 mt-1">{t.cam.rswVessels}</p>
            <p className="text-xs text-gray-500 mt-2">{t.cam.comingSoon}</p>
          </div>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && !result && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="max-w-2xl mx-auto">
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-[#0EA5E9] mb-4 animate-spin" />
                      <p className="mb-2 text-sm text-gray-500">Upload en cours...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour uploader</span> ou glisser-déposer
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG ou JPEG (MAX. 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            ) : (
              <div>
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <Loader2 className="w-16 h-16 text-[#0EA5E9] mb-4 animate-spin" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">Analyse en cours...</p>
                    <p className="text-sm text-gray-500">
                      Identification de l'espèce, estimation taille et poids, comptage...
                    </p>
                    <div className="mt-6 w-full max-w-md bg-gray-200 rounded-full h-2">
                      <div className="bg-[#0EA5E9] h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-4 right-4 px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
                    >
                      Nouvelle photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {activeTab === 'upload' && result && (
        <div className="space-y-6">
          {/* Header résultat */}
          <div className={`${result.hors_plan_gestion ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-green-50 border-l-4 border-green-500'} rounded-xl shadow-sm p-6`}>
            <div className="flex items-start gap-3">
              {result.hors_plan_gestion ? (
                <div className="text-3xl">ℹ️</div>
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${result.hors_plan_gestion ? 'text-blue-900' : 'text-green-900'} mb-2`}>
                  {result.hors_plan_gestion ? `${result.espece} identifiée` : `${result.espece} détecté`}
                </h2>
                <p className={`text-lg ${result.hors_plan_gestion ? 'text-blue-800' : 'text-green-800'}`}>
                  {result.hors_plan_gestion ? (
                    <span>Espèce non suivie par le plan de gestion des stocks de Dakhla</span>
                  ) : (
                    <>Confiance: <span className="font-bold">{result.confidence}%</span></>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Image + Infos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image analysée */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={previewUrl}
                alt="Analyzed"
                className="w-full"
              />
            </div>

            {/* Résultats détaillés */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-[#041E42] mb-4">Résultats de l'analyse</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Espèce</span>
                  <span className="font-bold text-[#041E42]">{result.espece}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Taille estimée</span>
                  <span className="font-semibold text-gray-900">{result.tailleEstimee}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Poids estimé</span>
                  <span className="font-semibold text-gray-900">{result.poidsEstime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Qualité</span>
                  <span className="font-semibold text-green-600">{result.qualite}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Calibre commercial</span>
                  <span className="font-semibold text-gray-900">{result.calibre}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Nombre d'individus</span>
                  <span className="font-bold text-[#0EA5E9] text-xl">{result.comptage}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Captures mixtes</span>
                  <span className={`font-semibold ${result.mix ? 'text-orange-600' : 'text-green-600'}`}>
                    {result.mix ? 'Oui (2 espèces)' : 'Non'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-[#041E42] mb-4">Contrôle qualité</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  {detail.status === 'ok' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{detail.label}</p>
                    <p className="text-sm text-gray-600">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raison de l'analyse IA */}
          {result.raison_analyse && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <h3 className="text-lg font-bold text-[#041E42] mb-2">Analyse IA</h3>
                  <p className="text-gray-700">{result.raison_analyse}</p>
                  <p className="text-xs text-gray-500 mt-2">Modèle: Claude 3.5 Sonnet avec vision par ordinateur</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors"
            >
              Analyser une nouvelle photo
            </button>
            <button
              className="px-6 py-3 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white transition-colors"
            >
              Exporter le rapport
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {camAnalyses.slice(0, 10).map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-4xl">{analysis.icone}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#041E42]">{analysis.espece}</h3>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm font-medium text-gray-600">{analysis.id}</span>
                    </div>
                    <p className="text-sm text-gray-500 italic mb-3">{analysis.nom_scientifique}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Confiance</p>
                        <p className="text-sm font-bold text-[#0EA5E9]">{analysis.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Comptage</p>
                        <p className="text-sm font-semibold text-gray-900">{analysis.comptage} individus</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Taille moy.</p>
                        <p className="text-sm font-semibold text-gray-900">{analysis.taille_moyenne_cm} cm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Poids total</p>
                        <p className="text-sm font-semibold text-gray-900">{analysis.poids_total_kg} kg</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        analysis.qualite === 'Excellente' ? 'bg-green-100 text-green-800' :
                        analysis.qualite === 'Bonne' ? 'bg-blue-100 text-blue-800' :
                        analysis.qualite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {analysis.qualite}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        analysis.conformite_L50 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {analysis.conformite_L50 ? '✓ Conforme L50' : '⚠ Sous L50'}
                      </span>
                      {analysis.conformite_export_ue && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          ✓ Export UE
                        </span>
                      )}
                      {analysis.captures_mixtes && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
                          Captures mixtes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{new Date(analysis.date).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs">{new Date(analysis.date).toLocaleTimeString('fr-FR')}</p>
                  <p className="text-xs mt-1">{analysis.zone_capture}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Modèle général */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#041E42] mb-4">Informations sur le modèle</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Version du modèle</p>
                <p className="text-lg font-bold text-[#041E42]">{modelStats.model_version}</p>
                <p className="text-xs text-gray-500 mt-1">Mis à jour le {new Date(modelStats.last_updated).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Précision globale</p>
                <p className="text-3xl font-bold text-green-600">{modelStats.precision_globale}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Temps d'inférence</p>
                <p className="text-3xl font-bold text-purple-600">{modelStats.inference_time_ms}ms</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Architecture</p>
              <p className="font-medium text-gray-900">{modelStats.architecture}</p>
              <p className="text-sm text-gray-600 mt-2">Hardware: {modelStats.hardware}</p>
            </div>
          </div>

          {/* Précision par espèce */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#041E42] mb-4">Performance par espèce</h2>
            <div className="space-y-4">
              {Object.entries(modelStats.precision_par_espece).map(([espece, stats]) => (
                <div key={espece} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{espece}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded">
                      {stats.precision}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Precision</p>
                      <p className="text-sm font-semibold">{stats.precision}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Recall</p>
                      <p className="text-sm font-semibold">{stats.recall}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">F1-Score</p>
                      <p className="text-sm font-semibold">{stats.f1_score}%</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="mb-1">{stats.samples} échantillons testés</p>
                    <p className="font-medium text-gray-900">Erreurs communes :</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {stats.erreurs_communes.map((erreur, idx) => (
                        <li key={idx}>{erreur}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance estimation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#041E42] mb-4">Estimation taille/poids</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Longueur</p>
                  <p className="text-sm">Précision: <span className="font-bold text-green-600">{modelStats.performance_taille.estimation_longueur.precision_pct}%</span></p>
                  <p className="text-xs text-gray-500">Erreur moy: ±{modelStats.performance_taille.estimation_longueur.erreur_moyenne_cm} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Poids</p>
                  <p className="text-sm">Précision: <span className="font-bold text-green-600">{modelStats.performance_taille.estimation_poids.precision_pct}%</span></p>
                  <p className="text-xs text-gray-500">Erreur moy: ±{modelStats.performance_taille.estimation_poids.erreur_moyenne_g} g</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#041E42] mb-4">Performance comptage</h3>
              <div className="space-y-2">
                {Object.entries(modelStats.performance_comptage).map(([range, stats]) => (
                  <div key={range} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{range.replace('_', ' ')}</span>
                    <span className="text-sm font-semibold text-[#0EA5E9]">{stats.precision}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dataset info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#041E42] mb-4">Collecte de données</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Photos terrain</p>
                <p className="text-2xl font-bold text-[#041E42]">{modelStats.donnees_collecte.photos_terrain.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Images entraînement</p>
                <p className="text-2xl font-bold text-[#041E42]">{modelStats.images_entrainement.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Epochs</p>
                <p className="text-2xl font-bold text-[#041E42]">{modelStats.epochs_trained}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><span className="font-medium">Période:</span> {modelStats.donnees_collecte.periode}</p>
              <p className="mb-2"><span className="font-medium">Zones:</span> {modelStats.donnees_collecte.zones_couvertes.join(', ')}</p>
              <p><span className="font-medium">Temps d'annotation:</span> {modelStats.donnees_collecte.annotation.temps_total_heures}h par {modelStats.donnees_collecte.annotation.annotateurs} annotateurs</p>
            </div>
          </div>

          {/* Roadmap v1.3 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-[#041E42] mb-3">Roadmap v1.3 (Juin 2026)</h3>
            <ul className="space-y-2">
              {modelStats.roadmap_v1_3.ameliorations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Info technique */}
      <div className="bg-purple-50 border-l-4 border-purple-500 rounded-xl p-4 text-sm text-gray-700">
        <p className="font-medium mb-1">🔬 Technologie</p>
        <p>
          BAHRIA Cam utilise des modèles YOLO et segmentation d'instance sur hardware NVIDIA Jetson pour l'inférence locale.
          L'algorithme identifie les espèces pélagiques avec 94%+ de précision sur images réelles collectées à Dakhla.
        </p>
      </div>
    </div>
  );
}
