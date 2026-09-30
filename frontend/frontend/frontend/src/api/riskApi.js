/**
 * Marine Safety & Risk API Service
 * 
 * Calls Express backend Phase 8 Risk Engine (/api/marine/risk).
 * Uses existing frontend risk mock values for fallback.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptRiskScore } from './adapters';

// Canonical frontend risk mock model
export const MOCK_RISK_FALLBACK = {
  rawScore: 40,
  score: 40,
  level: 'Moderate',
  factors: [
    { label: 'Wind', value: 75, status: 'High', color: 'bg-red-500' },
    { label: 'Waves', value: 60, status: 'Moderate', color: 'bg-amber-500' },
    { label: 'Lightning', value: 90, status: 'High', color: 'bg-red-600' },
    { label: 'Cyclone', value: 30, status: 'Low', color: 'bg-amber-400' },
    { label: 'Current', value: 50, status: 'Moderate', color: 'bg-amber-500' }
  ],
  perFactorBreakdown: {
    windRisk: 30,
    waveRisk: 25,
    rainRisk: 10,
    lightningRisk: 35,
    cycloneRisk: 0
  },
  confidenceScore: 0.92,
  explainability: 'Risk is elevated primarily due to localized wind gusts and offshore lightning activity near Kakinada Bay.'
};

/**
 * Calculate Marine Risk Score & Factor Breakdown
 * @param {Object} riskInput - { windSpeed, windGust, waveHeight, rainProbability, lightning, cyclone }
 */
export async function calculateMarineRisk(riskInput = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.marineRisk(riskInput);
      const riskData = res.risk || res.data || res;
      return adaptRiskScore(riskData);
    },
    MOCK_RISK_FALLBACK,
    'MarineRisk'
  );
}
