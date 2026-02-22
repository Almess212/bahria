import { useState } from 'react';
import restPeriods from '../../data/rest-periods.json';

/**
 * Page de détail d'une espèce
 * @param {Object} props
 * @param {Object} props.species - Espèce sélectionnée
 * @param {Function} props.onBack - Retour au dashboard
 */
export default function SpeciesDetail({ species, onBack }) {
  const [selectedYear, setSelectedYear] = useState(2025);
  const availableYears = [2026, 2025, 2024, 2023];

  // Badge couleur selon état du stock
  const getStockBadge = (etat) => {
    const config = {
      surexploite: { label: 'Surexploité', color: 'bg-red-100 text-red-800' },
      equilibre_fragile: { label: 'Équilibre fragile', color: 'bg-amber-100 text-amber-800' },
      pleine_exploitation: { label: 'Pleine exploitation', color: 'bg-yellow-100 text-yellow-800' }
    };
    return config[etat] || { label: etat, color: 'bg-gray-100 text-gray-800' };
  };

  const badge = getStockBadge(species.etat_stock);
  const allRestData = restPeriods[species.code];
  const restData = allRestData?.[selectedYear] || allRestData;

  // Mois de l'année pour le calendrier
  const months = [
    { name: 'Jan', num: 1 },
    { name: 'Fév', num: 2 },
    { name: 'Mar', num: 3 },
    { name: 'Avr', num: 4 },
    { name: 'Mai', num: 5 },
    { name: 'Jun', num: 6 },
    { name: 'Jul', num: 7 },
    { name: 'Aoû', num: 8 },
    { name: 'Sep', num: 9 },
    { name: 'Oct', num: 10 },
    { name: 'Nov', num: 11 },
    { name: 'Déc', num: 12 }
  ];

  // Parse une date au format "DD mmm"
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0]);
    const monthNames = {
      'jan': 1, 'fév': 2, 'mar': 3, 'avr': 4, 'mai': 5, 'jun': 6,
      'jul': 7, 'aoû': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'déc': 12
    };
    const monthNum = monthNames[parts[1]];
    return { month: monthNum, day };
  };

  // Détermine si un mois est en repos ou en campagne + les dates
  const getMonthInfo = (monthNum) => {
    if (!restData) return { status: 'unknown', startDay: null, endDay: null };

    // Fonction helper pour vérifier si un mois est dans une période
    const isInPeriod = (month, dateDebut, dateFin) => {
      const debut = parseDate(dateDebut);
      const fin = parseDate(dateFin);

      if (!debut || !fin) return false;

      // Période dans le même mois
      if (debut.month === fin.month) {
        return month === debut.month;
      }

      // Période sur plusieurs mois
      if (debut.month < fin.month) {
        return month >= debut.month && month <= fin.month;
      } else {
        // Période qui traverse l'année (ex: déc-jan)
        return month >= debut.month || month <= fin.month;
      }
    };

    // Vérifier chaque période de repos
    for (const [key, period] of Object.entries(restData)) {
      if (key.startsWith('repos_') && period.date_debut && period.date_fin) {
        if (isInPeriod(monthNum, period.date_debut, period.date_fin)) {
          const debut = parseDate(period.date_debut);
          const fin = parseDate(period.date_fin);

          let startDay = null;
          let endDay = null;

          // Si le mois est le mois de début
          if (debut.month === monthNum) {
            startDay = debut.day;
          }

          // Si le mois est le mois de fin
          if (fin.month === monthNum) {
            endDay = fin.day;
          }

          return { status: 'repos', startDay, endDay };
        }
      }
    }

    // Sinon c'est une campagne
    return { status: 'campagne', startDay: null, endDay: null };
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#041E42] transition-colors text-sm md:text-base"
      >
        <span className="text-lg md:text-xl">←</span>
        <span className="font-semibold">Retour</span>
      </button>

      {/* Titre */}
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-4xl md:text-6xl">{species.icone}</span>
        <div>
          <h1 className="text-[#041E42] font-bold text-2xl md:text-3xl">{species.nom_commun}</h1>
          <p className="text-gray-500 italic text-base md:text-lg">{species.nom_scientifique}</p>
          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mt-2 ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Grid 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Colonne gauche : Données biologiques */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-[#041E42] font-bold text-lg md:text-xl mb-3 md:mb-4">📊 Données biologiques</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Taille 50% maturité (L50)</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.L50_cm} cm</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Taille optimale</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.taille_optimale_cm} cm</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Poids à maturité</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.poids_maturite_g} g</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Mois de reproduction</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.mois_reproduction.join(', ')}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Pic de ponte</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.pic_ponte}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">SST optimale ponte</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.sst_seuil_ponte}°C</span>
            </div>
          </div>
        </div>

        {/* Colonne droite : Données halieutiques */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-[#041E42] font-bold text-lg md:text-xl mb-3 md:mb-4">🎣 Données halieutiques</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">CPUE 2025</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.cpue_2025} kg/sortie</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">CPUE 2024</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.cpue_2024} kg/sortie</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">CPUE 2023</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.cpue_2023} kg/sortie</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Tendance CPUE 2 ans</span>
              <span className={`font-semibold text-sm md:text-base ${species.tendance_cpue_2y_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {species.tendance_cpue_2y_pct > 0 ? '+' : ''}{species.tendance_cpue_2y_pct}%
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600 text-sm md:text-base">Prix moyen</span>
              <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.prix_moyen_dh} DH/kg</span>
            </div>
            {species.quota_artisanal_T && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600 text-sm md:text-base">Quota artisanal</span>
                <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.quota_artisanal_T.toLocaleString()} T</span>
              </div>
            )}
            {species.quota_total_T && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600 text-sm md:text-base">Quota total</span>
                <span className="font-semibold text-[#041E42] text-sm md:text-base">{species.quota_total_T.toLocaleString()} T</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendrier des repos biologiques */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
          <h2 className="text-[#041E42] font-bold text-lg md:text-xl">📅 Calendrier des repos biologiques</h2>

          {/* Sélecteur d'année */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-600 text-sm font-semibold">Année :</span>
            <div className="flex gap-2">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedYear === year
                      ? 'bg-[#0EA5E9] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grille des mois */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 md:gap-2 mb-4">
          {months.map(month => {
            const info = getMonthInfo(month.num);
            const bgColor = info.status === 'repos'
              ? 'bg-red-100 border-red-300'
              : info.status === 'campagne'
              ? 'bg-green-100 border-green-300'
              : 'bg-gray-100 border-gray-300';
            const textColor = info.status === 'repos'
              ? 'text-red-800'
              : info.status === 'campagne'
              ? 'text-green-800'
              : 'text-gray-600';

            return (
              <div
                key={month.num}
                className={`p-2 rounded-lg border-2 text-center ${bgColor} ${textColor}`}
              >
                <div className="font-bold text-sm">{month.name}</div>
                <div className="text-xs mt-1">
                  {info.status === 'repos' ? '🚫' : info.status === 'campagne' ? '✓' : '?'}
                </div>
                {/* Afficher les dates de début/fin */}
                {(info.startDay || info.endDay) && (
                  <div className="text-[10px] mt-1 font-semibold">
                    {info.startDay && info.endDay && (
                      <span>{info.startDay}-{info.endDay}</span>
                    )}
                    {info.startDay && !info.endDay && (
                      <span>dès {info.startDay}</span>
                    )}
                    {!info.startDay && info.endDay && (
                      <span>au {info.endDay}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-gray-700">Repos biologique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-gray-700">Campagne de pêche</span>
          </div>
        </div>

        {/* Détails des périodes de repos */}
        {restData && (
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 space-y-3">
            <h3 className="font-bold text-gray-800 mb-3 text-sm md:text-base">Détails des périodes — {selectedYear}</h3>

            {Object.entries(restData).map(([key, period]) => {
              if (!key.startsWith('repos_')) return null;

              const periodName = key.replace('repos_', '').replace('_', ' ');
              const capitalizedName = periodName.charAt(0).toUpperCase() + periodName.slice(1);

              return (
                <div key={key} className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold text-red-900">Repos {capitalizedName}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {period.date_debut} - {period.date_fin} ({period.duree_jours} jours)
                  </p>
                  {period.zone && (
                    <p className="text-xs text-gray-600 mt-1">Zone : {period.zone}</p>
                  )}
                  {period.raison && (
                    <p className="text-xs text-red-700 mt-2 italic">
                      ⚠️ {period.raison}
                    </p>
                  )}
                </div>
              );
            })}

            {allRestData?.probleme && (
              <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm text-amber-900">
                  ⚠️ <span className="font-semibold">Problème identifié :</span> {allRestData.probleme}
                </p>
              </div>
            )}

            {allRestData?.synchronisation && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ {allRestData.synchronisation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes additionnelles */}
      <div className="bg-blue-50 border-l-4 border-[#0EA5E9] rounded-xl p-4">
        <h3 className="font-bold text-[#041E42] mb-2">💡 Note</h3>
        <p className="text-gray-700 text-sm">
          Les repos biologiques sont définis par l'ONP et l'INRH selon les cycles de reproduction et l'état des stocks.
          Le respect de ces périodes est crucial pour la durabilité de la ressource.
        </p>
      </div>
    </div>
  );
}
