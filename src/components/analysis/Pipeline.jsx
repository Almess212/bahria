/**
 * Barre de progression en 6 étapes pour l'analyse
 * @param {Object} props
 * @param {number} props.currentStep - Étape actuelle (0-6)
 */
export default function Pipeline({ currentStep }) {
  const steps = [
    { emoji: '📋', label: 'Échantillon reçu' },
    { emoji: '🌊', label: 'Données océano' },
    { emoji: '🧬', label: 'Analyse biologique' },
    { emoji: '🤖', label: 'Random Forest' },
    { emoji: '📊', label: 'Calcul signaux' },
    { emoji: '✅', label: 'Décision' }
  ];

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Cercle avec emoji */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-[#0EA5E9] text-white animate-pulse' : ''}
                    ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                    transition-all duration-300
                  `}
                >
                  {isCompleted ? '✓' : step.emoji}
                </div>

                {/* Label en dessous */}
                <span
                  className={`
                    mt-2 text-xs text-center max-w-[80px] leading-tight
                    ${isCompleted ? 'text-green-600 font-semibold' : ''}
                    ${isCurrent ? 'text-[#0EA5E9] font-semibold' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Ligne de connexion (sauf après la dernière étape) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 rounded
                    ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                    transition-all duration-300
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
