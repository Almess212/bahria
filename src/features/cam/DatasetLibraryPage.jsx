import { useState } from 'react';
import { Download, ExternalLink, CheckCircle, Clock, Star, Database, Package, TrendingUp, FileText } from 'lucide-react';
import availableDatasets from './data/available-datasets.json';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function DatasetLibraryPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filtrer les datasets
  const filteredDatasets = availableDatasets.filter(ds => {
    if (filterPriority !== 'all' && ds.priority !== parseInt(filterPriority)) return false;
    if (filterCategory !== 'all' && ds.category !== filterCategory) return false;
    return true;
  });

  // Statistiques globales
  const totalImages = availableDatasets.reduce((sum, ds) => sum + ds.images_count, 0);
  const totalAnnotations = availableDatasets.reduce((sum, ds) => sum + ds.annotations_count, 0);
  const downloadedCount = availableDatasets.filter(ds => ds.downloaded).length;

  const handleDownload = (dataset) => {
    alert(`Lancement du téléchargement de:\n\n${dataset.name}\n\nTaille: ${dataset.source.size_mb} MB\nURL: ${dataset.source.download_url}\n\nLe dataset sera sauvegardé dans:\n~/bahria-cam/data/${dataset.id}/`);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      5: 'bg-red-100 text-red-800 border-red-300',
      4: 'bg-orange-100 text-orange-800 border-orange-300',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    const labels = {
      5: 'Critique',
      4: 'Haute',
      3: 'Moyenne',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {labels[priority] || 'Basse'}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const config = {
      detection_classification: { label: 'Détection + Classification', color: 'bg-blue-100 text-blue-800' },
      segmentation_sizing: { label: 'Segmentation + Taille', color: 'bg-green-100 text-green-800' },
      pretraining: { label: 'Pré-entraînement', color: 'bg-purple-100 text-purple-800' },
    };
    const cat = config[category] || { label: category, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${cat.color}`}>
        {cat.label}
      </span>
    );
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#041E42]">{t.datasetLibrary.title}</h1>
        <p className="text-gray-600 mt-1">{t.datasetLibrary.subtitle}</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Datasets disponibles</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{availableDatasets.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Images totales</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{(totalImages / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Annotations totales</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{(totalAnnotations / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-gray-600">Téléchargés</span>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{downloadedCount}/{availableDatasets.length}</p>
        </div>
      </div>

      {/* Plan d'entraînement */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-[#041E42] mb-2">Plan d'entraînement recommandé</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Phase 1 - Pré-entraînement (50 epochs):</span> Community Fish Detection (1.9M images) → Détecteur générique "fish"</p>
              <p><span className="font-semibold">Phase 2 - Fine-tuning pélagique (100 epochs):</span> Deep Vision + DeepFish + Roboflow → Modèle v1 espèces</p>
              <p><span className="font-semibold">Phase 3 - Adaptation terrain (50 epochs):</span> Images réelles MFQF Dakhla → Modèle production</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
            >
              <option value="all">Toutes les priorités</option>
              <option value="5">★★★★★ Critique</option>
              <option value="4">★★★★☆ Haute</option>
              <option value="3">★★★☆☆ Moyenne</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
            >
              <option value="all">Toutes les catégories</option>
              <option value="detection_classification">Détection + Classification</option>
              <option value="segmentation_sizing">Segmentation + Taille</option>
              <option value="pretraining">Pré-entraînement</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {filteredDatasets.length} dataset(s) trouvé(s)
        </div>
      </div>

      {/* Liste des datasets */}
      <div className="space-y-4">
        {filteredDatasets.map((dataset) => (
          <div
            key={dataset.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedDataset(dataset)}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#041E42]">{dataset.name}</h3>
                  {getPriorityBadge(dataset.priority)}
                  {getCategoryBadge(dataset.category)}
                  {dataset.downloaded && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Téléchargé
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-700">
                    <Package className="w-4 h-4" />
                    {dataset.images_count.toLocaleString()} images
                  </span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <FileText className="w-4 h-4" />
                    {dataset.annotations_count.toLocaleString()} annotations
                  </span>
                  {dataset.species_count && (
                    <span className="flex items-center gap-1 text-gray-700">
                      🐟 {dataset.species_count} espèces
                    </span>
                  )}
                  <span className="text-gray-500">
                    {dataset.source.size_mb} MB
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(dataset);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <a
                  href={dataset.source.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white transition-colors text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  Source
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Pertinence BAHRIA Cam:</p>
              <p className="text-sm text-gray-600">{dataset.pertinence_bahria}</p>
              {dataset.bonus && (
                <p className="text-sm text-green-700 mt-2">
                  <span className="font-semibold">💡 Bonus:</span> {dataset.bonus}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail */}
      {selectedDataset && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDataset(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#041E42] mb-2">{selectedDataset.name}</h2>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedDataset.priority)}
                    {getCategoryBadge(selectedDataset.category)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-700 mb-6">{selectedDataset.description}</p>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Images</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedDataset.images_count.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Annotations</p>
                  <p className="text-xl font-bold text-green-600">
                    {selectedDataset.annotations_count.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Taille</p>
                  <p className="text-xl font-bold text-purple-600">
                    {selectedDataset.source.size_mb} MB
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Année</p>
                  <p className="text-xl font-bold text-orange-600">
                    {selectedDataset.source.year}
                  </p>
                </div>
              </div>

              {/* Espèces */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#041E42] mb-3">Espèces annotées</h3>
                <div className="space-y-2">
                  {selectedDataset.species.map((sp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{sp.name}</p>
                        <p className="text-xs text-gray-500 italic">{sp.scientific}</p>
                      </div>
                      <div className="text-right">
                        {sp.mapped_to ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            → {sp.mapped_to}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                            Non mappé
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{sp.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Types d'annotations */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#041E42] mb-3">Types d'annotations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.annotation_type.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Formats */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#041E42] mb-3">Formats disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.formats.map((format, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {format}
                    </span>
                  ))}
                </div>
              </div>

              {/* Qualité */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#041E42] mb-3">Caractéristiques qualité</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Résolution</p>
                    <p className="text-sm font-semibold capitalize">{selectedDataset.quality.resolution}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Éclairage</p>
                    <p className="text-sm font-semibold capitalize">{selectedDataset.quality.lighting.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Environnement</p>
                    <p className="text-sm font-semibold capitalize">{selectedDataset.quality.environment.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Occlusion</p>
                    <p className="text-sm font-semibold capitalize">{selectedDataset.quality.occlusion}</p>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Source & Publication</h3>
                <p className="text-sm text-gray-600 mb-1">{selectedDataset.source.publication}</p>
                {selectedDataset.source.doi && (
                  <p className="text-xs text-gray-500">DOI: {selectedDataset.source.doi}</p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-medium">Licence:</span> {selectedDataset.license}
                </p>
              </div>

              {/* Cas d'usage */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm font-semibold text-blue-900 mb-1">💡 Cas d'usage recommandé</p>
                <p className="text-sm text-blue-800">{selectedDataset.use_case}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleDownload(selectedDataset)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7]"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le dataset
                </button>
                <a
                  href={selectedDataset.source.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white"
                >
                  <ExternalLink className="w-5 h-5" />
                  Ouvrir la source
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
