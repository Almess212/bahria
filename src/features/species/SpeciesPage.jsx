import { useState } from 'react';
import { Fish, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Calendar, Thermometer, MapPin, Scale, Ruler, DollarSign, Package } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';
import speciesData from '../dashboard/data/species.json';

export default function SpeciesPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  // Filtrer par catégorie
  const filteredSpecies = filterCategory === 'all'
    ? speciesData
    : speciesData.filter(s => s.categorie === filterCategory);

  // Obtenir l'état du stock avec style
  const getStockStatus = (etat) => {
    const statuses = {
      surexploite: { label: t.species?.overexploited || 'Surexploité', color: 'red', icon: AlertTriangle },
      equilibre_fragile: { label: t.species?.fragileBalance || 'Équilibre fragile', color: 'orange', icon: AlertTriangle },
      pleine_exploitation: { label: t.species?.fullExploitation || 'Pleine exploitation', color: 'yellow', icon: CheckCircle },
      sous_exploite: { label: t.species?.underexploited || 'Sous-exploité', color: 'green', icon: CheckCircle },
    };
    return statuses[etat] || statuses.equilibre_fragile;
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42] flex items-center gap-2">
            <Fish className="w-8 h-8" />
            {t.species?.title || 'Fiches Espèces'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t.species?.subtitle || 'Données biologiques et réglementaires complètes'}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.species?.allSpecies || 'Toutes les espèces'} ({speciesData.length})
          </button>
          <button
            onClick={() => setFilterCategory('cephalopode')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'cephalopode'
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐙 {t.species?.cephalopods || 'Céphalopodes'} ({speciesData.filter(s => s.categorie === 'cephalopode').length})
          </button>
          <button
            onClick={() => setFilterCategory('pelagique')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'pelagique'
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐟 {t.species?.pelagics || 'Pélagiques'} ({speciesData.filter(s => s.categorie === 'pelagique').length})
          </button>
          <button
            onClick={() => setFilterCategory('blanc')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === 'blanc'
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🐠 {t.species?.whiteFish || 'Poissons blancs'} ({speciesData.filter(s => s.categorie === 'blanc').length})
          </button>
        </div>
      </div>

      {/* Grille des espèces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSpecies.map((species) => {
          const status = getStockStatus(species.etat_stock);
          const StatusIcon = status.icon;

          return (
            <div
              key={species.code}
              onClick={() => setSelectedSpecies(species)}
              className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              style={{ borderTop: `4px solid ${species.couleur}` }}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{species.icone}</div>
                <h3 className="font-bold text-xl text-gray-900">{species.nom_commun}</h3>
                <p className="text-sm text-gray-500 italic">{species.nom_scientifique}</p>
              </div>

              <div className="space-y-2">
                {/* État du stock */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-${status.color}-50`}>
                  <StatusIcon className={`w-4 h-4 text-${status.color}-600`} />
                  <span className={`text-sm font-medium text-${status.color}-700`}>
                    {status.label}
                  </span>
                </div>

                {/* CPUE */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t.species?.cpue || 'CPUE 2025'}:</span>
                  <span className="font-bold text-gray-900">{species.cpue_2025} kg</span>
                </div>

                {/* Tendance */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t.species?.trend || 'Tendance'}:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    species.tendance_cpue_2y_pct < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {species.tendance_cpue_2y_pct < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    {species.tendance_cpue_2y_pct > 0 ? '+' : ''}{species.tendance_cpue_2y_pct}%
                  </span>
                </div>

                {/* L50 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">L50:</span>
                  <span className="font-bold text-gray-900">{species.L50_cm} cm</span>
                </div>

                {/* Prix */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t.species?.price || 'Prix moyen'}:</span>
                  <span className="font-bold text-green-600">{species.prix_moyen_dh} DH/kg</span>
                </div>
              </div>

              <button
                className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {t.species?.viewDetails || 'Voir la fiche complète'} →
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de détail */}
      {selectedSpecies && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSpecies(null)}>
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Header de la fiche */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedSpecies.icone}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedSpecies.nom_commun}</h2>
                    <p className="text-lg text-gray-500 italic">{selectedSpecies.nom_scientifique}</p>
                    <div className="mt-2">
                      {(() => {
                        const status = getStockStatus(selectedSpecies.etat_stock);
                        const StatusIcon = status.icon;
                        return (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${status.color}-50 text-${status.color}-700 text-sm font-medium`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contenu de la fiche */}
            <div className="p-6 space-y-6">
              {/* Données biologiques */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
                  <Fish className="w-6 h-6" />
                  {t.species?.biologicalData || 'Données Biologiques'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Ruler className="w-4 h-4" />
                      <span>L50 {t.species?.maturity || '(maturité)'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.L50_cm} cm</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Ruler className="w-4 h-4" />
                      <span>{t.species?.optimalSize || 'Taille optimale'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.taille_optimale_cm} cm</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Scale className="w-4 h-4" />
                      <span>{t.species?.maturityWeight || 'Poids maturité'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.poids_maturite_g} g</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Scale className="w-4 h-4" />
                      <span>{t.species?.optimalWeight || 'Poids optimal'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.poids_optimal_g} g</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{t.species?.spawningPeak || 'Pic de ponte'}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedSpecies.pic_ponte}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Thermometer className="w-4 h-4" />
                      <span>SST {t.species?.spawning || 'ponte'}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.sst_seuil_ponte}°C</p>
                  </div>
                </div>
              </div>

              {/* Données de capture */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  {t.species?.catchData || 'Données de Capture'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-gray-600 text-sm mb-1">CPUE 2023</div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.cpue_2023} kg</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-gray-600 text-sm mb-1">CPUE 2024</div>
                    <p className="text-2xl font-bold text-gray-900">{selectedSpecies.cpue_2024} kg</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-gray-600 text-sm mb-1">CPUE 2025</div>
                    <p className="text-2xl font-bold text-blue-600">{selectedSpecies.cpue_2025} kg</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      {selectedSpecies.tendance_cpue_2y_pct < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      <span>{t.species?.trend || 'Tendance'}</span>
                    </div>
                    <p className={`text-2xl font-bold ${selectedSpecies.tendance_cpue_2y_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedSpecies.tendance_cpue_2y_pct > 0 ? '+' : ''}{selectedSpecies.tendance_cpue_2y_pct}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Données économiques */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  {t.species?.economicData || 'Données Économiques'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{t.species?.averagePrice || 'Prix moyen'}</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{selectedSpecies.prix_moyen_dh} DH/kg</p>
                  </div>
                  {selectedSpecies.quota_artisanal_T && (
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-gray-600 text-sm mb-1">{t.species?.artisanalQuota || 'Quota artisanal'}</div>
                      <p className="text-3xl font-bold text-gray-900">{selectedSpecies.quota_artisanal_T.toLocaleString()} T</p>
                      {selectedSpecies.consommation_quota_pct && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t.species?.quotaConsumption || 'Consommation'}: {selectedSpecies.consommation_quota_pct}%
                        </p>
                      )}
                    </div>
                  )}
                  {selectedSpecies.quota_total_T && (
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-gray-600 text-sm mb-1">{t.species?.totalQuota || 'Quota total'}</div>
                      <p className="text-3xl font-bold text-gray-900">{selectedSpecies.quota_total_T.toLocaleString()} T</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Zones de pêche */}
              {selectedSpecies.zones && selectedSpecies.zones.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    {t.species?.fishingZones || 'Zones de Pêche'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecies.zones.map((zone, idx) => (
                      <span key={idx} className="bg-white px-4 py-2 rounded-lg font-medium text-gray-700">
                        📍 {zone}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations supplémentaires */}
              {(selectedSpecies.taux_juveniles_2025_pct || selectedSpecies.biomasse_tendance) && (
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t.species?.additionalInfo || 'Informations Complémentaires'}
                  </h3>
                  <div className="space-y-2">
                    {selectedSpecies.taux_juveniles_2025_pct && (
                      <p className="text-sm text-amber-800">
                        • {t.species?.juvenileRate || 'Taux de juvéniles'} 2025: <span className="font-bold">{selectedSpecies.taux_juveniles_2025_pct}%</span>
                      </p>
                    )}
                    {selectedSpecies.biomasse_tendance && (
                      <p className="text-sm text-amber-800">
                        • {t.species?.biomassTrend || 'Tendance biomasse'}: <span className="font-bold">{selectedSpecies.biomasse_tendance}</span>
                      </p>
                    )}
                    {selectedSpecies.reduction_stock_pct && (
                      <p className="text-sm text-amber-800">
                        • {t.species?.stockReduction || 'Réduction du stock'}: <span className="font-bold">{selectedSpecies.reduction_stock_pct}%</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
