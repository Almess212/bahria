import { useState } from 'react';
import { BookOpen, Plus, MapPin, Fish, Calendar, Download, Filter, Camera, Upload, Loader2, CheckCircle, XCircle, Ship, Anchor, User, Clock, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_URL = 'http://localhost:3001';

export default function LogbookPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [formData, setFormData] = useState({
    // Informations réglementaires obligatoires (Dahir n°1-73-255 + Loi 15-12)
    date_sortie: new Date().toISOString().split('T')[0],
    date_retour: new Date().toISOString().split('T')[0],
    navire_nom: '',
    navire_immatriculation: '',
    capitaine_nom: '',
    equipage: '',

    // Zone de pêche (obligatoire)
    zone: '',
    lat: '',
    lng: '',

    // Engins de pêche
    engin_peche: '',

    // Captures
    espece: '',
    quantite: '',
    taille_moy: '',

    // Durée sortie
    heure_depart: '',
    heure_retour: '',
    duree: '',

    // Débarquement
    port_debarquement: 'Dakhla',

    // Notes et observations
    notes: '',
  });

  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '2026-03-27',
      espece: 'Poulpe',
      zone: 'Lassarga',
      lat: 23.8,
      lng: -15.95,
      quantite: 450,
      taille_moy: 10.2,
      duree: 6.5,
      equipage: 4,
      notes: 'Conditions excellentes, mer calme',
    },
    {
      id: 2,
      date: '2026-03-26',
      espece: 'Sardine',
      zone: 'Port Dakhla',
      lat: 23.72,
      lng: -15.93,
      quantite: 1200,
      taille_moy: 15.5,
      duree: 8,
      equipage: 6,
      notes: 'Banc important repéré',
    },
    {
      id: 3,
      date: '2026-03-25',
      espece: 'Seiche',
      zone: 'Baie de Dakhla',
      lat: 23.65,
      lng: -15.88,
      quantite: 280,
      taille_moy: 18.3,
      duree: 5,
      equipage: 4,
      notes: 'SST favorable à 19°C',
    },
  ]);

  const [filterEspece, setFilterEspece] = useState('all');

  const filteredEntries = filterEspece === 'all'
    ? entries
    : entries.filter(e => e.espece === filterEspece);

  // Stats calculées
  const totalSorties = entries.length;
  const totalQuantite = entries.reduce((sum, e) => sum + e.quantite, 0);
  const moyenneDuree = (entries.reduce((sum, e) => sum + e.duree, 0) / entries.length).toFixed(1);

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

      // Remplir automatiquement les champs du formulaire
      if (result.espece) {
        setFormData(prev => ({
          ...prev,
          espece: result.espece.charAt(0).toUpperCase() + result.espece.slice(1),
          taille_moy: result.taille_moyenne_cm || '',
          quantite: result.poids_total_kg || '', // Déjà en kg
          notes: `Analyse IA: ${result.comptage || 1} individu(s) • Confiance: ${result.confidence}% • ${result.qualite || 'N/A'} • ${result.fraicheur || 'N/A'}`
        }));
      }

    } catch (error) {
      console.error('Erreur analyse:', error);
      setAnalysisError(error.message || 'Erreur lors de l\'analyse de l\'image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      id: entries.length + 1,
      date: formData.date,
      espece: formData.espece,
      zone: formData.zone || 'Non spécifiée',
      lat: 23.71, // Valeur par défaut Dakhla
      lng: -15.94,
      quantite: parseFloat(formData.quantite) || 0,
      taille_moy: parseFloat(formData.taille_moy) || 0,
      duree: parseFloat(formData.duree) || 0,
      equipage: parseInt(formData.equipage) || 0,
      notes: formData.notes || '',
      image: imagePreview || null,
    };

    setEntries([newEntry, ...entries]);

    // Réinitialiser le formulaire
    setShowForm(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      espece: '',
      zone: '',
      quantite: '',
      taille_moy: '',
      duree: '',
      equipage: '',
      notes: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleExport = () => {
    // Simulation export CSV
    const csv = [
      ['Date', 'Espèce', 'Zone', 'Latitude', 'Longitude', 'Quantité (kg)', 'Taille moyenne (cm)', 'Durée (h)', 'Équipage', 'Notes'],
      ...entries.map(e => [
        e.date,
        e.espece,
        e.zone,
        e.lat,
        e.lng,
        e.quantite,
        e.taille_moy,
        e.duree,
        e.equipage,
        e.notes,
      ]),
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logbook_bahria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42]">Journal de Bord</h1>
          <p className="text-gray-600 mt-1">Traçabilité géolocalisée des sorties de pêche</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle sortie
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total sorties</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{totalSorties}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Total captures</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{totalQuantite} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Durée moyenne</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{moyenneDuree}h</p>
        </div>
      </div>

      {/* Formulaire nouvelle sortie */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#041E42] mb-4">Nouvelle sortie</h2>

          {/* Section BAHRIA Cam - Analyse photo */}
          <div className="mb-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-cyan-900">📸 BAHRIA Cam - Identification automatique</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Prenez une photo de vos captures pour identification et comptage automatiques
            </p>

            {/* Zone d'upload */}
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-300 rounded-lg cursor-pointer bg-white hover:bg-cyan-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-cyan-500 mb-3" />
                  <p className="mb-2 text-sm text-gray-700 font-semibold">
                    Cliquez pour sélectionner une photo
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <div className="space-y-3">
                {/* Prévisualisation */}
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Capture"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setAnalysisResult(null);
                      setAnalysisError(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Bouton analyser */}
                {!analysisResult && (
                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={analyzing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Analyser l'image
                      </>
                    )}
                  </button>
                )}

                {/* Résultat de l'analyse */}
                {analysisResult && (
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-green-900">Analyse terminée ✅</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Espèce détectée</p>
                        <p className="font-bold text-gray-900 flex items-center gap-1">
                          {analysisResult.icone} {analysisResult.espece}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Confiance</p>
                        <p className="font-bold text-gray-900">{analysisResult.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Taille moyenne</p>
                        <p className="font-bold text-gray-900">{analysisResult.taille_moyenne_cm} cm</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Poids total</p>
                        <p className="font-bold text-gray-900">{analysisResult.poids_total_kg} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Nombre d'individus</p>
                        <p className="font-bold text-gray-900">{analysisResult.comptage}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Calibre</p>
                        <p className="font-bold text-gray-900">{analysisResult.calibre}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Qualité</p>
                        <p className="font-bold text-gray-900">{analysisResult.qualite}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fraîcheur</p>
                        <p className="font-bold text-gray-900">{analysisResult.fraicheur}</p>
                      </div>
                      {analysisResult.conformite_L50 !== undefined && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Conformité L50</p>
                          <p className={`font-bold ${analysisResult.conformite_L50 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysisResult.conformite_L50 ? '✅ Conforme' : '⚠️ Non conforme'} ({analysisResult.ratio_L50_pct}%)
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-green-700 mt-3 font-semibold">
                      ✅ Les champs du formulaire ont été remplis automatiquement
                    </p>
                  </div>
                )}

                {/* Erreur */}
                {analysisError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-700">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <p className="font-semibold">Erreur: {analysisError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Espèce</label>
              <select
                value={formData.espece}
                onChange={(e) => setFormData({ ...formData, espece: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
                required
              >
                <option value="">Sélectionner...</option>
                <option>Poulpe</option>
                <option>Sardine</option>
                <option>Maquereau</option>
                <option>Chinchard</option>
                <option>Anchois</option>
                <option>Seiche</option>
                <option>Courbine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="Ex: Lassarga"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité (kg)</label>
              <input
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                placeholder="Ex: 450"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille moyenne (cm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.taille_moy}
                onChange={(e) => setFormData({ ...formData, taille_moy: e.target.value })}
                placeholder="Ex: 10.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (heures)</label>
              <input
                type="number"
                step="0.5"
                value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                placeholder="Ex: 6.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Équipage</label>
              <input
                type="number"
                value={formData.equipage}
                onChange={(e) => setFormData({ ...formData, equipage: e.target.value })}
                placeholder="Ex: 4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observations, conditions météo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setAnalysisResult(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7]"
              >
                Enregistrer la sortie
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Filtrer par espèce:</label>
          <select
            value={filterEspece}
            onChange={(e) => setFilterEspece(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
          >
            <option value="all">Toutes</option>
            <option value="Poulpe">Poulpe</option>
            <option value="Sardine">Sardine</option>
            <option value="Seiche">Seiche</option>
            <option value="Courbine">Courbine</option>
          </select>
        </div>
      </div>

      {/* Liste des sorties */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Espèce</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille moy.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(entry.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.espece}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {entry.zone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.lat.toFixed(2)}°N, {Math.abs(entry.lng).toFixed(2)}°W
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  {entry.quantite} kg
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.taille_moy} cm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.duree}h
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {entry.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info conformité */}
      <div className="bg-blue-50 border-l-4 border-[#0EA5E9] rounded-xl p-4 text-sm text-gray-700">
        <p className="font-medium mb-1">📋 Conformité ONP/INRH</p>
        <p>
          Ce journal de bord numérique est conforme aux exigences de traçabilité de l'Office National des Pêches (ONP)
          et de l'Institut National de Recherche Halieutique (INRH). Export CSV disponible pour les déclarations officielles.
        </p>
      </div>
    </div>
  );
}
