import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import { Map as MapIcon, Layers, MapPin, Info, AlertTriangle, Calendar, XCircle, TrendingDown, TrendingUp, Waves, Wind, Droplets, Eye, Anchor } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import species from '../analysis/data/species.json';
import { computeFeatures } from '../analysis/model/features';
import { predict } from '../analysis/model/predict';
import { fetchCurrentSST } from '../analysis/noaa';
import SignalCard from '../analysis/SignalCard';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Créer des icônes personnalisées par région
const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.437 12.5 28.5 12.5 28.5S25 20.937 25 12.5C25 5.596 19.404 0 12.5 0z"
              fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
};

// Icônes par région (correspondant aux couleurs des badges)
const regionIcons = {
  'Atlantique Nord': createColoredIcon('#3B82F6'),      // Bleu
  'Atlantique Centre': createColoredIcon('#10B981'),    // Vert
  'Atlantique Sud': createColoredIcon('#F59E0B'),       // Ambre/Orange
  'Méditerranée': createColoredIcon('#A855F7'),         // Violet
  'Dakhla': createColoredIcon('#06B6D4')                // Cyan pour zones locales
};

// Points géographiques de référence - Maroc (du document officiel)
const geographicPoints = [
  { id: 'P1', name: 'Cap Spartel', lat: 35.79, lng: -5.92, type: 'reference', role: 'Limite Nord', region: 'Atlantique Nord',
    meteo: { sst: 17.0, wind: 14, waves: 1.4, visibility: 9, salinity: 36.3 } },
  { id: 'P2', name: 'Safi', lat: 32.30, lng: -9.24, type: 'port', role: 'Limite zone pélagiques Atlantique Centre', region: 'Atlantique Nord', port: true,
    meteo: { sst: 18.0, wind: 16, waves: 1.7, visibility: 8, salinity: 35.9 } },
  { id: 'P3', name: 'Agadir', lat: 30.42, lng: -9.60, type: 'port', role: 'Limite zone courbine Z2', region: 'Atlantique Centre', port: true,
    meteo: { sst: 17.9, wind: 20, waves: 2.1, visibility: 7, salinity: 35.7 } },
  { id: 'P4', name: 'Imessouane', lat: 30.85, lng: -9.82, type: 'reference', role: 'Limite zone courbine Z3', region: 'Atlantique Centre',
    meteo: { sst: 17.7, wind: 21, waves: 2.3, visibility: 7, salinity: 35.6 } },
  { id: 'P5', name: 'Sidi L\'Ghazi', lat: 30.20, lng: -9.82, type: 'reference', role: 'Limite zone seiche / sud', region: 'Atlantique Centre',
    meteo: { sst: 18.1, wind: 19, waves: 2.0, visibility: 8, salinity: 35.7 } },
  { id: 'P6', name: 'Tan-Tan', lat: 28.44, lng: -11.10, type: 'port', role: 'Limite bande 8 milles poulpe', region: 'Atlantique Centre', port: true,
    meteo: { sst: 18.2, wind: 18, waves: 2.0, visibility: 8, salinity: 35.8 } },
  { id: 'P7', name: 'Laâyoune', lat: 27.16, lng: -13.20, type: 'port', role: 'Limite zone courbine Z2 (sud)', region: 'Atlantique Sud', port: true,
    meteo: { sst: 18.6, wind: 16, waves: 1.6, visibility: 9, salinity: 35.6 } },
  { id: 'P8', name: 'Cap Boujdour', lat: 26.13, lng: -14.49, type: 'reference', role: 'Limite Atlantique Centre / Sud pélagiques', region: 'Atlantique Sud',
    meteo: { sst: 18.8, wind: 15, waves: 1.5, visibility: 9, salinity: 35.5 } },
  { id: 'P9', name: 'Dakhla', lat: 23.71, lng: -15.94, type: 'port', role: 'Zone non-pêche permanente (Stock C)', region: 'Atlantique Sud', port: true,
    meteo: { sst: 19.2, wind: 12, waves: 0.8, visibility: 10, salinity: 35.4 } },
  { id: 'P10', name: 'Parallèle 22°43\'N', lat: 22.72, lng: -16.50, type: 'reference', role: 'Limite arrêt poulpe prolongé', region: 'Atlantique Sud',
    meteo: { sst: 19.5, wind: 11, waves: 0.7, visibility: 10, salinity: 35.3 } },
  { id: 'P11', name: 'Cap Blanc', lat: 20.77, lng: -17.05, type: 'reference', role: 'Limite Sud – Cap Blanc (Mauritanie)', region: 'Atlantique Sud',
    meteo: { sst: 20.0, wind: 10, waves: 0.6, visibility: 10, salinity: 35.2 } },
];

