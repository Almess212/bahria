/**
 * Carte d'affichage d'un signal individuel
 * @param {Object} props
 * @param {Object} props.signal - Signal à afficher
 */
export default function SignalCard({ signal }) {
  // Déterminer les couleurs selon le type
  const getColors = (type) => {
    switch (type) {
      case 'critical':
        return {
          borderColor: 'border-red-500',
          bgColor: 'bg-red-50',
          badgeColor: 'bg-red-100 text-red-800',
          scoreColor: 'text-red-600'
        };
      case 'warning':
        return {
          borderColor: 'border-amber-500',
          bgColor: 'bg-amber-50',
          badgeColor: 'bg-amber-100 text-amber-800',
          scoreColor: 'text-amber-600'
        };
      case 'ok':
        return {
          borderColor: 'border-green-500',
          bgColor: 'bg-green-50',
          badgeColor: 'bg-green-100 text-green-800',
          scoreColor: 'text-green-600'
        };
      default:
        return {
          borderColor: 'border-gray-500',
          bgColor: 'bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
          scoreColor: 'text-gray-600'
        };
    }
  };

  const colors = getColors(signal.type);

  // Traduire le domaine
  const domainLabel = {
    biologique: 'Biologique',
    oceanographique: 'Océanographique',
    halieutique: 'Halieutique'
  }[signal.domain] || signal.domain;

  return (
    <div
      className={`rounded-lg p-4 border-l-4 ${colors.borderColor} ${colors.bgColor}`}
    >
      {/* En-tête : icon + title + badge score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{signal.icon}</span>
          <h3 className="font-bold text-gray-900">{signal.title}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.badgeColor} whitespace-nowrap`}>
          {signal.score > 0 ? `+${signal.score}` : signal.score} pts
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 mb-3">
        {signal.message}
      </p>

      {/* Badge domaine */}
      <div>
        <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
          {domainLabel}
        </span>
      </div>
    </div>
  );
}
