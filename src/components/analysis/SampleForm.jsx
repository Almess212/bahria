import { useState } from 'react';
import speciesData from '../../data/species.json';

/**
 * Formulaire de saisie d'échantillon pour l'analyse BAHRIA
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback appelé lors de la soumission (data) => void
 */
export default function SampleForm({ onSubmit }) {
  // Date du jour par défaut
  const today = new Date().toISOString().split('T')[0];

  // State du formulaire
  const [speciesCode, setSpeciesCode] = useState('poulpe');
  const [avgSize, setAvgSize] = useState('');
  const [avgWeight, setAvgWeight] = useState('');
  const [count, setCount] = useState('');
  const [zone, setZone] = useState('');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');

  // Espèce actuellement sélectionnée
  const currentSpecies = speciesData.find(s => s.code === speciesCode);

  // Initialiser la zone quand l'espèce change
  useState(() => {
    if (currentSpecies && currentSpecies.zones.length > 0 && !zone) {
      setZone(currentSpecies.zones[0]);
    }
  }, [speciesCode]);

  // Handler : changement d'espèce
  const handleSpeciesChange = (e) => {
    const newSpeciesCode = e.target.value;
    setSpeciesCode(newSpeciesCode);

    // Réinitialiser la zone au premier élément de la nouvelle espèce
    const newSpecies = speciesData.find(s => s.code === newSpeciesCode);
    if (newSpecies && newSpecies.zones.length > 0) {
      setZone(newSpecies.zones[0]);
    }
  };

  // Handler : boutons démo rapide
  const loadDemo = (demo) => {
    setSpeciesCode(demo.speciesCode);
    setAvgSize(demo.avgSize);
    setAvgWeight(demo.avgWeight);
    setCount(demo.count);
    setZone(demo.zone);
  };

  // Handler : soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      speciesCode,
      avgSize: parseFloat(avgSize),
      avgWeight: parseFloat(avgWeight),
      count: parseInt(count, 10),
      zone,
      date,
      notes
    });
  };

  // Validation : bouton désactivé si données invalides
  const isValid =
    parseFloat(avgSize) > 0 &&
    parseFloat(avgWeight) > 0 &&
    parseInt(count, 10) >= 10;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      {/* En-tête */}
      <h2 className="text-xl md:text-2xl font-bold text-[#041E42] mb-4">
        Nouvel échantillon
      </h2>

      {/* Boutons démo rapide */}
      <div className="flex gap-2 mb-4 md:mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => loadDemo({
            speciesCode: 'poulpe',
            avgSize: 9.5,
            avgWeight: 380,
            count: 50,
            zone: 'Lassarga'
          })}
          className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm border border-[#8B5CF6] text-[#8B5CF6] rounded-lg hover:bg-[#8B5CF6] hover:text-white transition-colors"
        >
          🐙 Poulpe juvénile
        </button>
        <button
          type="button"
          onClick={() => loadDemo({
            speciesCode: 'sardine',
            avgSize: 14.5,
            avgWeight: 22,
            count: 100,
            zone: 'Port Dakhla'
          })}
          className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm border border-[#0EA5E9] text-[#0EA5E9] rounded-lg hover:bg-[#0EA5E9] hover:text-white transition-colors"
        >
          🐟 Sardine petite
        </button>
        <button
          type="button"
          onClick={() => loadDemo({
            speciesCode: 'courbine',
            avgSize: 72,
            avgWeight: 5200,
            count: 15,
            zone: 'Port Dakhla'
          })}
          className="px-2.5 md:px-3 py-1.5 text-xs md:text-sm border border-[#10B981] text-[#10B981] rounded-lg hover:bg-[#10B981] hover:text-white transition-colors"
        >
          🐠 Courbine normale
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Espèce */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Espèce
          </label>
          <select
            value={speciesCode}
            onChange={handleSpeciesChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
          >
            {speciesData.map(species => (
              <option key={species.code} value={species.code}>
                {species.icone} {species.nom_commun}
              </option>
            ))}
          </select>
        </div>

        {/* Taille moyenne */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taille moyenne (cm)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={avgSize}
              onChange={(e) => setAvgSize(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
              placeholder="Ex: 15.5"
            />
            {avgSize && currentSpecies && (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  parseFloat(avgSize) >= currentSpecies.L50_cm
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                L50 = {currentSpecies.L50_cm} cm
              </span>
            )}
          </div>
        </div>

        {/* Poids moyen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poids moyen (g)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="1"
              value={avgWeight}
              onChange={(e) => setAvgWeight(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
              placeholder="Ex: 500"
            />
            {avgWeight && currentSpecies && (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  parseFloat(avgWeight) >= currentSpecies.poids_maturite_g
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                Min = {currentSpecies.poids_maturite_g} g
              </span>
            )}
          </div>
        </div>

        {/* Nombre d'individus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'individus
          </label>
          <input
            type="number"
            min="10"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
            placeholder="Ex: 50"
          />
        </div>

        {/* Zone de pêche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zone de pêche
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
          >
            {currentSpecies?.zones.map(z => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none resize-none"
            placeholder="Observations particulières..."
          />
        </div>

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-opacity ${
            isValid
              ? 'bg-[#0EA5E9] hover:opacity-90'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          🔬 Lancer l'analyse BAHRIA
        </button>
      </form>
    </div>
  );
}