// Autres grands ports de pêche du Maroc (avec données météorologiques et océanographiques)
const majorPorts = [
  { id: 'PA1', name: 'Tanger', lat: 35.77, lng: -5.80, type: 'port', region: 'Méditerranée', activities: ['Petits pélagiques', 'Blanc'],
    meteo: { sst: 16.8, wind: 15, waves: 1.5, visibility: 8, salinity: 36.5 } },
  { id: 'PA2', name: 'Larache', lat: 35.19, lng: -6.15, type: 'port', region: 'Atlantique Nord', activities: ['Sardine', 'Crevette'],
    meteo: { sst: 17.2, wind: 18, waves: 2.0, visibility: 7, salinity: 36.2 } },
  { id: 'PA3', name: 'Kénitra', lat: 34.26, lng: -6.58, type: 'port', region: 'Atlantique Nord', activities: ['Sardine'],
    meteo: { sst: 17.5, wind: 16, waves: 1.8, visibility: 8, salinity: 36.0 } },
  { id: 'PA4', name: 'Casablanca', lat: 33.60, lng: -7.62, type: 'port', region: 'Atlantique Nord', activities: ['Sardine', 'Commercial'], major: true,
    meteo: { sst: 18.1, wind: 14, waves: 1.2, visibility: 9, salinity: 35.8 } },
  { id: 'PA5', name: 'Mohammedia', lat: 33.69, lng: -7.38, type: 'port', region: 'Atlantique Nord', activities: ['Sardine', 'Petits pélagiques'],
    meteo: { sst: 18.0, wind: 14, waves: 1.3, visibility: 9, salinity: 35.9 } },
  { id: 'PA6', name: 'El Jadida', lat: 33.23, lng: -8.50, type: 'port', region: 'Atlantique Nord', activities: ['Sardine', 'Poulpe'],
    meteo: { sst: 18.3, wind: 17, waves: 1.6, visibility: 8, salinity: 35.7 } },
  { id: 'PA7', name: 'Essaouira', lat: 31.51, lng: -9.77, type: 'port', region: 'Atlantique Centre', activities: ['Sardine', 'Poulpe'], major: true,
    meteo: { sst: 17.8, wind: 22, waves: 2.5, visibility: 7, salinity: 35.5 } },
  { id: 'PA8', name: 'Sidi Ifni', lat: 29.38, lng: -10.17, type: 'port', region: 'Atlantique Centre', activities: ['Poulpe', 'Blanc'],
    meteo: { sst: 18.5, wind: 19, waves: 2.2, visibility: 8, salinity: 35.6 } },
];

// Zones de pêche spécifiques (combinaison des points de référence + ports locaux)
const fishingZones = [
  // Dakhla et environs
  { id: 1, name: 'Lassarga', lat: 23.8, lng: -15.95, temp: 18.5, type: 'poulpe', status: 'active', region: 'Dakhla',
    meteo: { sst: 18.5, wind: 13, waves: 1.0, visibility: 10, salinity: 35.4 } },
  { id: 2, name: 'Port Dakhla', lat: 23.72, lng: -15.93, temp: 19.2, type: 'sardine', status: 'active', region: 'Dakhla', port: true,
    meteo: { sst: 19.2, wind: 12, waves: 0.8, visibility: 10, salinity: 35.4 } },
  { id: 3, name: 'Baie de Dakhla', lat: 23.65, lng: -15.88, temp: 18.8, type: 'mixed', status: 'restricted', region: 'Dakhla',
    meteo: { sst: 18.8, wind: 11, waves: 0.6, visibility: 10, salinity: 35.5 } },
  { id: 4, name: 'Cintra', lat: 23.5, lng: -16.0, temp: 17.9, type: 'courbine', status: 'active', region: 'Dakhla',
    meteo: { sst: 17.9, wind: 14, waves: 1.2, visibility: 9, salinity: 35.6 } },
];

