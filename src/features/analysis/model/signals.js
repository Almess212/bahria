/**
 * Calcule la distance circulaire minimale entre un mois et une liste de mois de reproduction
 * (fonction utilitaire réutilisée depuis features.js)
 */
function computeMonthsToRepro(currentMonth, reproMonths) {
  let minDistance = 12;

  for (const reproMonth of reproMonths) {
    const forwardDist = (reproMonth - currentMonth + 12) % 12;
    const backwardDist = (currentMonth - reproMonth + 12) % 12;
    const distance = Math.min(forwardDist, backwardDist);
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

/**
 * Génère les signaux d'alerte pour chaque feature
 * @param {Object} features - Les 10 features calculées
 * @param {Object} species - Données de l'espèce
 * @returns {Array} Tableau de 10 signaux
 */
export function generateSignals(features, species) {
  const signals = [];

  // Signal 1 : Taille moyenne (avg_size_cm)
  let sizeType, sizeIcon, sizeScore;
  if (features.avg_size_cm < species.L50_cm) {
    sizeType = 'critical';
    sizeIcon = '🔴';
    sizeScore = 35;
  } else if (features.avg_size_cm < species.taille_optimale_cm) {
    sizeType = 'warning';
    sizeIcon = '🟠';
    sizeScore = 20;
  } else {
    sizeType = 'ok';
    sizeIcon = '🟢';
    sizeScore = 0;
  }
  signals.push({
    type: sizeType,
    domain: 'biologique',
    icon: sizeIcon,
    title: 'Taille moyenne',
    message: `Taille moyenne (${features.avg_size_cm.toFixed(1)} cm) ${
      sizeType === 'critical'
        ? `inférieure au seuil de maturité L50 (${species.L50_cm} cm)`
        : sizeType === 'warning'
        ? `inférieure à la taille optimale (${species.taille_optimale_cm} cm)`
        : `conforme (≥ ${species.taille_optimale_cm} cm)`
    }`,
    score: sizeScore,
    feature: 'avg_size_cm',
    value: features.avg_size_cm,
    threshold: species.L50_cm
  });

  // Signal 2 : Poids moyen (avg_weight_g)
  let weightType, weightIcon, weightScore;
  if (features.avg_weight_g < species.poids_maturite_g) {
    weightType = 'critical';
    weightIcon = '🔴';
    weightScore = 35;
  } else if (features.avg_weight_g < species.poids_optimal_g) {
    weightType = 'warning';
    weightIcon = '🟠';
    weightScore = 20;
  } else {
    weightType = 'ok';
    weightIcon = '🟢';
    weightScore = 0;
  }
  signals.push({
    type: weightType,
    domain: 'biologique',
    icon: weightIcon,
    title: 'Poids moyen',
    message: `Poids moyen (${features.avg_weight_g.toFixed(0)} g) ${
      weightType === 'critical'
        ? `inférieur au seuil de maturité (${species.poids_maturite_g} g)`
        : weightType === 'warning'
        ? `inférieur au poids optimal (${species.poids_optimal_g} g)`
        : `conforme (≥ ${species.poids_optimal_g} g)`
    }`,
    score: weightScore,
    feature: 'avg_weight_g',
    value: features.avg_weight_g,
    threshold: species.poids_maturite_g
  });

  // Signal 3 : Ratio taille/maturité (size_maturity_ratio)
  let ratioType, ratioIcon, ratioScore;
  if (features.size_maturity_ratio < 0.85) {
    ratioType = 'critical';
    ratioIcon = '🔴';
    ratioScore = 35;
  } else if (features.size_maturity_ratio < 1.0) {
    ratioType = 'warning';
    ratioIcon = '🟠';
    ratioScore = 20;
  } else if (features.size_maturity_ratio >= 1.2) {
    ratioType = 'ok';
    ratioIcon = '🟢';
    ratioScore = 0;
  } else {
    ratioType = 'warning';
    ratioIcon = '🟠';
    ratioScore = 10;
  }
  signals.push({
    type: ratioType,
    domain: 'biologique',
    icon: ratioIcon,
    title: 'Ratio taille/maturité',
    message: `Ratio taille/maturité (${features.size_maturity_ratio.toFixed(2)}) ${
      ratioType === 'critical'
        ? 'très faible (< 0.85)'
        : ratioType === 'warning'
        ? 'en dessous du seuil optimal (< 1.2)'
        : 'optimal (≥ 1.2)'
    }`,
    score: ratioScore,
    feature: 'size_maturity_ratio',
    value: features.size_maturity_ratio,
    threshold: 1.0
  });

  // Signal 4 : Mois actuel vs reproduction (month)
  const monthsToRepro = computeMonthsToRepro(features.month, species.mois_reproduction);
  let monthType, monthIcon, monthScore;
  if (monthsToRepro === 0) {
    monthType = 'critical';
    monthIcon = '🔴';
    monthScore = 25;
  } else if (monthsToRepro <= 1) {
    monthType = 'warning';
    monthIcon = '🟠';
    monthScore = 15;
  } else {
    monthType = 'ok';
    monthIcon = '🟢';
    monthScore = 0;
  }
  signals.push({
    type: monthType,
    domain: 'biologique',
    icon: monthIcon,
    title: 'Période de reproduction',
    message:
      monthType === 'critical'
        ? 'Période de reproduction active'
        : monthType === 'warning'
        ? `Proche de la période de reproduction (${monthsToRepro} mois)`
        : `Hors période de reproduction (${monthsToRepro} mois)`,
    score: monthScore,
    feature: 'month',
    value: features.month,
    threshold: monthsToRepro
  });

  // Signal 5 : SST actuelle (sst_current)
  let sstCurrentType, sstCurrentIcon, sstCurrentScore;
  const sstDelta = Math.abs(features.sst_current - species.sst_seuil_ponte);
  if (sstDelta < 1.5) {
    sstCurrentType = 'critical';
    sstCurrentIcon = '🔴';
    sstCurrentScore = 20;
  } else if (sstDelta < 3.0) {
    sstCurrentType = 'warning';
    sstCurrentIcon = '🟠';
    sstCurrentScore = 10;
  } else {
    sstCurrentType = 'ok';
    sstCurrentIcon = '🟢';
    sstCurrentScore = 0;
  }
  signals.push({
    type: sstCurrentType,
    domain: 'oceanographique',
    icon: sstCurrentIcon,
    title: 'Température de surface (SST)',
    message: `SST actuelle (${features.sst_current.toFixed(1)}°C) ${
      sstCurrentType === 'critical'
        ? `en zone de ponte (seuil: ${species.sst_seuil_ponte}°C)`
        : sstCurrentType === 'warning'
        ? `proche du seuil de ponte (${species.sst_seuil_ponte}°C)`
        : `éloignée du seuil de ponte (${species.sst_seuil_ponte}°C)`
    }`,
    score: sstCurrentScore,
    feature: 'sst_current',
    value: features.sst_current,
    threshold: species.sst_seuil_ponte
  });

  // Signal 6 : Delta SST par rapport au seuil de ponte (sst_spawn_delta)
  let sstDeltaType, sstDeltaIcon, sstDeltaScore;
  if (features.sst_spawn_delta < 1.5) {
    sstDeltaType = 'critical';
    sstDeltaIcon = '🔴';
    sstDeltaScore = 20;
  } else if (features.sst_spawn_delta < 3.0) {
    sstDeltaType = 'warning';
    sstDeltaIcon = '🟠';
    sstDeltaScore = 10;
  } else {
    sstDeltaType = 'ok';
    sstDeltaIcon = '🟢';
    sstDeltaScore = 0;
  }
  signals.push({
    type: sstDeltaType,
    domain: 'oceanographique',
    icon: sstDeltaIcon,
    title: 'Écart SST/seuil ponte',
    message: `Écart SST (${features.sst_spawn_delta.toFixed(1)}°C) ${
      sstDeltaType === 'critical'
        ? 'très faible - conditions de ponte réunies'
        : sstDeltaType === 'warning'
        ? 'modéré - conditions favorables à la ponte'
        : 'élevé - conditions non favorables'
    }`,
    score: sstDeltaScore,
    feature: 'sst_spawn_delta',
    value: features.sst_spawn_delta,
    threshold: 1.5
  });

  // Signal 7 : Indice d'upwelling (upwelling_index)
  let upwellingType, upwellingIcon, upwellingScore;
  if (features.upwelling_index < 0.2) {
    upwellingType = 'critical';
    upwellingIcon = '🔴';
    upwellingScore = 5;
  } else if (features.upwelling_index < 0.4) {
    upwellingType = 'warning';
    upwellingIcon = '🟠';
    upwellingScore = 3;
  } else {
    upwellingType = 'ok';
    upwellingIcon = '🟢';
    upwellingScore = 0;
  }
  signals.push({
    type: upwellingType,
    domain: 'oceanographique',
    icon: upwellingIcon,
    title: 'Indice d\'upwelling',
    message: `Indice d'upwelling (${features.upwelling_index.toFixed(2)}) ${
      upwellingType === 'critical'
        ? 'très faible - productivité réduite'
        : upwellingType === 'warning'
        ? 'modéré - productivité moyenne'
        : 'bon - productivité élevée'
    }`,
    score: upwellingScore,
    feature: 'upwelling_index',
    value: features.upwelling_index,
    threshold: 0.4
  });

  // Signal 8 : CPUE récente (cpue_recent)
  const cpueThreshold50 = species.cpue_2023 * 0.5;
  const cpueThreshold75 = species.cpue_2023 * 0.75;
  let cpueType, cpueIcon, cpueScore;
  if (features.cpue_recent < cpueThreshold50) {
    cpueType = 'critical';
    cpueIcon = '🔴';
    cpueScore = 15;
  } else if (features.cpue_recent < cpueThreshold75) {
    cpueType = 'warning';
    cpueIcon = '🟠';
    cpueScore = 10;
  } else {
    cpueType = 'ok';
    cpueIcon = '🟢';
    cpueScore = 0;
  }
  signals.push({
    type: cpueType,
    domain: 'halieutique',
    icon: cpueIcon,
    title: 'CPUE récente',
    message: `CPUE 2025 (${features.cpue_recent} kg/sortie) ${
      cpueType === 'critical'
        ? `critique (< 50% de 2023: ${species.cpue_2023})`
        : cpueType === 'warning'
        ? `en baisse (< 75% de 2023: ${species.cpue_2023})`
        : `stable (≥ 75% de 2023: ${species.cpue_2023})`
    }`,
    score: cpueScore,
    feature: 'cpue_recent',
    value: features.cpue_recent,
    threshold: cpueThreshold50
  });

  // Signal 9 : Tendance CPUE sur 2 ans (cpue_trend_2y_pct)
  let trendType, trendIcon, trendScore;
  if (features.cpue_trend_2y_pct < -25) {
    trendType = 'critical';
    trendIcon = '🔴';
    trendScore = 15;
  } else if (features.cpue_trend_2y_pct < -10) {
    trendType = 'warning';
    trendIcon = '🟠';
    trendScore = 5;
  } else {
    trendType = 'ok';
    trendIcon = '🟢';
    trendScore = 0;
  }
  signals.push({
    type: trendType,
    domain: 'halieutique',
    icon: trendIcon,
    title: 'Tendance CPUE (2 ans)',
    message: `Tendance CPUE (${features.cpue_trend_2y_pct}%) ${
      trendType === 'critical'
        ? 'en forte baisse (< -25%)'
        : trendType === 'warning'
        ? 'en baisse modérée (< -10%)'
        : 'stable ou en hausse'
    }`,
    score: trendScore,
    feature: 'cpue_trend_2y_pct',
    value: features.cpue_trend_2y_pct,
    threshold: -25
  });

  // Signal 10 : Distance aux mois de reproduction (months_to_repro)
  let reproDistType, reproDistIcon, reproDistScore;
  if (features.months_to_repro === 0) {
    reproDistType = 'critical';
    reproDistIcon = '🔴';
    reproDistScore = 25;
  } else if (features.months_to_repro <= 1) {
    reproDistType = 'warning';
    reproDistIcon = '🟠';
    reproDistScore = 15;
  } else if (features.months_to_repro >= 3) {
    reproDistType = 'ok';
    reproDistIcon = '🟢';
    reproDistScore = 0;
  } else {
    reproDistType = 'warning';
    reproDistIcon = '🟠';
    reproDistScore = 5;
  }
  signals.push({
    type: reproDistType,
    domain: 'biologique',
    icon: reproDistIcon,
    title: 'Distance à la reproduction',
    message: `${
      features.months_to_repro === 0
        ? 'En période de reproduction active'
        : `${features.months_to_repro} mois avant/après la reproduction (${species.pic_ponte})`
    }`,
    score: reproDistScore,
    feature: 'months_to_repro',
    value: features.months_to_repro,
    threshold: 0
  });

  return signals;
}
