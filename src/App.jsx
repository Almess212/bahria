import { useState, useEffect } from 'react';
import species from './data/species.json';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import SampleForm from './components/analysis/SampleForm';
import AnalysisResult from './components/analysis/AnalysisResult';
import SpeciesDetail from './components/species/SpeciesDetail';
import { fetchCurrentSST } from './services/noaa';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [sst, setSst] = useState({ sst: 16.0, source: 'Cache local', live: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const minLoadTime = 1500; // 1.5 secondes minimum

    fetchCurrentSST().then((data) => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadTime - elapsed);

      setTimeout(() => {
        setSst(data);
        setIsLoading(false);
      }, remaining);
    });
  }, []);

  const handleSubmit = (data) => {
    const sp = species.find(s => s.code === data.speciesCode);
    setAnalysisData({ sample: data, species: sp });
    setPage('result');
  };

  const handleSelectSpecies = (sp) => {
    setSelectedSpecies(sp);
    setPage('species');
  };

  const renderContent = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={setPage} sst={sst} onSelectSpecies={handleSelectSpecies} />;
      case 'analysis':
        return <SampleForm onSubmit={handleSubmit} />;
      case 'result':
        return analysisData ? (
          <AnalysisResult
            sample={analysisData.sample}
            species={analysisData.species}
            onBack={() => setPage('analysis')}
          />
        ) : null;
      case 'species':
        return selectedSpecies ? (
          <SpeciesDetail
            species={selectedSpecies}
            onBack={() => setPage('dashboard')}
          />
        ) : null;
      default:
        return <Dashboard onNavigate={setPage} sst={sst} onSelectSpecies={handleSelectSpecies} />;
    }
  };

  // Écran de chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#041E42] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white font-bold text-5xl mb-2">BAHRIA</h1>
          <h2 className="text-[#0EA5E9] text-2xl mb-8">بحرية</h2>
          <p className="text-white/60 text-sm mb-6">Chargement des données océanographiques...</p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activePage={page} onNavigate={setPage} sst={sst}>
      {renderContent()}
    </Layout>
  );
}