// Arrêts biologiques réels - Maroc 2025-2026
// Source: Secrétariat d'État à la Pêche Maritime • INRH • Arrêté ministériel n° 25/07
const biologicalClosures = [
  {
    id: 1,
    espece: 'Poulpe',
    scientificName: 'Octopus vulgaris',
    startDate: '2025-09-16',
    endDate: '2025-12-31',
    reason: 'Période de reproduction - Arrêt automnal',
    zones: ['Littoral national - Cap Spartel à Cap Blanc'],
    baseReglementaire: 'Arrêté ministériel n° 25/07 – 11 sept. 2025',
    active: false // Terminé le 31 déc 2025
  },
  {
    id: 2,
    espece: 'Seiche',
    scientificName: 'Sepia officinalis',
    startDate: '2025-09-16',
    endDate: '2025-12-15',
    reason: 'Synchronisé avec arrêt poulpe',
    zones: ['Sud de Sidi L\'Ghazi jusqu\'à Boujdour'],
    baseReglementaire: 'Arrêté n° 25/07',
    active: false // Terminé le 15 déc 2025
  },
  {
    id: 3,
    espece: 'Petits pélagiques',
    subSpecies: ['Sardine', 'Anchois', 'Maquereau', 'Chinchard'],
    scientificName: 'Sardina pilchardus, Engraulis encrasicolus, Scomber scombrus, Trachurus trachurus',
    startDate: '2025-11-01',
    endDate: '2026-02-15',
    reason: 'Période de reproduction et reconstitution des stocks',
    zones: ['Atlantique Centre (Safi → Cap Boujdour)', 'Atlantique Sud (Cap Boujdour → Cap Blanc)'],
    baseReglementaire: 'Décisions du 4 nov. 2025 + PP-01/26',
    active: false, // Terminé le 15 fév 2026 (nous sommes en mars 2026)
    note: '75 senneurs autorisés à partir du 1er janvier 2026'
  },
  {
    id: 4,
    espece: 'Courbine',
    scientificName: 'Argyrosomus regius',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    reason: 'Arrêt annuel de décembre',
    zones: ['Boujdour → Dakhla', 'Laâyoune → Agadir', 'Nord Imessouane (Essaouira)'],
    baseReglementaire: 'Décision ministérielle + quota annuel',
    active: false // Terminé le 31 déc 2025
  },
];

// Zones d'arrêts biologiques (cercles sur la carte)
// Actuellement AUCUNE zone active (Mars 2026)
const restrictedZones = [
  // Zone permanente non-pêche Dakhla (Stock C)
  {
    id: 1,
    lat: 23.71,
    lng: -15.94,
    radius: 15000,
    espece: 'Toutes espèces',
    endDate: null, // Permanente
    permanent: true,
    reason: 'Zone de non-pêche permanente (Stock C)',
    baseReglementaire: 'Arrêté ministériel n° 25/07 – 11 sept. 2025'
  },
];

