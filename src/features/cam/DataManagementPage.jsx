import { useState } from 'react';
import { Database, Filter, Download, Upload, Eye, Edit, Check, Clock, Image as ImageIcon, BarChart3 } from 'lucide-react';
import demoImages from './data/demo-images.json';
import datasetStats from './data/dataset-stats.json';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function DataManagementPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  // Placeholder SVG inline pour éviter les erreurs DNS
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3EImage non disponible%3C/text%3E%3C/svg%3E";

  // Filtrer les images
  const filteredImages = demoImages.filter(img => {
    if (selectedSource !== 'all' && img.source !== selectedSource) return false;
    if (selectedStatus !== 'all' && img.status !== selectedStatus) return false;
    if (selectedSpecies !== 'all' && img.espece !== selectedSpecies) return false;
    return true;
  });

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42]">{t.dataManagement.title}</h1>
          <p className="text-gray-600 mt-1">{t.dataManagement.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white transition-colors">
            <Upload className="w-5 h-5" />
            {t.dataManagement.importDataset}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors">
            <Download className="w-5 h-5" />
            {t.dataManagement.exportAnnotations}
          </button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Images totales</span>
          </div>
          <p className="text-3xl font-bold text-[#041E42]">{datasetStats.summary.total_images}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Validées</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{datasetStats.summary.validated}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">En attente</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{datasetStats.summary.pending_annotation}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Annotations</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{datasetStats.summary.total_annotations}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-gray-600">Poissons détectés</span>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{datasetStats.summary.total_fish_detected}</p>
        </div>
      </div>

      {/* Stats par espèce */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#041E42] mb-4">Distribution par espèce</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(datasetStats.by_species).map(([espece, stats]) => (
            <div key={espece} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize mb-2">{espece}</p>
              <p className="text-2xl font-bold text-[#041E42] mb-2">{stats.images} images</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>{stats.fish_detected} poissons</p>
                <p>Conf: {(stats.avg_confidence * 100).toFixed(1)}%</p>
                <p>Taille moy: {stats.avg_size_cm.toFixed(1)} cm</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-[#041E42]">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source du dataset</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
            >
              <option value="all">Toutes les sources</option>
              <option value="Deep Vision Pelagic Dataset">Deep Vision Pelagic</option>
              <option value="DeepFish Dataset">DeepFish</option>
              <option value="Roboflow Fish Detect">Roboflow Fish Detect</option>
              <option value="Community Fish Detection">Community Fish Detection</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
            >
              <option value="all">Tous les statuts</option>
              <option value="validated">Validé</option>
              <option value="pending_annotation">En attente d'annotation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Espèce</label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9]"
            >
              <option value="all">Toutes les espèces</option>
              <option value="sardine">Sardine</option>
              <option value="poulpe">Poulpe</option>
              <option value="maquereau">Maquereau</option>
              <option value="seiche">Seiche</option>
              <option value="chinchard">Chinchard</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {filteredImages.length} image(s) trouvée(s)
        </div>
      </div>

      {/* Galerie d'images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedImage(img)}
          >
            <div className="relative aspect-video bg-gray-200">
              <img
                src={img.url}
                alt={img.id}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = placeholderImage;
                }}
              />
              <div className="absolute top-2 right-2">
                {img.status === 'validated' ? (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                    ✓ Validé
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
                    ⏱ En attente
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#041E42]">{img.id}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2 capitalize">{img.espece}</p>
              <p className="text-xs text-gray-500 italic mb-3">{img.nom_scientifique}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{img.source.split(' ')[0]}</span>
                {img.annotations && (
                  <span className="text-blue-600 font-medium">
                    {img.annotations.comptage} poissons
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail d'image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#041E42]">{selectedImage.id}</h2>
                  <p className="text-gray-600 capitalize">{selectedImage.espece} - {selectedImage.nom_scientifique}</p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedImage.url}
                alt={selectedImage.id}
                className="w-full rounded-lg mb-4"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = placeholderImage;
                }}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="font-medium">{selectedImage.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zone</p>
                  <p className="font-medium">{selectedImage.zone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de capture</p>
                  <p className="font-medium">
                    {new Date(selectedImage.date_capture).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p className="font-medium capitalize">{selectedImage.status === 'validated' ? 'Validé' : 'En attente'}</p>
                </div>
              </div>

              {selectedImage.annotations && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-[#041E42] mb-3">Annotations</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Bounding boxes</p>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedImage.annotations.bounding_boxes?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Comptage</p>
                      <p className="text-xl font-bold text-green-600">
                        {selectedImage.annotations.comptage}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Taille moyenne</p>
                      <p className="text-xl font-bold text-purple-600">
                        {selectedImage.annotations.taille_moyenne_cm} cm
                      </p>
                    </div>
                  </div>

                  {selectedImage.annotations.bounding_boxes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Détections</h4>
                      <div className="space-y-2">
                        {selectedImage.annotations.bounding_boxes.map((box, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="capitalize">{box.class}</span>
                            <span className="text-gray-600">
                              {box.width}×{box.height}px
                            </span>
                            <span className="font-medium text-[#0EA5E9]">
                              {(box.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7]">
                  <Edit className="w-5 h-5" />
                  Annoter
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white">
                  <Eye className="w-5 h-5" />
                  Voir dans l'annotateur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
