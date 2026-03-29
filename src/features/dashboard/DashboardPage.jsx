import { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Fish, AlertTriangle, Calendar, Waves, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';
import species from './data/species.json';
import restPeriods from './data/rest-periods.json';

export default function DashboardPage() {
  const { role } = useAuthStore();
  const { sst, language } = useAppStore();
  const t = useTranslation(language);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Calculer les stats
  const stats = {
    speciesSuivies: species.length,
    precisionIA: 86.8,
    cpueMoyenne: species.reduce((acc, s) => acc + s.tendance_cpue_2y_pct, 0) / species.length,
    arretsActifs: 2, // Simulé - en production, calculer depuis restPeriods
  };

  // Données pour le graphique CPUE par espèce
  const cpueData = species.map(s => ({
    name: s.nom_commun,
    cpue: s.cpue_2025,
    tendance: s.tendance_cpue_2y_pct,
    icone: s.icone,
  }));

  // Données pour le graphique de taille vs maturité
  const maturityData = species.map(s => ({
    name: s.nom_commun,
    L50: s.L50_cm,
    poids: s.poids_maturite_g,
  }));

  // Données pour le pie chart des espèces
  const pieData = species.map(s => ({
    name: s.nom_commun,
    value: s.cpue_2025,
  }));

  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

  // Arrêts biologiques à venir (simulé)
  const upcomingRests = [
    {
      espece: 'Poulpe',
      icone: '🐙',
      start: '2026-04-01',
      end: '2026-06-30',
      raison: 'Période de reproduction - repos printemps',
    },
    {
      espece: 'Sardine',
      icone: '🐟',
      start: '2027-01-01',
      end: '2027-02-28',
      raison: 'Repos hivernal - Atlantique Sud',
    },
    {
      espece: 'Seiche',
      icone: '🦑',
      start: '2026-04-01',
      end: '2026-06-30',
      raison: 'Synchronisé avec poulpe',
    },
  ];

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42]">{t.dashboard.title}</h1>
          <p className="text-gray-600 mt-1">
            {t.dashboard.subtitle} <span className="capitalize font-medium">{role}</span>
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
        >
          <option value="7d">{t.dashboard.period7d}</option>
          <option value="30d">{t.dashboard.period30d}</option>
          <option value="3m">{t.dashboard.period3m}</option>
          <option value="1y">{t.dashboard.period1y}</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Fish}
          label={t.dashboard.speciesMonitored}
          value={stats.speciesSuivies}
          color="blue"
          suffix=""
        />
        <StatCard
          icon={BarChart3}
          label={t.dashboard.aiPrecision}
          value={stats.precisionIA}
          color="green"
          suffix="%"
        />
        <StatCard
          icon={TrendingDown}
          label={t.dashboard.averageCPUE}
          value={stats.cpueMoyenne.toFixed(1)}
          color="orange"
          suffix="%"
          trend
        />
        <StatCard
          icon={AlertTriangle}
          label={t.dashboard.activeClosures}
          value={stats.arretsActifs}
          color="red"
          suffix=""
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPUE par espèce */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t.dashboard.cpueBySpecies}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cpueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cpue" fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition des captures */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
            <Fish className="w-5 h-5" />
            {t.dashboard.catchDistribution}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendances CPUE */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          {t.dashboard.cpueTrends}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cpueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tendance" fill="#EF4444" name={t.dashboard.trend} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grille inférieure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Espèces en détail */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4">{t.dashboard.speciesDetails}</h2>
          <div className="space-y-3">
            {species.map((s) => (
              <div key={s.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.icone}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{s.nom_commun}</p>
                    <p className="text-xs text-gray-500 italic">{s.nom_scientifique}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{s.cpue_2025} kg/sortie</p>
                  <p className={`text-xs ${s.tendance_cpue_2y_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {s.tendance_cpue_2y_pct > 0 ? '+' : ''}{s.tendance_cpue_2y_pct}% ({t.dashboard.years2})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrêts biologiques à venir */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t.dashboard.nextBiologicalClosures}
          </h2>
          {upcomingRests.length > 0 ? (
            <div className="space-y-3">
              {upcomingRests.map((rest, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                  <span className="text-2xl">{rest.icone}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{rest.espece}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(rest.start).toLocaleDateString('fr-FR')} → {new Date(rest.end).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{rest.raison}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t.dashboard.noPlannedClosure}
            </div>
          )}
        </div>
      </div>

      {/* Conditions océanographiques */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-[#041E42] mb-4 flex items-center gap-2">
          <Waves className="w-5 h-5" />
          {t.dashboard.oceanographicConditions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t.dashboard.surfaceTemp}</p>
            <p className="text-3xl font-bold text-[#0EA5E9]">{sst.sst.toFixed(1)}°C</p>
            <p className="text-xs text-gray-500 mt-1">{sst.source}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t.dashboard.zone}</p>
            <p className="text-2xl font-bold text-gray-900">Dakhla</p>
            <p className="text-xs text-gray-500 mt-1">23.7°N, 15.9°W</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{t.dashboard.upwellingState}</p>
            <p className="text-2xl font-bold text-green-600">{t.dashboard.activeUpwelling}</p>
            <p className="text-xs text-gray-500 mt-1">{t.dashboard.favorableConditions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, suffix = '', trend = false }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#041E42]">
        {trend && value < 0 ? '' : ''}{value}{suffix}
      </p>
    </div>
  );
}