export default function MapPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);

  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [layersVisible, setLayersVisible] = useState({
    zones: true,
    sst: true,
    restrictions: true,
  });
  const [oceanData, setOceanData] = useState(null);
  const [speciesPredictions, setSpeciesPredictions] = useState({});
  const [loading, setLoading] = useState(true);

  // Centre sur le Maroc (entre Tanger et Cap Blanc)
  const center = [28.0, -10.0]; // Centre approximatif du littoral marocain

  const activeClosures = biologicalClosures.filter(c => c.active);
  const closedClosures = biologicalClosures.filter(c => !c.active);

  // Charger les données océano et calculer les prédictions pour toutes les espèces
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        // Récupérer SST actuelle
        const sstData = await fetchCurrentSST();
        setOceanData({
          sst: sstData.sst,
          upwelling: 0.5,
          date: sstData.date,
          source: sstData.source,
          live: sstData.live
        });

        // Calculer les prédictions pour chaque espèce
        const predictions = {};
        species.forEach(sp => {
          // Créer un échantillon fictif basé sur les moyennes de l'espèce
          const sample = {
            speciesCode: sp.code,
            avgSize: sp.L50_cm - 2, // Un peu sous L50 pour simuler un risque
            avgWeight: sp.poids_maturite_g - 50,
            cpue: sp.cpue_2025 || sp.cpue_2024 || 100,
            zone: sp.zones[0],
            date: new Date().toISOString()
          };

          // Calculer les features
          const features = computeFeatures(sample, sp, {
            sst: sstData.sst,
            upwelling: 0.5
          });

          // Prédiction
          const prediction = predict(features, sp);

          predictions[sp.code] = {
            species: sp,
            sample,
            features,
            prediction
          };
        });

        setSpeciesPredictions(predictions);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des prédictions:', error);
        setLoading(false);
      }
    };

    loadPredictions();
  }, []);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#041E42]">{t.map.title}</h1>
        <p className="text-gray-600 mt-1">{t.map.subtitle}</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">{t.map.layers}</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={layersVisible.zones}
              onChange={(e) => setLayersVisible({ ...layersVisible, zones: e.target.checked })}
              className="w-4 h-4 text-[#0EA5E9] rounded"
            />
            <span className="text-sm text-gray-700">{t.map.fishingZones}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={layersVisible.sst}
              onChange={(e) => setLayersVisible({ ...layersVisible, sst: e.target.checked })}
              className="w-4 h-4 text-[#0EA5E9] rounded"
            />
            <span className="text-sm text-gray-700">{t.map.sst}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={layersVisible.restrictions}
              onChange={(e) => setLayersVisible({ ...layersVisible, restrictions: e.target.checked })}
              className="w-4 h-4 text-[#0EA5E9] rounded"
            />
            <span className="text-sm text-gray-700">{t.map.biologicalClosures}</span>
          </label>
        </div>
      </div>

      {/* Données Météorologiques et Océanographiques - Port Sélectionné */}
      {(() => {
        // Port par défaut: Dakhla (ma zone)
        const defaultPort = geographicPoints.find(p => p.id === 'P9'); // Dakhla
        const defaultMeteo = {
          sst: oceanData?.sst || 19.2,
          wind: 12,
          waves: 0.8,
          visibility: 10,
          salinity: 35.4
        };

        // Récupérer le port sélectionné ou utiliser Dakhla par défaut
        const displayPort = selectedZone?.meteo
          ? selectedZone
          : { ...defaultPort, name: 'Ma Zone - Dakhla', meteo: defaultMeteo, region: 'Atlantique Sud' };

        return (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-[#0EA5E9]" />
                <h3 className="font-bold text-lg text-[#041E42]">{t.map.oceanographic}</h3>
              </div>
              {!selectedZone?.meteo && (
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-semibold">
                  📍 {t.map.defaultZone}
                </span>
              )}
            </div>

            <div className="border-2 border-[#0EA5E9] rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
              {/* En-tête du port */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Anchor className="w-6 h-6 text-[#0EA5E9]" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                      {displayPort.name}
                      {displayPort.major && <span className="text-amber-500">⭐</span>}
                    </h4>
                    <p className="text-sm text-gray-600">{displayPort.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{language === 'ar' ? 'إحداثيات' : 'Coordonnées'}</p>
                  <p className="text-sm font-mono text-gray-700">
                    {displayPort.lat.toFixed(2)}°N, {Math.abs(displayPort.lng).toFixed(2)}°W
                  </p>
                </div>
              </div>

              {/* Données météo - Grille responsive */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* SST - Température */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">SST</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-700">
                    {displayPort.meteo.sst}°C
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.map.seaTemp}</p>
                </div>

                {/* Vent */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5 text-sky-600" />
                    <span className="text-sm font-medium text-sky-900">{t.map.wind}</span>
                  </div>
                  <div className="text-3xl font-bold text-sky-700">
                    {displayPort.meteo.wind}<span className="text-lg">kts</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.map.windForce}</p>
                </div>

                {/* Vagues */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{t.map.waves}</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {displayPort.meteo.waves}m
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.map.waveHeight}</p>
                </div>

                {/* Visibilité */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">{t.map.visibility}</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {displayPort.meteo.visibility}<span className="text-lg">km</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.map.visualRange}</p>
                </div>

                {/* Salinité */}
                <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-medium text-teal-900">{t.map.salinity}</span>
                  </div>
                  <div className="text-3xl font-bold text-teal-700">
                    {displayPort.meteo.salinity}<span className="text-sm">PSU</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.map.dissolvedSalt}</p>
                </div>
              </div>

              {/* Indicateur de conditions global */}
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">État des conditions de pêche:</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-4 py-2 rounded-lg ${
                      displayPort.meteo.waves <= 1.5 && displayPort.meteo.wind <= 15
                        ? 'bg-green-500 text-white shadow-lg'
                        : displayPort.meteo.waves <= 2.0 && displayPort.meteo.wind <= 20
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-red-500 text-white shadow-lg'
                    }`}>
                      {displayPort.meteo.waves <= 1.5 && displayPort.meteo.wind <= 15
                        ? '✅ Favorables'
                        : displayPort.meteo.waves <= 2.0 && displayPort.meteo.wind <= 20
                        ? '⚠️ Modérées'
                        : '❌ Difficiles'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span><span className="font-semibold">Aide:</span> Cliquez sur un port de pêche sur la carte pour voir ses conditions météo • Données mises à jour en temps réel</span>
              </p>
            </div>
          </div>
        );
      })()}

      {/* Map Container et Légende côte à côte */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Map Container */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>
          <MapContainer
            center={center}
            zoom={6}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains='abcd'
            maxZoom={20}
          />

          {/* Points géographiques de référence */}
          {layersVisible.zones && geographicPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={regionIcons[point.region]}
              eventHandlers={{
                click: () => setSelectedZone(point),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-[#041E42] mb-2">
                    {point.port ? '⚓' : '📍'} {point.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Région:</span> {point.region}</p>
                    <p><span className="font-medium">Rôle:</span> {point.role}</p>
                    <p className="text-xs text-gray-600">
                      {point.lat.toFixed(2)}°N, {Math.abs(point.lng).toFixed(2)}°W
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Autres grands ports */}
          {layersVisible.zones && majorPorts.map((port) => (
            <Marker
              key={port.id}
              position={[port.lat, port.lng]}
              icon={regionIcons[port.region]}
              eventHandlers={{
                click: () => setSelectedZone(port),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-blue-700 mb-2">
                    {port.major ? '⚓⭐' : '⚓'} Port de {port.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Région:</span> {port.region}</p>
                    <p><span className="font-medium">Activités:</span></p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {port.activities.map((activity, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                          {activity}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {port.lat.toFixed(2)}°N, {Math.abs(port.lng).toFixed(2)}°W
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Zones de pêche locales (Dakhla) */}
          {layersVisible.zones && fishingZones.map((zone) => (
            <Marker
              key={zone.id}
              position={[zone.lat, zone.lng]}
              icon={regionIcons['Dakhla']}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-[#041E42] mb-2">
                    {zone.port ? '⚓' : '🎣'} {zone.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Type:</span> {zone.type}</p>
                    <p><span className="font-medium">SST:</span> {zone.temp}°C</p>
                    <p><span className="font-medium">Région:</span> {zone.region}</p>
                    <p>
                      <span className="font-medium">Statut:</span>{' '}
                      <span className={zone.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {zone.status === 'active' ? 'Actif' : 'Restreint'}
                      </span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Zones d'arrêts biologiques */}
          {layersVisible.restrictions && restrictedZones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: zone.permanent ? '#991B1B' : '#EF4444',
                fillColor: zone.permanent ? '#991B1B' : '#EF4444',
                fillOpacity: zone.permanent ? 0.3 : 0.2,
                weight: zone.permanent ? 2 : 1,
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className={`font-bold mb-2 ${zone.permanent ? 'text-red-900' : 'text-red-600'}`}>
                    {zone.permanent ? '⛔ Zone de non-pêche PERMANENTE' : 'Zone d\'arrêt biologique'}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Espèce:</span> {zone.espece}</p>
                    {zone.permanent ? (
                      <p className="text-red-700 font-bold">Interdiction permanente depuis le 8 sept. 2025</p>
                    ) : (
                      <p><span className="font-medium">Fin:</span> {new Date(zone.endDate).toLocaleDateString('fr-FR')}</p>
                    )}
                    <p><span className="font-medium">Rayon:</span> {(zone.radius / 1000).toFixed(1)} km</p>
                    {zone.reason && <p className="text-xs text-gray-600 mt-1">{zone.reason}</p>}
                    {zone.baseReglementaire && (
                      <p className="text-xs text-blue-600 mt-1 italic">{zone.baseReglementaire}</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Couche SST (simulation avec des cercles de chaleur) */}
          {layersVisible.sst && fishingZones.map((zone) => (
            <Circle
              key={`sst-${zone.id}`}
              center={[zone.lat, zone.lng]}
              radius={3000}
              pathOptions={{
                color: zone.temp > 19 ? '#F59E0B' : '#0EA5E9',
                fillColor: zone.temp > 19 ? '#F59E0B' : '#0EA5E9',
                fillOpacity: 0.15,
                weight: 0,
              }}
            />
          ))}
        </MapContainer>
        </div>

        {/* Légende */}
        <div className="lg:w-80 bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-[#041E42] mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Légende
        </h3>

        <div className="space-y-4">
          {/* Points et Zones */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Points et Zones</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" className="w-4 h-6" alt="marker" />
                <span className="text-xs text-gray-700">⚓ Ports majeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" className="w-4 h-6" alt="marker" />
                <span className="text-xs text-gray-700">⚓⭐ Ports principaux</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" className="w-4 h-6" alt="marker" />
                <span className="text-xs text-gray-700">📍 Points de référence</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" className="w-4 h-6" alt="marker" />
                <span className="text-xs text-gray-700">🎣 Zones de pêche</span>
              </div>
            </div>
          </div>

          {/* Régions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Régions halieutiques (couleurs des marqueurs)</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#3B82F6'}}></span>
                Atlantique Nord
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#10B981'}}></span>
                Atlantique Centre
              </span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#F59E0B'}}></span>
                Atlantique Sud
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#A855F7'}}></span>
                Méditerranée
              </span>
              <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#06B6D4'}}></span>
                Ma zone dakhla
              </span>
            </div>
          </div>

          {/* Zones réglementaires */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Zones réglementaires</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#991B1B] opacity-40 rounded-full border-2 border-[#991B1B]"></div>
                <span className="text-xs text-gray-700 font-semibold">Non-pêche permanente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#EF4444] opacity-30 rounded-full"></div>
                <span className="text-xs text-gray-700">Arrêt biologique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#0EA5E9] opacity-30 rounded-full"></div>
                <span className="text-xs text-gray-700">Zone SST froide</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Total:</span> {geographicPoints.length} points de référence • {majorPorts.length} grands ports • {fishingZones.length} zones locales Dakhla
          </p>
        </div>
      </div>
      </div>

      {/* Zone sélectionnée */}
      {selectedZone && (
        <div className="bg-blue-50 border-l-4 border-[#0EA5E9] rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-[#041E42] mb-2">
                {selectedZone.port ? '⚓' : selectedZone.type === 'reference' ? '📍' : '🎣'} {selectedZone.name}
              </h3>

              {/* Affichage conditionnel selon le type */}
              {selectedZone.role ? (
                // Point géographique de référence ou port avec rôle
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Région: </span>
                    <span className="text-gray-900">{selectedZone.region}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Rôle: </span>
                    <span className="text-gray-900">{selectedZone.role}</span>
                  </div>
                  {selectedZone.activities && (
                    <div>
                      <span className="text-gray-600 font-medium">Activités: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedZone.activities.map((activity, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 font-medium">Position: </span>
                    <span className="text-gray-900">
                      {selectedZone.lat.toFixed(2)}°N, {Math.abs(selectedZone.lng).toFixed(2)}°W
                    </span>
                  </div>
                </div>
              ) : (
                // Zone de pêche locale (avec SST, statut, etc.)
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedZone.type}</p>
                  </div>
                  {selectedZone.temp && (
                    <div>
                      <p className="text-gray-600">SST</p>
                      <p className="font-semibold text-gray-900">{selectedZone.temp}°C</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Position</p>
                    <p className="font-semibold text-gray-900">{selectedZone.lat.toFixed(2)}°N, {Math.abs(selectedZone.lng).toFixed(2)}°W</p>
                  </div>
                  {selectedZone.status && (
                    <div>
                      <p className="text-gray-600">Statut</p>
                      <p className={`font-semibold ${selectedZone.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedZone.status === 'active' ? 'Actif' : 'Restreint'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Arrêts Biologiques Actifs - Alerte */}
      {activeClosures.length > 0 ? (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Arrêts Biologiques en cours ({activeClosures.length} espèce{activeClosures.length > 1 ? 's' : ''})
              </h3>
              <p className="text-sm text-red-800 mb-3">
                La pêche des espèces suivantes est <span className="font-bold">INTERDITE</span> jusqu'à nouvel ordre:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {activeClosures.map((closure) => (
                  <div key={closure.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-red-900 text-lg">{closure.espece}</h4>
                        <p className="text-xs italic text-gray-600">{closure.scientificName}</p>
                      </div>
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        INTERDIT
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="font-medium">Période:</span>
                        <span>
                          {new Date(closure.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          {' → '}
                          {new Date(closure.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Raison:</span>
                          <p className="text-gray-600">{closure.reason}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Zones:</span>
                          <p className="text-gray-600">{closure.zones.join(', ')}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Jours restants:
                          </span>
                          <span className="font-bold text-red-600">
                            {Math.max(0, Math.ceil((new Date(closure.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} jours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <span className="font-bold">⚠️ Attention:</span> La pêche, le transport, et la commercialisation de ces espèces sont strictement interdits pendant les périodes d'arrêt.
                  Des contrôles sont effectués en mer et dans les ports. Sanctions prévues par la loi.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Aucun arrêt actif - Message informatif */
        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                ✅ Aucun arrêt biologique en cours (Mars 2026)
              </h3>
              <p className="text-sm text-green-800 mb-3">
                Toutes les espèces peuvent être pêchées légalement. Les arrêts biologiques de la saison 2025-2026 sont terminés.
              </p>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-3">Calendrier des arrêts terminés (2025-2026)</h4>

                <div className="space-y-3 text-sm">
                  {biologicalClosures.map((closure) => (
                    <div key={closure.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-bold text-gray-900">{closure.espece}</span>
                          {closure.subSpecies && (
                            <span className="text-xs text-gray-600 ml-2">
                              ({closure.subSpecies.join(', ')})
                            </span>
                          )}
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                          Terminé
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {new Date(closure.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {' → '}
                          {new Date(closure.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">Raison:</span> {closure.reason}
                      </p>

                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Zones:</span> {closure.zones.join(', ')}
                      </p>

                      {closure.note && (
                        <p className="text-xs text-blue-600 mt-1 italic">
                          ℹ️ {closure.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-bold">Source:</span> Secrétariat d'État à la Pêche Maritime • INRH • Arrêtés ministériels 2025-2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prédictions IA par espèce */}
      {!loading && Object.keys(speciesPredictions).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg text-[#041E42]">Analyse Prédictive IA - Toutes les espèces</h3>
            </div>
            {oceanData && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${oceanData.live ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                SST {oceanData.sst.toFixed(1)}°C • {oceanData.live ? 'Live NOAA' : 'Cache'}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Scores de risque calculés par le modèle Random Forest (86.8% précision) basés sur les données actuelles des stocks.
          </p>

          {/* Grille des espèces */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {species.map(sp => {
              const pred = speciesPredictions[sp.code];
              if (!pred) return null;

              const isInClosure = activeClosures.find(c => c.espece === sp.nom_commun);
              const riskColor = pred.prediction.riskScore >= 70 ? 'red' : pred.prediction.riskScore >= 45 ? 'amber' : 'green';

              return (
                <div
                  key={sp.code}
                  onClick={() => setSelectedSpecies(pred)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSpecies?.species.code === sp.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{sp.icone}</span>
                      <div>
                        <h4 className="font-bold text-gray-900">{sp.nom_commun}</h4>
                        <p className="text-xs italic text-gray-500">{sp.nom_scientifique}</p>
                      </div>
                    </div>
                    {isInClosure && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        FERMÉ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        riskColor === 'red' ? 'bg-red-100 text-red-700' :
                        riskColor === 'amber' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {pred.prediction.riskScore}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Score de risque</p>
                        <p className={`text-xs font-semibold ${
                          riskColor === 'red' ? 'text-red-700' :
                          riskColor === 'amber' ? 'text-amber-700' :
                          'text-green-700'
                        }`}>
                          {pred.prediction.urgency === 'immediat' ? 'Urgent' :
                           pred.prediction.urgency === 'sous_15j' ? 'Attention' :
                           pred.prediction.urgency === 'surveillance' ? 'Surveillance' : 'Normal'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-600">CPUE tendance</p>
                      <div className="flex items-center gap-1">
                        {sp.tendance_cpue_2y_pct < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        <span className={`text-sm font-bold ${sp.tendance_cpue_2y_pct < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {sp.tendance_cpue_2y_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signaux détaillés de l'espèce sélectionnée */}
          {selectedSpecies && (
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-[#041E42] flex items-center gap-2">
                  {selectedSpecies.species.icone} Signaux détaillés - {selectedSpecies.species.nom_commun}
                </h4>
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSpecies.prediction.signals
                  .sort((a, b) => {
                    const order = { critical: 0, warning: 1, ok: 2 };
                    return order[a.type] - order[b.type];
                  })
                  .map((signal, i) => (
                    <SignalCard key={i} signal={signal} />
                  ))}
              </div>

              {/* Recommandation */}
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">📋 Recommandation</h5>
                <p className="text-sm text-gray-800">
                  {selectedSpecies.prediction.riskScore >= 70 ? (
                    <>
                      <span className="font-bold text-red-700">Arrêt biologique immédiat recommandé.</span> Plusieurs indicateurs critiques détectés.
                      {activeClosures.find(c => c.espece === selectedSpecies.species.nom_commun) ? (
                        <span className="block mt-2 text-green-700 font-semibold">✅ Arrêt déjà en place jusqu'au {activeClosures.find(c => c.espece === selectedSpecies.species.nom_commun).endDate}</span>
                      ) : (
                        <span className="block mt-2 text-red-700 font-semibold">⚠️ Aucun arrêt en cours - Action requise</span>
                      )}
                    </>
                  ) : selectedSpecies.prediction.riskScore >= 45 ? (
                    <>Surveillance renforcée recommandée. Réévaluation dans 7 jours.</>
                  ) : (
                    <>Situation normale. Prochain contrôle dans 15 jours.</>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-gray-600">Chargement des prédictions IA...</p>
        </div>
      )}
    </div>
  );
}
