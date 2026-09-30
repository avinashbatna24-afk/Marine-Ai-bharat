/**
 * Active Alerts & Warnings API Service
 * 
 * Interacts with Express Alert Engine (/api/alerts, /api/alerts/evaluate).
 * Reuses existing frontend alert fixtures from AlertsPage.jsx for fallback.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptAlertModel } from './adapters';
import { getWarnings } from './weatherApi';

// Existing frontend alert dataset fixture
const MOCK_ALERTS_FALLBACK = [
  {
    id: 'alt-1',
    title: 'High Wind Speed Detected',
    description: 'Sustained wind speed of 32 kt detected in your current area.',
    location: 'Bay of Bengal, India',
    timestamp: '10:20 AM IST',
    severity: 'Critical',
    source: 'IMD'
  },
  {
    id: 'alt-2',
    title: 'Cyclone Activity Nearby',
    description: 'Cyclone "Mocha" is 120 km away from your location.',
    location: 'Bay of Bengal, India',
    timestamp: '09:45 AM IST',
    severity: 'High',
    source: 'IMD'
  },
  {
    id: 'alt-3',
    title: 'High Wave Height',
    description: 'Wave height of 4.5 m detected in your area.',
    location: 'Bay of Bengal, India',
    timestamp: '08:30 AM IST',
    severity: 'Medium',
    source: 'Open-Meteo Marine'
  },
  {
    id: 'alt-4',
    title: 'Heavy Rainfall Expected',
    description: 'Heavy rainfall expected in the next 6 hours.',
    location: 'Bay of Bengal, India',
    timestamp: '07:15 AM IST',
    severity: 'Low',
    source: 'IMD'
  },
  {
    id: 'alt-5',
    title: 'System Update',
    description: 'New weather model data is now available.',
    location: 'Bay of Bengal, India',
    timestamp: 'Yesterday, 11:30 PM',
    severity: 'Info',
    source: 'System'
  },
  {
    id: 'alt-6',
    title: 'Geofence Boundary Warning',
    description: 'Vessel approach within 1.5 nm of Restricted Firing Zone B.',
    location: 'Kakinada Offshore Sector',
    timestamp: 'Yesterday, 09:15 PM',
    severity: 'Critical',
    source: 'GIS Engine'
  },
  {
    id: 'alt-7',
    title: 'PFZ Advisory Released',
    description: 'INCOIS Chlorophyll-a satellite telemetry updated for PFZ-03.',
    location: 'Godavari Outer Plume',
    timestamp: 'Yesterday, 06:40 PM',
    severity: 'Info',
    source: 'INCOIS'
  },
  {
    id: 'alt-8',
    title: 'Squall Line Formation',
    description: 'Convective storm cloud formation detected north-east.',
    location: 'Vizag Deep Sea Fairway',
    timestamp: 'May 18, 2025 04:20 PM',
    severity: 'High',
    source: 'IMD'
  },
  {
    id: 'alt-9',
    title: 'Low Sea Surface Pressure',
    description: 'Barometric pressure dropped to 998 hPa rapidly.',
    location: 'Coromandel Basin',
    timestamp: 'May 18, 2025 02:00 PM',
    severity: 'Medium',
    source: 'Barometric'
  },
  {
    id: 'alt-10',
    title: 'Navigational Light Beacon Fault',
    description: 'Machilipatnam outer fairway buoy #4 signal lost.',
    location: 'Machilipatnam Approach',
    timestamp: 'May 17, 2025 11:10 AM',
    severity: 'Low',
    source: 'Beacon Monitor'
  }
];

/**
 * Fetch All Active Maritime Alerts
 */
export async function getAlerts() {
  return withFallback(
    async () => {
      const res = await endpoints.alerts();
      const rawList = res.alerts || res.data || (Array.isArray(res) ? res : []);
      return rawList.map(adaptAlertModel);
    },
    MOCK_ALERTS_FALLBACK.map(adaptAlertModel),
    'Alerts'
  );
}

/**
 * Fetch IMD Cyclone & Marine Warnings
 */
export async function getActiveWarnings(params = {}) {
  return getWarnings(params);
}

/**
 * Dynamically Evaluate Alerts based on local telemetry/location
 * @param {Object} evalInput - { weather, ocean, location }
 */
export async function evaluateAlerts(evalInput = {}) {
  const query = {
    latitude: evalInput.latitude ?? evalInput.lat ?? 16.9241,
    longitude: evalInput.longitude ?? evalInput.lon ?? 80.1985,
    ...evalInput
  };
  return withFallback(
    async () => {
      const res = await endpoints.alertsEvaluate(query);
      const rawList = res.alerts || res.data || [];
      return rawList.map(adaptAlertModel);
    },
    MOCK_ALERTS_FALLBACK.map(adaptAlertModel),
    'EvaluateAlerts'
  );
}
