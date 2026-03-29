import { useState, useRef, useEffect } from 'react';
import { Save, Trash2, Plus, Square, CheckCircle, ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import demoImages from './data/demo-images.json';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function AnnotationPage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedClass, setSelectedClass] = useState('sardine');
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const classes = [
    { id: 'sardine', name: 'Sardine', color: '#0EA5E9' },
    { id: 'maquereau', name: 'Maquereau', color: '#10B981' },
    { id: 'chinchard', name: 'Chinchard', color: '#F59E0B' },
    { id: 'anchois', name: 'Anchois', color: '#EF4444' },
    { id: 'poulpe', name: 'Poulpe', color: '#8B5CF6' },
    { id: 'seiche', name: 'Seiche', color: '#EC4899' },
  ];

  const currentImage = demoImages[currentImageIndex];
  const unannotatedImages = demoImages.filter(img => img.status === 'pending_annotation');

  useEffect(() => {
    if (imageLoaded && canvasRef.current && imageRef.current) {
      drawCanvas();
    }
  }, [annotations, zoom, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw annotations
    annotations.forEach((ann, idx) => {
      const classObj = classes.find(c => c.id === ann.class);
      const color = classObj?.color || '#0EA5E9';

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

      // Draw label
      ctx.fillStyle = color;
      ctx.fillRect(ann.x, ann.y - 25, 150, 25);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${classObj?.name || ann.class} #${idx + 1}`, ann.x + 5, ann.y - 7);
    });

    // Draw current box being drawn
    if (currentBox) {
      const classObj = classes.find(c => c.id === selectedClass);
      ctx.strokeStyle = classObj?.color || '#0EA5E9';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentBox) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCurrentBox({
      ...currentBox,
      width: currentX - currentBox.x,
      height: currentY - currentBox.y,
    });

    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;

    // Only save if box has meaningful size
    if (Math.abs(currentBox.width) > 10 && Math.abs(currentBox.height) > 10) {
      // Normalize box (handle negative width/height)
      const normalizedBox = {
        x: currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
        y: currentBox.height < 0 ? currentBox.y + currentBox.height : currentBox.y,
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height),
        class: selectedClass,
        confidence: 1.0,
      };

      setAnnotations([...annotations, normalizedBox]);
    }

    setIsDrawing(false);
    setCurrentBox(null);
  };

  const handleDeleteAnnotation = (index) => {
    setAnnotations(annotations.filter((_, idx) => idx !== index));
  };

  const handleSaveAnnotations = () => {
    console.log('Saving annotations:', {
      image_id: currentImage.id,
      annotations: {
        bounding_boxes: annotations,
        comptage: annotations.length,
        status: 'validated',
      },
    });
    alert(`Annotations sauvegardées pour ${currentImage.id}\n${annotations.length} bounding boxes`);

    // Move to next unannotated image
    const nextUnannotated = demoImages.findIndex(
      (img, idx) => idx > currentImageIndex && img.status === 'pending_annotation'
    );
    if (nextUnannotated !== -1) {
      setCurrentImageIndex(nextUnannotated);
      setAnnotations([]);
    }
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (canvas && img) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setImageLoaded(true);
    }
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42]">{t.annotationPage.title}</h1>
          <p className="text-gray-600 mt-1">
            {t.annotationPage.subtitle} {unannotatedImages.length} {t.annotationPage.imagesWaiting}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAnnotations([])}
            className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            {t.annotationPage.reset}
          </button>
          <button
            onClick={handleSaveAnnotations}
            disabled={annotations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {t.annotationPage.save} ({annotations.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau de gauche - Contrôles */}
        <div className="lg:col-span-1 space-y-4">
          {/* Sélection d'image */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-[#041E42] mb-3">Image actuelle</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-medium">{currentImage.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Espèce</p>
                <p className="font-medium capitalize">{currentImage.espece}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Source</p>
                <p className="text-xs">{currentImage.source}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(demoImages.length - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === demoImages.length - 1}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>

          {/* Sélection de classe */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-[#041E42] mb-3">Classe à annoter</h3>
            <div className="space-y-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`w-full px-3 py-2 rounded-lg text-left font-medium transition-colors ${
                    selectedClass === cls.id
                      ? 'bg-[#0EA5E9] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    selectedClass === cls.id
                      ? { backgroundColor: cls.color }
                      : {}
                  }
                >
                  <span className="flex items-center gap-2">
                    <Square className="w-4 h-4" style={{ color: cls.color }} />
                    {cls.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Annotations actuelles */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-[#041E42] mb-3">
              Annotations ({annotations.length})
            </h3>
            <div className="space-y-2">
              {annotations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune annotation.<br />
                  Dessinez des boxes sur l'image.
                </p>
              ) : (
                annotations.map((ann, idx) => {
                  const classObj = classes.find(c => c.id === ann.class);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: classObj?.color }}
                        />
                        <span className="capitalize">{classObj?.name}</span>
                      </span>
                      <button
                        onClick={() => handleDeleteAnnotation(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">💡 Instructions</p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs">
              <li>Sélectionnez une classe</li>
              <li>Cliquez et glissez sur l'image pour dessiner une box</li>
              <li>Relâchez pour créer l'annotation</li>
              <li>Utilisez la corbeille pour supprimer</li>
              <li>Sauvegardez quand terminé</li>
            </ul>
          </div>
        </div>

        {/* Zone d'annotation - Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#041E42]">Canvas d'annotation</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="px-3 py-2 bg-gray-100 rounded-lg font-medium">
                  {(zoom * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative overflow-auto border-2 border-gray-200 rounded-lg bg-gray-50" style={{ maxHeight: '70vh' }}>
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <img
                  ref={imageRef}
                  src={currentImage.url}
                  alt={currentImage.id}
                  className="absolute inset-0 pointer-events-none"
                  onLoad={handleImageLoad}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+non+disponible';
                  }}
                  style={{ display: 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="cursor-crosshair"
                  style={{ display: 'block' }}
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>
                <span className="font-medium">Classe sélectionnée :</span>{' '}
                <span
                  className="px-2 py-1 rounded text-white font-medium"
                  style={{ backgroundColor: classes.find(c => c.id === selectedClass)?.color }}
                >
                  {classes.find(c => c.id === selectedClass)?.name}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
