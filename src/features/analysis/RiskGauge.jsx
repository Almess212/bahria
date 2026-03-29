import { useState, useEffect } from 'react';

/**
 * Jauge semi-circulaire de risque avec animation
 * @param {Object} props
 * @param {number} props.score - Score de risque (0-100)
 * @param {number} props.size - Taille de la jauge en pixels (défaut: 240)
 */
export default function RiskGauge({ score, size = 240 }) {
  // État pour l'animation
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animation au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Déterminer la couleur et le label selon le score
  const getColor = (value) => {
    if (value < 30) return '#10B981'; // Vert
    if (value < 45) return '#3B82F6'; // Bleu
    if (value < 70) return '#F59E0B'; // Orange
    return '#EF4444'; // Rouge
  };

  const getLabel = (value) => {
    if (value < 30) return 'Risque faible';
    if (value < 45) return 'Risque modéré';
    if (value < 70) return 'Risque élevé';
    return 'Risque critique';
  };

  const color = getColor(score);
  const label = getLabel(score);

  // Dimensions
  const radius = size / 2 - 30;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 20;
  const circumference = Math.PI * radius; // Demi-cercle

  return (
    <div className="flex flex-col items-center">
      {/* SVG Gauge */}
      <svg width={size} height={size * 0.7} className="overflow-visible">
        {/* Arc de fond gris - demi-cercle ouvert vers le bas */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Arc de progression coloré - avec stroke-dasharray pour animation */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animatedScore / 100)}
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease'
          }}
        />

        {/* Texte au centre : score */}
        <text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold"
          style={{ fontSize: '48px', fill: color, transition: 'fill 0.3s ease' }}
        >
          {Math.round(animatedScore)}
        </text>

        {/* Texte sous le score : /100 */}
        <text
          x={centerX}
          y={centerY + 32}
          textAnchor="middle"
          className="text-sm"
          fill="#9CA3AF"
        >
          /100
        </text>
      </svg>

      {/* Label sous la jauge */}
      <div
        className="mt-2 font-semibold text-lg"
        style={{ color, transition: 'color 0.3s ease' }}
      >
        {label}
      </div>
    </div>
  );
}
