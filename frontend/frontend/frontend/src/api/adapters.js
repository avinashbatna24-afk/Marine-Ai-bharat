/**
 * Data Transformation & Normalization Adapters
 * Pure functions converting raw backend responses into frontend UI models.
 */

/**
 * 1. Convert PFZ score to UI Tier badge
 * @param {number} score 
 * @returns {'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW'}
 */
export function adaptPfzTier(score = 0) {
  if (score >= 80) return 'VERY_HIGH';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

/**
 * 2. Combine Weather & Ocean responses into Unified Telemetry Model
 * @param {Object} weatherData - Response from /api/weather
 * @param {Object} oceanData - Response from /api/ocean
 * @returns {Object} Unified telemetry
 */
export function adaptTelemetry(weatherData = {}, oceanData = {}) {
  const w = weatherData || {};
  const o = oceanData || {};

  return {
    wind: {
      speed: w.windSpeed ?? 14,
      gust: w.windGust ?? 18,
      direction: w.windDirection || 'NE',
      unit: 'kt',
      label: w.windSpeed > 25 ? 'High' : w.windSpeed > 15 ? 'Moderate' : 'Low'
    },
    waves: {
      height: o.waveHeight ?? 1.2,
      period: o.wavePeriod ?? 6.5,
      unit: 'm',
      label: o.waveHeight > 2.5 ? 'High' : o.waveHeight > 1.5 ? 'Moderate' : 'Low'
    },
    sst: {
      value: o.sst ?? 28.4,
      unit: '°C',
      label: o.sst > 30 ? 'High' : 'Normal'
    },
    chlorophyll: {
      value: o.chlorophyll ?? 2.8,
      unit: 'mg/m³',
      label: 'High'
    },
    current: {
      speed: o.currentSpeed ?? 0.6,
      direction: o.currentDirection || 'NE',
      unit: 'm/s',
      label: o.currentSpeed > 1.0 ? 'Strong' : 'Moderate'
    },
    visibility: {
      value: w.visibility ?? 10,
      unit: 'km',
      label: 'Good'
    },
    weatherCode: w.weatherCode ?? 0,
    precipitation: w.precipitation ?? 0,
    source: w.source || o.source || 'live'
  };
}

/**
 * 3. Normalize single PFZ item into Frontend PFZ Model
 * @param {Object} pfz 
 * @returns {Object}
 */
export function adaptPfzModel(pfz) {
  if (!pfz) return null;
  const score = pfz.score ?? pfz.pfz_score ?? pfz.confidence ?? 50;
  const tier = adaptPfzTier(score);

  return {
    id: pfz.id || pfz.pfz_id || `PFZ-${Math.random().toString(36).substr(2, 5)}`,
    name: pfz.name || pfz.location_name || `PFZ Zone (${pfz.latitude?.toFixed(2) || '16.8'}, ${pfz.longitude?.toFixed(2) || '82.4'})`,
    latitude: pfz.latitude ?? pfz.lat ?? 16.742,
    longitude: pfz.longitude ?? pfz.lon ?? 82.491,
    score,
    category: pfz.category || tier,
    tier,
    distanceKm: pfz.distanceKm ?? pfz.distance_km ?? pfz.distance ?? 31.8,
    depth: pfz.depth ?? pfz.depth_m ?? 45,
    sst: pfz.sst ?? pfz.water_temp ?? 28.4,
    chlorophyll: pfz.chlorophyll ?? pfz.chla ?? 2.8,
    bearing: pfz.bearing ?? pfz.bearing_deg ?? 'SE',
    validUntil: pfz.validUntil || pfz.valid_until || 'Today 18:00 IST',
    source: pfz.source || 'INCOIS'
  };
}

/**
 * 4. Normalize Backend Risk Score (0-250+) into 0-100 Gauge Representation
 * @param {Object|number} backendRisk 
 * @returns {Object}
 */
export function adaptRiskScore(backendRisk) {
  if (!backendRisk) {
    return {
      rawScore: 40,
      score: 40,
      level: 'Moderate',
      factors: [],
      perFactorBreakdown: {},
      confidenceScore: 0.92,
      explainability: 'Favorable marine conditions with localized wind gusts.'
    };
  }

  const rawScore = typeof backendRisk === 'number'
    ? backendRisk
    : (backendRisk.score ?? backendRisk.riskScore ?? backendRisk.riskIndex ?? 40);

  const gaugeScore = typeof backendRisk.gaugeScore === 'number'
    ? backendRisk.gaugeScore
    : Math.min(100, Math.max(0, Math.round(rawScore)));

  let level = backendRisk.level;
  if (!level) {
    if (gaugeScore >= 75) level = 'Severe';
    else if (gaugeScore >= 60) level = 'High';
    else if (gaugeScore >= 30) level = 'Moderate';
    else level = 'Low';
  }

  return {
    rawScore,
    score: gaugeScore,
    level,
    factors: backendRisk.factors || [],
    perFactorBreakdown: backendRisk.perFactorBreakdown || {},
    confidenceScore: backendRisk.confidenceScore ?? 0.9,
    explainability: typeof backendRisk.explainability === 'object' ? (backendRisk.explainability.summary || '') : (backendRisk.explainability || '')
  };
}

/**
 * 5. Convert { latitude, longitude } or [lat, lon] to GeoJSON [longitude, latitude]
 * @param {Object|Array} point 
 * @returns {[number, number]} [lon, lat]
 */
export function toGeoJSONCoords(point) {
  if (!point) return [0, 0];
  if (Array.isArray(point)) {
    return [point[1], point[0]];
  }
  const lat = point.latitude ?? point.lat ?? 0;
  const lon = point.longitude ?? point.lon ?? 0;
  return [lon, lat];
}

/**
 * 6. Normalize Backend Agentic AI Response into UI Structure
 * @param {Object} aiResult 
 * @returns {Object}
 */
export function adaptAiResponse(aiResult) {
  if (!aiResult) return null;
  return {
    intent: aiResult.intent || 'GENERAL_QUERY',
    answer: aiResult.answer || aiResult.response || aiResult.text || '',
    recommendation: aiResult.recommendation || '',
    evidence: aiResult.evidence || null,
    context: aiResult.context || null,
    confidence: aiResult.confidence ?? 1.0,
    plannerPlan: aiResult.plannerPlan || null
  };
}

/**
 * 7. Normalize Backend Waypoints / Path into Frontend Route Representation
 * @param {Object} backendRoute 
 * @returns {Object}
 */
export function adaptRouteRepresentation(backendRoute) {
  if (!backendRoute) {
    return {
      waypoints: [],
      geoJsonCoordinates: [],
      distanceKm: 0,
      totalRiskCost: 0,
      geofenceStatus: 'CLEAR',
      summary: ''
    };
  }

  const routeObj = backendRoute.route || backendRoute;
  const rawWaypoints = routeObj.waypoints || routeObj.path || [];

  const waypoints = rawWaypoints.map((wp) => {
    if (Array.isArray(wp)) {
      return { lat: wp[0], lon: wp[1] };
    }
    return {
      lat: wp.lat ?? wp.latitude ?? 0,
      lon: wp.lon ?? wp.longitude ?? 0
    };
  });

  const geoJsonCoordinates = waypoints.map((wp) => [wp.lon, wp.lat]);

  return {
    waypoints,
    geoJsonCoordinates,
    distanceKm: routeObj.distanceKm ?? routeObj.distance_km ?? 0,
    totalRiskCost: routeObj.totalRiskCost ?? routeObj.totalCost ?? routeObj.riskScore ?? 0,
    geofenceStatus: routeObj.geofenceStatus || routeObj.geofence_status || 'CLEAR',
    summary: routeObj.summary || ''
  };
}

export function normalizeSeverity(severity) {
  if (!severity) return 'Info';
  const s = String(severity).trim().toUpperCase();
  if (s === 'CRITICAL' || s === 'SEVERE') return 'Critical';
  if (s === 'HIGH') return 'High';
  if (s === 'MEDIUM' || s === 'MODERATE') return 'Medium';
  if (s === 'LOW') return 'Low';
  if (s === 'INFO') return 'Info';
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
}

/**
 * 8. Normalize Backend Alert object into Frontend Alert Model
 * @param {Object} alert 
 * @returns {Object}
 */
export function adaptAlertModel(alert) {
  if (!alert) return null;

  let locStr = 'Bay of Bengal, India';
  if (typeof alert.location === 'string') {
    locStr = alert.location;
  } else if (alert.location && typeof alert.location === 'object') {
    const lat = alert.location.latitude ?? alert.location.lat;
    const lon = alert.location.longitude ?? alert.location.lon;
    if (lat != null && lon != null) {
      locStr = `${Number(lat).toFixed(4)}° N, ${Number(lon).toFixed(4)}° E`;
    }
  } else if (alert.area) {
    locStr = alert.area;
  }

  let timeStr = 'Just now';
  if (alert.timestamp) {
    timeStr = alert.timestamp;
  } else if (alert.updatedAt || alert.createdAt || alert.issuedAt) {
    try {
      const d = new Date(alert.updatedAt || alert.createdAt || alert.issuedAt);
      timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    } catch (e) {
      timeStr = 'Recently';
    }
  }

  return {
    id: alert.id || `alt-${Math.random().toString(36).substr(2, 5)}`,
    title: alert.title || alert.event || alert.name || 'Maritime Advisory',
    severity: normalizeSeverity(alert.severity || alert.level || 'Medium'),
    description: alert.description || alert.message || alert.details || '',
    location: locStr,
    timestamp: timeStr,
    source: alert.source || 'Marine AI Alert Engine',
    type: alert.type || 'HAZARD'
  };
}

/**
 * 9. Normalize Backend Geofence Zone object into Frontend Model
 * @param {Object} zone 
 * @returns {Object}
 */
export function adaptGeofenceModel(zone) {
  if (!zone) return null;
  return {
    id: zone.id || `geo-${Math.random().toString(36).substr(2, 5)}`,
    name: zone.name || 'Restricted Marine Zone',
    description: zone.description || 'Restricted maritime boundary',
    type: zone.type || zone.category || 'Restricted',
    status: zone.status || 'Active',
    createdOn: zone.createdOn || zone.created_at || 'May 19, 2025 09:30 AM',
    area: zone.area || '120.5 km²',
    alerts: zone.alerts ?? 0,
    coordinates: zone.coordinates || zone.polygonLatLon || [],
    isCircle: !!zone.isCircle,
    center: zone.center || null,
    radius: zone.radius || null,
    severity: zone.severity || 'CRITICAL'
  };
}

/**
 * 10. Convert numeric wind/current bearing (degrees) to Cardinal direction
 * @param {number|string} deg 
 * @returns {string} Cardinal direction (e.g. 'NE', 'SSW')
 */
export function degreesToCardinal(deg) {
  if (deg === null || deg === undefined || deg === '') return 'NE';
  if (typeof deg === 'string' && isNaN(Number(deg))) return deg;
  const num = Number(deg);
  if (isNaN(num)) return 'NE';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const val = Math.floor((num / 22.5) + 0.5);
  return dirs[val % 16];
}

/**
 * 11. Map WMO Weather Code to UI Weather Condition Icon Type
 * @param {number} code 
 * @returns {'sun'|'sun-cloud'|'cloud'|'rain'|'night'}
 */
export function weatherCodeToCondition(code) {
  if (code === null || code === undefined) return 'sun-cloud';
  if (code === 0) return 'sun';
  if (code === 1 || code === 2) return 'sun-cloud';
  if (code === 3 || code === 45 || code === 48) return 'cloud';
  if (code >= 50) return 'rain';
  return 'sun-cloud';
}

/**
 * 12. Normalize Backend Weather Response into Frontend Weather Model
 * @param {Object} rawWeather 
 * @returns {Object}
 */
export function adaptWeatherModel(rawWeather = {}) {
  const w = rawWeather || {};
  const speed = w.windSpeed ?? 14;
  const gust = w.windGust ?? 20;
  const dir = degreesToCardinal(w.windDirection || 'NE');

  return {
    windSpeed: typeof speed === 'number' ? Math.round(speed) : speed,
    windGust: typeof gust === 'number' ? Math.round(gust) : gust,
    windDirection: dir,
    windSpeedLabel: speed > 25 ? 'High' : speed > 12 ? 'Moderate' : 'Low',
    windGustLabel: gust > 30 ? 'Severe' : gust > 18 ? 'Moderate' : 'Low',
    temperature: w.temperature ?? w.temp ?? 28.4,
    tempLabel: (w.temperature ?? 28.4) > 32 ? 'High' : 'Normal',
    humidity: w.humidity ?? 74,
    humidityLabel: (w.humidity ?? 74) > 70 ? 'High' : 'Moderate',
    precipitation: w.precipitation ?? 0,
    precipitationProbability: w.precipitationProbability ?? w.rainProbability ?? 10,
    precipitationLabel: (w.precipitationProbability ?? 10) > 40 ? 'High' : (w.precipitationProbability ?? 10) > 20 ? 'Moderate' : 'Low',
    visibility: w.visibility ?? 10,
    visibilityLabel: (w.visibility ?? 10) >= 8 ? 'Good' : 'Moderate',
    pressure: w.pressure ?? 1012,
    uvIndex: w.uvIndex ?? '6 (High)',
    dewPoint: w.dewPoint ?? 23,
    weatherCode: w.weatherCode ?? 2,
    condition: weatherCodeToCondition(w.weatherCode),
    source: w.source || 'Open-Meteo Weather API'
  };
}

/**
 * 13. Normalize Backend Ocean Response into Frontend Ocean Model
 * @param {Object} rawOcean 
 * @returns {Object}
 */
export function adaptOceanModel(rawOcean = {}) {
  const o = rawOcean || {};
  const waveHeight = o.waveHeight ?? 1.2;
  const wavePeriod = o.wavePeriod ?? 6.5;
  const sst = o.sst ?? 28.4;
  const chlorophyll = o.chlorophyll ?? 2.8;
  const currentSpeed = o.currentSpeed ?? 0.6;
  const currentDirection = degreesToCardinal(o.currentDirection || 'NE');

  return {
    waveHeight,
    waveLabel: waveHeight > 2.5 ? 'High' : waveHeight > 1.2 ? 'Moderate' : 'Low',
    wavePeriod,
    sst,
    sstLabel: sst > 30 ? 'High' : 'Normal',
    chlorophyll,
    currentSpeed,
    currentDirection,
    currentLabel: currentSpeed > 1.0 ? 'Strong' : 'Moderate',
    seaState: o.seaState || (waveHeight > 2.0 ? 'Rough' : 'Moderate'),
    source: o.source || 'Open-Meteo Marine API'
  };
}

/**
 * 14. Normalize Warnings Response into Frontend Warnings Model
 * @param {Object} rawWarnings 
 * @returns {Object}
 */
export function adaptWarningsModel(rawWarnings = {}) {
  const w = rawWarnings || {};
  const hasWarning = !!(w.warning || (w.factors && w.factors.length > 0) || (w.warnings && w.warnings.length > 0));
  
  let list = [];
  if (Array.isArray(w.warnings) && w.warnings.length > 0) {
    list = w.warnings;
  } else if (Array.isArray(w.factors) && w.factors.length > 0) {
    list = w.factors.map((factor, idx) => ({
      id: `warn-${idx}`,
      title: factor,
      severity: w.level || 'HIGH',
      description: `IMD Coastal Advisory for ${w.region || 'Coastal Andhra Pradesh'}. Exercise caution during sea navigation.`,
      area: w.region || 'Coastal Andhra Pradesh'
    }));
  }

  return {
    hasWarning,
    count: list.length,
    level: w.level || (hasWarning ? 'HIGH' : 'CLEAR'),
    region: w.region || 'Coastal Andhra Pradesh',
    source: w.source || 'India Meteorological Department',
    warnings: list
  };
}

/**
 * 15. Normalize Backend Report object into Frontend Report Model
 * @param {Object} report 
 * @returns {Object}
 */
export function adaptReportModel(report) {
  if (!report) return null;
  return {
    id: report.id || `rep-${Math.random().toString(36).substr(2, 5)}`,
    name: report.name || report.title || 'Operational Report',
    description: report.description || report.summary || 'Marine AI analytical report',
    type: report.type || 'Risk Report',
    typeCategory: report.typeCategory || report.category || 'Risk Reports',
    generatedOn: report.generatedOn || report.createdAt || 'Today 09:00 AM',
    location: report.location || report.area || 'Bay of Bengal, India',
    areaDetail: report.areaDetail || report.coverage || '1200 km²',
    format: report.format || 'PDF',
    size: report.size || '2.1 MB',
    status: report.status || 'Completed',
    downloadUrl: report.downloadUrl || '#'
  };
}

