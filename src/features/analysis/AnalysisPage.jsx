import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SampleForm from './SampleForm';
import AnalysisResult from './AnalysisResult';
import species from './data/species.json';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [analysisData, setAnalysisData] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (data) => {
    const sp = species.find(s => s.code === data.speciesCode);
    setAnalysisData({ sample: data, species: sp });
    setShowResult(true);
  };

  const handleBack = () => {
    setShowResult(false);
    setAnalysisData(null);
  };

  if (showResult && analysisData) {
    return (
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0EA5E9] mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.analysis.backToNewAnalysis}
        </button>
        <AnalysisResult
          sample={analysisData.sample}
          species={analysisData.species}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#041E42]">{t.analysis.title}</h1>
        <p className="text-gray-600 mt-1">{t.analysis.subtitle}</p>
      </div>

      <SampleForm onSubmit={handleSubmit} />
    </div>
  );
}
