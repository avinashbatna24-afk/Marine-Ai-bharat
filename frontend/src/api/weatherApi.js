/**
 * Weather & Ocean API Service
 * 
 * Provides live oceanographic metrics, Open-Meteo marine telemetry, IMD cyclone warnings, and INCOIS ERDDAP SST.
 * Uses existing frontend mock data as fallback when live endpoints are unreachable.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptTelemetry } from './adapters';

// Existing frontend mock data fixtures for fallback
const MOCK_WEATHER_FALLBACK = {
  windSpeed: null,
  windGust: null,
  windDirection: null,
  precipitation: null,
  weatherCode: null,
  visibility: null,
  source: 'unavailable'
};

const MOCK_OCEAN_FALLBACK = {
  waveHeight: null,
  wavePeriod: null,
  sst: null,
  chlorophyll: null,
  currentSpeed: null,
  currentDirection: null,
  source: 'unavailable'
};

const MOCK_FORECAST_FALLBACK = [];

const MOCK_WARNINGS_FALLBACK = {
  count: 0,
  warnings: []
};

const MOCK_SST_FALLBACK = {
  averageSst: null,
  unit: '°C',
  source: 'UNAVAILABLE'
};

/**
 * Fetch Live Weather Data
 * @param {Object} params - { lat, lon }
 */
export async function getWeather(params = {}) {
  const query = { lat: params.lat ?? 16.9241, lon: params.lon ?? 80.1985 };
  return withFallback(
    async () => {
      const data = await endpoints.weather(query);
      return data;
    },
    MOCK_WEATHER_FALLBACK,
    'Weather'
  );
}

/**
 * Fetch Weather Forecast
 * @param {Object} params - { lat, lon, targetDate }
 */
export async function getWeatherForecast(params = {}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const query = {
    lat: params.lat ?? 16.9241,
    lon: params.lon ?? 80.1985,
    targetDate: params.targetDate || todayStr
  };
  return withFallback(
    async () => {
      const data = await endpoints.weatherForecast(query);
      return data;
    },
    MOCK_FORECAST_FALLBACK,
    'WeatherForecast'
  );
}

/**
 * Fetch Real 7-Day Weather Forecast
 * @param {Object} params - { lat, lon }
 */
export async function getSevenDayForecast(params = {}) {
  const query = {
    lat: params.lat ?? 16.98,
    lon: params.lon ?? 82.24,
    days: 7
  };
  return withFallback(
    async () => {
      const data = await endpoints.weatherForecast(query);
      return data;
    },
    null,
    'SevenDayForecast'
  );
}

/**
 * Fetch Live Ocean Telemetry
 * @param {Object} params - { lat, lon }
 */
export async function getOcean(params = {}) {
  const query = { lat: params.lat ?? 16.9241, lon: params.lon ?? 80.1985 };
  return withFallback(
    async () => {
      const data = await endpoints.ocean(query);
      return data;
    },
    MOCK_OCEAN_FALLBACK,
    'Ocean'
  );
}

/**
 * Fetch Ocean Forecast
 * @param {Object} params - { lat, lon, targetDate }
 */
export async function getOceanForecast(params = {}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const query = {
    lat: params.lat ?? 16.9241,
    lon: params.lon ?? 80.1985,
    targetDate: params.targetDate || todayStr
  };
  return withFallback(
    async () => {
      const data = await endpoints.oceanForecast(query);
      return data;
    },
    MOCK_FORECAST_FALLBACK,
    'OceanForecast'
  );
}

/**
 * Fetch IMD Cyclone Warnings
 * @param {Object} params - { lat, lon }
 */
export async function getWarnings(params = {}) {
  const query = { lat: params.lat ?? 16.9241, lon: params.lon ?? 80.1985 };
  return withFallback(
    async () => {
      const data = await endpoints.warnings(query);
      return data;
    },
    MOCK_WARNINGS_FALLBACK,
    'Warnings'
  );
}

/**
 * Fetch Sea Surface Temperature (INCOIS ERDDAP)
 * @param {Object} params - { minLat, maxLat, minLon, maxLon }
 */
export async function getSST(params = {}) {
  return withFallback(
    async () => {
      const data = await endpoints.marineSst(params);
      return data;
    },
    MOCK_SST_FALLBACK,
    'MarineSST'
  );
}

/**
 * Combined Weather & Ocean Telemetry Helper
 * Calls parallel endpoints and normalizes into single telemetry structure.
 * @param {Object} params - { lat, lon }
 */
export async function getTelemetry(params = {}) {
  try {
    const [weatherRes, oceanRes] = await Promise.all([
      getWeather(params),
      getOcean(params)
    ]);

    const isFallbackCombined = weatherRes.isFallback || oceanRes.isFallback;
    const normalizedTelemetry = adaptTelemetry(weatherRes.data, oceanRes.data);

    return {
      data: normalizedTelemetry,
      source: isFallbackCombined ? 'fallback' : 'live',
      isFallback: isFallbackCombined,
      error: weatherRes.error || oceanRes.error || null
    };
  } catch (error) {
    if (import.meta.env?.DEV || process.env.NODE_ENV !== 'production') {
      console.warn('[MarineAI] Telemetry API unavailable; using fallback telemetry data.');
    }
    return {
      data: adaptTelemetry(MOCK_WEATHER_FALLBACK, MOCK_OCEAN_FALLBACK),
      source: 'fallback',
      isFallback: true,
      error: { message: error.message || 'Telemetry request failed', status: null }
    };
  }
}
