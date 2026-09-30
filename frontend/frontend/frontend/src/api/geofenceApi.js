/**
 * GIS Geofence API Service
 * 
 * Interacts with Phase 3 Server-Side GIS Engine (/api/marine/geofence, /api/marine/geofence/check).
 * Falls back to existing client-side GIS geofence math in src/gis/geofence.js when backend is unreachable.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { DEMO_GEOFENCE_ZONES, checkPointGeofence, checkRouteGeofence } from '../gis/geofence';

/**
 * Fetch All Active Geofence Zones
 * @param {Object} params - { latitude, longitude }
 */
export async function getGeofences(params = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.geofence(params);
      return res.zones || res.data || res;
    },
    DEMO_GEOFENCE_ZONES,
    'GeofenceList'
  );
}

/**
 * Check Geofence Breach for Point or Proposed Route
 * @param {Object} checkInput - { latitude, longitude, waypoints, pfzs }
 */
export async function checkGeofence(checkInput = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.geofenceCheck(checkInput);
      return res;
    },
    (() => {
      if (checkInput.waypoints && checkInput.waypoints.length > 0) {
        return checkRouteGeofence(checkInput.waypoints);
      }
      return checkPointGeofence(checkInput.latitude || 16.98, checkInput.longitude || 82.24);
    })(),
    'GeofenceCheck'
  );
}
