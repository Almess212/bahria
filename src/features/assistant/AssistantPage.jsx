import { useState } from 'react';
import { Cloud, CloudRain, Wind, Sun, TrendingUp, Calendar, Fish, AlertCircle } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function AssistantPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [selectedSpecies, setSelectedSpecies] = useState('poulpe');

  // Données météo simulées
  const weatherData = {
    today: { temp: 22, wind: 15, condition: 'Ensoleillé', icon: Sun, quality: 'Excellent' },
    tomorrow: { temp: 21, wind: 18, condition: 'Nuageux', icon: Cloud, quality: 'Bon' },
    day3: { temp: 20, wind: 22, condition: 'Venteux', icon: Wind, quality: 'Moyen' },
    day4: { temp: 19, wind: 12, condition: 'Ensoleillé', icon: Sun, quality: 'Excellent' },
  };

  // Calendrier saisonnalité par espèce
  const seasonality = {
    poulpe: {
      optimal: ['Mars', 'Avril', 'Septembre', 'Octobre'],
      moderate: ['Mai', 'Août', 'Novembre'],
      low: ['Janvier', 'Février', 'Juin', 'Juillet', 'Décembre'],
      reproduction: ['Mars-Avril', 'Sept-Oct'],
      currentStatus: 'Période modérée',
    },
    sardine: {
      optimal: ['Novembre', 'Décembre', 'Janvier', 'Février'],
      moderate: ['Mars', 'Octobre'],
      low: ['Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre'],
      reproduction: ['Nov-Fév'],
      currentStatus: 'Hors saison optimale',
    },
    seiche: {
      optimal: ['Février', 'Mars', 'Juillet', 'Août'],
      moderate: ['Janvier', 'Avril', 'Septembre'],
      low: ['Mai', 'Juin', 'Octobre', 'Novembre', 'Décembre'],
      reproduction: ['Avril-Juin'],
      currentStatus: 'Période optimale',
    },
    courbine: {
      optimal: ['Avril', 'Août', 'Septembre', 'Octobre'],
      moderate: ['Mars', 'Novembre'],
      low: ['Janvier', 'Février', 'Mai', 'Juin', 'Juillet', 'Décembre'],
      reproduction: ['Mai-Juillet'],
      currentStatus: 'Hors saison',
    },
  };

  // Projections stocks (simulées)
  const stockProjections = {
    poulpe: { current: 'Moyen', trend: 'Stable', projection7d: 'Amélioration légère', cpueEstimee: '35-40 kg' },
    sardine: { current: 'Faible', trend: 'Déclin', projection7d: 'Maintien faible', cpueEstimee: '550-600 kg' },
    seiche: { current: 'Bon', trend: 'Stable', projection7d: 'Stable', cpueEstimee: '24-28 kg' },
    courbine: { current: 'Très faible', trend: 'Déclin fort', projection7d: 'Critique', cpueEstimee: '8-12 kg' },
  };

  const current = seasonality[selectedSpecies];
  const stock = stockProjections[selectedSpecies];

  // Recommandations
  const getRecommendation = () => {
    const month = new Date().getMonth();
    const isOptimal = month >= 2 && month <= 3; // Mars-Avril pour le poulpe (exemple)

    if (selectedSpecies === 'poulpe' && isOptimal) {
      return {
        text: t.assistant.recommendationTextOctopus,
        color: 'bg-green-50 border-green-500 text-green-900',
        icon: TrendingUp,
      };
    }

    return {
      text: t.assistant.recommendationTextOther.replace('{species}', selectedSpecies),
      color: 'bg-blue-50 border-blue-500 text-blue-900',
      icon: AlertCircle,
    };
  };

  const recommendation = getRecommendation();
  const RecommendationIcon = recommendation.icon;

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#041E42]">{t.assistant.title}</h1>
        <p className="text-gray-600 mt-1">{t.assistant.subtitle}</p>
      </div>

      {/* Sélecteur d'espèce */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.assistant.targetSpecies}</label>
        <select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
        >
          <option value="poulpe">🐙 {t.assistant.octopus}</option>
          <option value="sardine">🐟 {t.assistant.sardine}</option>
          <option value="seiche">🦑 {t.assistant.cuttlefish}</option>
          <option value="courbine">🐠 {t.assistant.meagre}</option>
        </select>
      </div>

      {/* Recommandation principale */}
      <div className={`border-l-4 rounded-xl shadow-sm p-6 ${recommendation.color}`}>
        <div className="flex items-start gap-3">
          <RecommendationIcon className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-2">{t.assistant.dailyRecommendation}</h2>
            <p className="text-lg">{recommendation.text}</p>
          </div>
        </div>
      </div>

      {/* Météo marine */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          {t.assistant.weatherForecast}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(weatherData).map(([key, data]) => {
            const Icon = data.icon;
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {key === 'today' ? t.assistant.today : key === 'tomorrow' ? t.assistant.tomorrow : key.replace('day', 'J+')}
                </p>
                <Icon className="w-12 h-12 mx-auto mb-2 text-[#0EA5E9]" />
                <p className="text-2xl font-bold text-gray-900">{data.temp}°C</p>
                <p className="text-sm text-gray-600">{data.condition}</p>
                <p className="text-xs text-gray-500 mt-1">{t.assistant.wind} {data.wind} km/h</p>
                <p className={`text-xs font-semibold mt-2 ${
                  data.quality === 'Excellent' ? 'text-green-600' :
                  data.quality === 'Bon' ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {data.quality} {t.assistant.forFishing}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Saisonnalité + Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier saisonnalité */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.assistant.seasonality} {selectedSpecies}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.assistant.optimalPeriod}</p>
              <div className="flex flex-wrap gap-2">
                {current.optimal.map((month) => (
                  <span key={month} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {month}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.assistant.moderatePeriod}</p>
              <div className="flex flex-wrap gap-2">
                {current.moderate.map((month) => (
                  <span key={month} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {month}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.assistant.reproductionPeriods}</p>
              <div className="flex flex-wrap gap-2">
                {current.reproduction.map((period) => (
                  <span key={period} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {period}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">{t.assistant.currentStatus}</p>
              <p className="text-lg font-bold text-[#041E42] mt-1">{current.currentStatus}</p>
            </div>
          </div>
        </div>

        {/* Projections stocks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
            <Fish className="w-5 h-5" />
            {t.assistant.stockProjections}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t.assistant.currentState}</span>
              <span className={`font-semibold ${
                stock.current === 'Bon' ? 'text-green-600' :
                stock.current === 'Moyen' ? 'text-blue-600' :
                stock.current === 'Faible' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {stock.current}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t.assistant.trend}</span>
              <span className={`font-semibold ${
                stock.trend === 'Stable' ? 'text-blue-600' :
                stock.trend.includes('Déclin') ? 'text-red-600' : 'text-green-600'
              }`}>
                {stock.trend}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{t.assistant.projection7d}</span>
              <span className="font-semibold text-gray-900">{stock.projection7d}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">{t.assistant.estimatedCPUE}</span>
              <span className="font-bold text-[#0EA5E9]">{stock.cpueEstimee}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              {t.assistant.projectionsNote}
            </p>
          </div>
        </div>
      </div>

      {/* Fenêtres de pêche optimales (aujourd'hui) */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-[#041E42] mb-4">{t.assistant.optimalWindows}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t.assistant.morning}</p>
            <p className="text-2xl font-bold text-green-600">6h - 10h</p>
            <p className="text-xs text-gray-500 mt-1">{t.assistant.calmSea}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t.assistant.midday}</p>
            <p className="text-2xl font-bold text-blue-600">10h - 14h</p>
            <p className="text-xs text-gray-500 mt-1">{t.assistant.moderateWind}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t.assistant.evening}</p>
            <p className="text-2xl font-bold text-orange-600">16h - 19h</p>
            <p className="text-xs text-gray-500 mt-1">{t.assistant.strongWind}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
