import species from '../../data/species.json';
import landings from '../../data/onp-landings.json';

/**
 * Page du tableau de bord
 * @param {Object} props
 * @param {Function} props.onNavigate - Callback de navigation
 * @param {Object} props.sst - Données SST
 * @param {Function} props.onSelectSpecies - Callback pour sélectionner une espèce
 */
export default function Dashboard({ onNavigate, sst, onSelectSpecies }) {
  // Date du jour
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Variation 2024 vs 2023
  const tonnageVariation = ((landings.annuel[2024].total_T - landings.annuel[2023].total_T) / landings.annuel[2023].total_T * 100).toFixed(0);
  const valeurVariation = ((landings.annuel[2024].valeur_MDH - landings.annuel[2023].valeur_MDH) / landings.annuel[2023].valeur_MDH * 100).toFixed(0);

  // Badge couleur selon état du stock
  const getStockBadge = (etat) => {
    const config = {
      surexploite: { label: 'Surexploité', color: 'bg-red-100 text-red-800' },
      equilibre_fragile: { label: 'Équilibre fragile', color: 'bg-amber-100 text-amber-800' },
      pleine_exploitation: { label: 'Pleine exploitation', color: 'bg-yellow-100 text-yellow-800' }
    };
    return config[etat] || { label: etat, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Titre et date */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-[#041E42] font-bold text-xl md:text-2xl">Tableau de bord — Port de Dakhla</h1>
        <p className="text-gray-600 text-xs md:text-sm">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Débarquements */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <p className="text-gray-600 text-xs md:text-sm mb-2">🏗️ Débarquements 2024</p>
          <p className="text-[#041E42] font-bold text-xl md:text-2xl">
            {landings.annuel[2024].total_T.toLocaleString()} T
          </p>
          <p className="text-green-600 text-sm mt-1">+{tonnageVariation}% vs 2023</p>
        </div>

        {/* Valeur */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <p className="text-gray-600 text-xs md:text-sm mb-2">💰 Valeur marchande</p>
          <p className="text-[#041E42] font-bold text-xl md:text-2xl">
            {(landings.annuel[2024].valeur_MDH / 1000).toFixed(2)} Mrd DH
          </p>
          <p className="text-green-600 text-sm mt-1">+{valeurVariation}% vs 2023</p>
        </div>

        {/* Flotte */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <p className="text-gray-600 text-xs md:text-sm mb-2">🚢 Flotte active</p>
          <p className="text-[#041E42] font-bold text-xl md:text-2xl">
            {landings.flotte.total_navires.toLocaleString()} navires
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {landings.flotte.RSW} RSW • {landings.flotte.sardiniers} sardiniers • {landings.flotte.barques} barques
          </p>
        </div>

        {/* Marins */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <p className="text-gray-600 text-xs md:text-sm mb-2">👥 Marins-pêcheurs</p>
          <p className="text-[#041E42] font-bold text-xl md:text-2xl">
            {landings.flotte.marins.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-1">Dakhla et zones adjacentes</p>
        </div>
      </div>

      {/* Conditions océanographiques */}
      <div>
        <h2 className="text-[#041E42] font-bold text-lg md:text-xl mb-3 md:mb-4">Conditions océanographiques — Dakhla</h2>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* SST actuelle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-xs md:text-sm">🌊 SST actuelle</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${sst?.live ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {sst?.live ? 'Live' : 'Cache'}
                </span>
              </div>
              <p className="text-[#041E42] font-bold text-2xl md:text-3xl">{sst?.sst.toFixed(1)}°C</p>
              <p className="text-gray-500 text-xs mt-1">{sst?.source}</p>
            </div>

            {/* Upwelling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-xs md:text-sm">💨 Upwelling</span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                  Normal
                </span>
              </div>
              <p className="text-[#041E42] font-bold text-2xl md:text-3xl">0.52</p>
              <p className="text-gray-500 text-xs mt-1">Indice côtier</p>
            </div>

            {/* Chlorophylle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-xs md:text-sm">🧪 Chlorophylle</span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                  Modérée
                </span>
              </div>
              <p className="text-[#041E42] font-bold text-2xl md:text-3xl">1.8 mg/m³</p>
              <p className="text-gray-500 text-xs mt-1">Productivité planctonique</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-xs text-center">
              Données satellite NOAA ERDDAP • Coordonnées 23.7°N, 15.9°W
            </p>
          </div>
        </div>
      </div>

      {/* Espèces suivies */}
      <div>
        <h2 className="text-[#041E42] font-bold text-lg md:text-xl mb-3 md:mb-4">Espèces suivies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {species.map(sp => {
            const badge = getStockBadge(sp.etat_stock);
            return (
              <div
                key={sp.code}
                onClick={() => onSelectSpecies(sp)}
                className="bg-white rounded-xl shadow-sm p-4 md:p-5 border-t-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderTopColor: sp.couleur }}
              >
                <div className="text-3xl mb-2">{sp.icone}</div>
                <h3 className="font-bold text-gray-900 mb-2">{sp.nom_commun}</h3>
                <div className="space-y-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <p className="text-sm text-gray-700">
                    CPUE : <span className="font-semibold">{sp.cpue_2025} kg/sortie</span>
                    <span className={sp.tendance_cpue_2y_pct < 0 ? 'text-red-600 ml-1' : 'text-green-600 ml-1'}>
                      {sp.tendance_cpue_2y_pct > 0 ? '+' : ''}{sp.tendance_cpue_2y_pct}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">L50 : {sp.L50_cm} cm</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton nouvelle analyse */}
      <div className="flex justify-center py-4 md:py-6">
        <button
          onClick={() => onNavigate('analysis')}
          className="bg-[#0EA5E9] text-white py-3 px-6 md:py-4 md:px-8 rounded-xl text-base md:text-lg font-semibold shadow-lg hover:scale-105 transition-transform w-full sm:w-auto"
        >
          🔬 Lancer une nouvelle analyse
        </button>
      </div>

      {/* Insight clé */}
      <div className="bg-blue-50 border-l-4 border-[#0EA5E9] rounded-xl p-4">
        <h3 className="font-bold text-[#041E42] mb-2">💡 Insight clé</h3>
        <p className="text-gray-700 italic">{landings.insight_cle}</p>
      </div>

      {/* Footer */}
      <div className="text-center space-y-1 pt-6 border-t border-gray-200">
        <p className="text-gray-500 text-xs">
          BAHRIA v1.0 • Hackathon RamadanIA 2026 • Dakhla • NEGAM SAS / Smart Sailors
        </p>
        <p className="text-gray-400 text-xs">
          Données : ONP • INRH • NOAA
        </p>
      </div>
    </div>
  );
}
