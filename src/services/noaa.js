/**
 * Service pour récupérer les données SST (Sea Surface Temperature) depuis NOAA ERDDAP
 */

/**
 * Construit l'URL NOAA ERDDAP pour une date donnée
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {string} URL complète
 */
function buildNoaaUrl(dateStr) {
  return `https://www.ncei.noaa.gov/erddap/griddap/ncdc_oisst_v2_avhrr_by_time_zlev_lat_lon.json?sst[(${dateStr})T12:00:00Z][(0.0)][(23.875)][(-15.875)]`;
}

/**
 * Tente de récupérer la SST depuis NOAA pour une date donnée
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Promise<Object|null>} Données SST ou null si échec
 */
async function tryFetchSst(dateStr) {
  try {
    // Créer un AbortController avec timeout de 5 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = buildNoaaUrl(dateStr);
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Parser la réponse NOAA ERDDAP
    // Structure: { table: { rows: [[date, zlev, lat, lon, sst]] } }
    if (data?.table?.rows?.length > 0) {
      const sst = data.table.rows[0][4]; // SST est à l'index 4

      return {
        sst: parseFloat(sst),
        date: dateStr,
        source: 'NOAA ERDDAP',
        live: true
      };
    }

    return null;
  } catch (error) {
    // Timeout ou erreur réseau
    console.warn(`Échec fetch NOAA pour ${dateStr}:`, error.message);
    return null;
  }
}

/**
 * Récupère la SST actuelle depuis NOAA ERDDAP
 * Tente d'abord avec la date du jour, puis la veille si échec
 * Retourne un fallback en cache local si les deux échouent
 * @returns {Promise<Object>} { sst, date, source, live }
 */
export async function fetchCurrentSST() {
  // Date du jour au format YYYY-MM-DD
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Tentative 1 : aujourd'hui
  let result = await tryFetchSst(todayStr);
  if (result) {
    return result;
  }

  // Tentative 2 : hier
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  result = await tryFetchSst(yesterdayStr);
  if (result) {
    return result;
  }

  // Fallback : cache local
  return {
    sst: 16.0,
    date: '2026-02-21',
    source: 'Cache local',
    live: false
  };
}
