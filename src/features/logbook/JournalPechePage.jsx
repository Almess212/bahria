import { useState, useEffect } from 'react';
import { BookOpen, Plus, MapPin, Fish, Calendar, Download, Filter, Camera, Upload, Loader2, CheckCircle, XCircle, Ship, Anchor, User, Clock, Navigation, AlertCircle } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

const API_URL = 'http://localhost:3001';

export default function JournalPechePage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [formData, setFormData] = useState({
    // ✅ Informations navire (obligatoires - Dahir n°1-73-255)
    navire_nom: '',
    navire_immatriculation: '',
    capitaine_nom: '',
    equipage_nb: '',

    // ✅ Dates et heures (obligatoires)
    date_sortie: new Date().toISOString().split('T')[0],
    heure_depart: '',
    date_retour: new Date().toISOString().split('T')[0],
    heure_retour: '',

    // ✅ Zone de pêche (obligatoire - Loi 15-12)
    zone_nom: '',
    lat: '',
    lng: '',

    // ✅ Engins de pêche (obligatoire)
    engin_peche: '',

    // ✅ Captures par espèce (obligatoire)
    espece: '',
    quantite_kg: '',
    taille_moyenne_cm: '',

    // ✅ Débarquement (obligatoire)
    port_debarquement: 'Dakhla',

    // Observations
    meteo: '',
    notes: '',
  });

  const [entries, setEntries] = useState([
    {
      id: 1,
      date_sortie: '2026-03-27',
      navire_nom: 'Al Mouhajirine',
      navire_immatriculation: 'DK-1234',
      capitaine_nom: 'Mohammed Benali',
      espece: 'Poulpe',
      zone_nom: 'Lassarga',
      lat: 23.8,
      lng: -15.95,
      quantite_kg: 450,
      engin_peche: 'Casiers',
      port_debarquement: 'Dakhla',
      equipage_nb: 4,
    },
    {
      id: 2,
      date_sortie: '2026-03-26',
      navire_nom: 'Al Mouhajirine',
      navire_immatriculation: 'DK-1234',
      capitaine_nom: 'Mohammed Benali',
      espece: 'Sardine',
      zone_nom: 'Port Dakhla',
      lat: 23.72,
      lng: -15.93,
      quantite_kg: 1200,
      engin_peche: 'Senne',
      port_debarquement: 'Dakhla',
      equipage_nb: 6,
    },
  ]);

  const [filterEspece, setFilterEspece] = useState('all');

  const filteredEntries = filterEspece === 'all'
    ? entries
    : entries.filter(e => e.espece === filterEspece);

  // Charger le profil au montage pour pré-remplir le formulaire
  useEffect(() => {
    const savedProfile = localStorage.getItem('bahria_fisher_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          navire_nom: profile.navire_nom || '',
          navire_immatriculation: profile.navire_immatriculation || '',
          capitaine_nom: profile.capitaine_nom || '',
          equipage_nb: profile.equipage_habituel || '',
          engin_peche: profile.engin_principal || '',
          port_debarquement: profile.port_attache || 'Dakhla',
          zone_nom: profile.zone_habituelle || '',
        }));
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      }
    }
  }, []);

  // Stats
  const totalSorties = entries.length;
  const totalQuantite = entries.reduce((sum, e) => sum + e.quantite_kg, 0);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setAnalysisError(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setAnalysisError(null);

    const formDataImg = new FormData();
    formDataImg.append('image', selectedImage);

    try {
      const response = await fetch(`${API_URL}/api/analyze-image`, {
        method: 'POST',
        body: formDataImg,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de l\'analyse');
      }

      const result = await response.json();
      setAnalysisResult(result);

      // Remplir automatiquement les champs
      if (result.espece) {
        setFormData(prev => ({
          ...prev,
          espece: result.espece.charAt(0).toUpperCase() + result.espece.slice(1),
          taille_moyenne_cm: result.taille_moyenne_cm || '',
          quantite_kg: result.poids_total_kg || '',
        }));
      }

    } catch (error) {
      console.error('Erreur analyse:', error);
      setAnalysisError(error.message || 'Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      id: entries.length + 1,
      ...formData,
      quantite_kg: parseFloat(formData.quantite_kg) || 0,
      taille_moyenne_cm: parseFloat(formData.taille_moyenne_cm) || 0,
      equipage_nb: parseInt(formData.equipage_nb) || 0,
      lat: parseFloat(formData.lat) || 23.71,
      lng: parseFloat(formData.lng) || -15.94,
      image: imagePreview || null,
      timestamp_enregistrement: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);

    // Réinitialiser
    setShowForm(false);
    setFormData({
      navire_nom: formData.navire_nom, // Garder le nom du navire
      navire_immatriculation: formData.navire_immatriculation,
      capitaine_nom: formData.capitaine_nom,
      equipage_nb: formData.equipage_nb,
      date_sortie: new Date().toISOString().split('T')[0],
      heure_depart: '',
      date_retour: new Date().toISOString().split('T')[0],
      heure_retour: '',
      zone_nom: '',
      lat: '',
      lng: '',
      engin_peche: formData.engin_peche, // Garder l'engin
      espece: '',
      quantite_kg: '',
      taille_moyenne_cm: '',
      port_debarquement: 'Dakhla',
      meteo: '',
      notes: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
  };

  const handleExport = () => {
    const csv = [
      [
        'Date sortie', 'Navire', 'Immatriculation', 'Capitaine', 'Équipage',
        'Zone', 'Latitude', 'Longitude', 'Engin de pêche',
        'Espèce', 'Quantité (kg)', 'Taille moy (cm)', 'Port débarquement'
      ],
      ...entries.map(e => [
        e.date_sortie,
        e.navire_nom,
        e.navire_immatriculation,
        e.capitaine_nom,
        e.equipage_nb,
        e.zone_nom,
        e.lat,
        e.lng,
        e.engin_peche,
        e.espece,
        e.quantite_kg,
        e.taille_moyenne_cm || 'N/A',
        e.port_debarquement,
      ]),
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `journal_peche_officiel_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42] flex items-center gap-2">
            <Ship className="w-8 h-8" />
            {t.logbook.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.logbook.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
            {t.logbook.exportButton}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t.logbook.newDeclaration}
          </button>
        </div>
      </div>

      {/* Avertissement réglementaire */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-2">⚖️ {t.logbook.legalWarning}</h3>
            <p className="text-sm text-amber-800 mb-2">
              {t.logbook.legalText1}
            </p>
            <p className="text-sm text-amber-800">
              <span className="font-bold">{t.logbook.sanctions}</span> {t.logbook.legalText2}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">{t.logbook.totalTrips}</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{totalSorties}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">{t.logbook.totalCatch}</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{totalQuantite.toFixed(0)} kg</p>
        </div>
      </div>

      {/* Formulaire (suite dans le prochain message pour ne pas dépasser la limite) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-1">{t.logbook.formTitle}</h2>
          <p className="text-sm text-gray-600 mb-4">{t.logbook.formSubtitle}</p>

          {/* Section BAHRIA Cam */}
          <div className="mb-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-cyan-900">📸 {t.logbook.camTitle}</h3>
            </div>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cyan-300 rounded-lg cursor-pointer bg-white hover:bg-cyan-50 transition-colors">
                <Upload className="w-8 h-8 text-cyan-500 mb-2" />
                <p className="text-sm text-gray-700 font-semibold">{t.logbook.camUpload}</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img src={imagePreview} alt="Capture" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                {!analysisResult && (
                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={analyzing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400"
                  >
                    {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.logbook.analyzing}</> : <><Camera className="w-5 h-5" /> {t.logbook.analyze}</>}
                  </button>
                )}

                {analysisResult && (
                  <div className="bg-white rounded-lg p-3 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h4 className="font-bold text-green-900 text-sm">✅ {t.logbook.analysisComplete}</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">{t.logbook.species}</p>
                        <p className="font-bold">{analysisResult.espece}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t.logbook.quantity}</p>
                        <p className="font-bold">{analysisResult.poids_total_kg} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t.logbook.individuals}</p>
                        <p className="font-bold">{analysisResult.comptage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulaire principal */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Section Navire */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-600" />
                {t.logbook.vesselSection}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.vesselName}</label>
                  <input
                    type="text"
                    value={formData.navire_nom}
                    onChange={(e) => setFormData({ ...formData, navire_nom: e.target.value })}
                    placeholder={t.logbook.placeholders.vesselName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.registration}</label>
                  <input
                    type="text"
                    value={formData.navire_immatriculation}
                    onChange={(e) => setFormData({ ...formData, navire_immatriculation: e.target.value })}
                    placeholder={t.logbook.placeholders.registration}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.captainName}</label>
                  <input
                    type="text"
                    value={formData.capitaine_nom}
                    onChange={(e) => setFormData({ ...formData, capitaine_nom: e.target.value })}
                    placeholder={t.logbook.placeholders.captainName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.crewNumber}</label>
                  <input
                    type="number"
                    value={formData.equipage_nb}
                    onChange={(e) => setFormData({ ...formData, equipage_nb: e.target.value })}
                    placeholder={t.logbook.placeholders.crewNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section Sortie */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                {t.logbook.tripSection}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.departureDate}</label>
                  <input
                    type="date"
                    value={formData.date_sortie}
                    onChange={(e) => setFormData({ ...formData, date_sortie: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.departureTime}</label>
                  <input
                    type="time"
                    value={formData.heure_depart}
                    onChange={(e) => setFormData({ ...formData, heure_depart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.returnDate}</label>
                  <input
                    type="date"
                    value={formData.date_retour}
                    onChange={(e) => setFormData({ ...formData, date_retour: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.returnTime}</label>
                  <input
                    type="time"
                    value={formData.heure_retour}
                    onChange={(e) => setFormData({ ...formData, heure_retour: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Section Zone */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-600" />
                {t.logbook.zoneSection}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.zoneName}</label>
                  <input
                    type="text"
                    value={formData.zone_nom}
                    onChange={(e) => setFormData({ ...formData, zone_nom: e.target.value })}
                    placeholder={t.logbook.placeholders.zoneName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.latitude}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder={t.logbook.placeholders.latitude}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.longitude}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder={t.logbook.placeholders.longitude}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section Captures */}
            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Fish className="w-5 h-5 text-cyan-600" />
                {t.logbook.catchSection}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.gearUsed}</label>
                  <select
                    value={formData.engin_peche}
                    onChange={(e) => setFormData({ ...formData, engin_peche: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">{t.logbook.species_types.select}</option>
                    <option>{t.profile.gearTypes.seine}</option>
                    <option>{t.profile.gearTypes.gillnet}</option>
                    <option>{t.profile.gearTypes.longline}</option>
                    <option>{t.profile.gearTypes.traps}</option>
                    <option>{t.profile.gearTypes.line}</option>
                    <option>{t.profile.gearTypes.trawl}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.speciesCaught}</label>
                  <select
                    value={formData.espece}
                    onChange={(e) => setFormData({ ...formData, espece: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">{t.logbook.species_types.select}</option>
                    <option>{t.logbook.species_types.sardine}</option>
                    <option>{t.logbook.species_types.mackerel}</option>
                    <option>{t.logbook.species_types.horseMackerel}</option>
                    <option>{t.logbook.species_types.anchovy}</option>
                    <option>{t.logbook.species_types.octopus}</option>
                    <option>{t.logbook.species_types.cuttlefish}</option>
                    <option>{t.logbook.species_types.meagre}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.totalQuantity}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantite_kg}
                    onChange={(e) => setFormData({ ...formData, quantite_kg: e.target.value })}
                    placeholder={t.logbook.placeholders.quantity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.averageSize}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.taille_moyenne_cm}
                    onChange={(e) => setFormData({ ...formData, taille_moyenne_cm: e.target.value })}
                    placeholder={t.logbook.placeholders.averageSize}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Section Débarquement */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Anchor className="w-5 h-5 text-orange-600" />
                {t.logbook.landingSection}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.landingPort}</label>
                  <select
                    value={formData.port_debarquement}
                    onChange={(e) => setFormData({ ...formData, port_debarquement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option>{t.profile.ports.dakhla}</option>
                    <option>{t.profile.ports.laayoune}</option>
                    <option>{t.profile.ports.tantan}</option>
                    <option>{t.profile.ports.agadir}</option>
                    <option>{t.profile.ports.essaouira}</option>
                    <option>{t.profile.ports.safi}</option>
                    <option>{t.profile.ports.casablanca}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.weatherConditions}</label>
                  <input
                    type="text"
                    value={formData.meteo}
                    onChange={(e) => setFormData({ ...formData, meteo: e.target.value })}
                    placeholder={t.logbook.placeholders.weather}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.logbook.notes}</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t.logbook.notesPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              ></textarea>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.logbook.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] font-semibold"
              >
                ✅ {t.logbook.saveDeclaration}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">{t.logbook.filterBy}</label>
          <select
            value={filterEspece}
            onChange={(e) => setFilterEspece(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">{t.logbook.all}</option>
            <option value="Sardine">{t.logbook.species_types.sardine}</option>
            <option value="Maquereau">{t.logbook.species_types.mackerel}</option>
            <option value="Poulpe">{t.logbook.species_types.octopus}</option>
            <option value="Seiche">{t.logbook.species_types.cuttlefish}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.date}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.vessel}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.regNumber}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.captain}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.zone}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.position}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.gear}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.species}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.quantity}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.logbook.port}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(entry.date_sortie).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{entry.navire_nom}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{entry.navire_immatriculation}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{entry.capitaine_nom}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{entry.zone_nom}</td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {entry.lat.toFixed(2)}°N, {Math.abs(entry.lng).toFixed(2)}°W
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{entry.engin_peche}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{entry.espece}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">{entry.quantite_kg} kg</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{entry.port_debarquement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer réglementaire */}
      <div className="bg-blue-50 border-l-4 border-[#0EA5E9] rounded-xl p-4 text-sm text-gray-700">
        <p className="font-medium mb-1">📋 {t.logbook.compliance}</p>
        <p className="mb-2">
          {t.logbook.complianceText}
        </p>
        <p className="text-xs text-gray-600">
          {t.logbook.transmissionText}
        </p>
      </div>
    </div>
  );
}
