/**
 * Agentic AI Orchestration API Service
 * 
 * Calls Express backend Agentic AI Orchestrator (/api/marine/analyze).
 * Uses existing frontend AI demo card structure as fallback when live backend is offline.
 * 
 * IMPORTANT: Fallback responses are explicitly flagged with source: "fallback" and isFallback: true.
 */

import { withFallback } from './client';
import * as endpoints from './endpoints';
import { adaptAiResponse } from './adapters';

// Existing frontend AI demo response fixture
const MOCK_AI_FALLBACK = {
  intent: 'FISHING_SAFETY_QUERY',
  answer: "Tomorrow morning's conditions are MODERATE. A suitable PFZ was found 31.8 km southeast of your current location. The recommended route avoids high-risk and restricted areas.",
  recommendation: 'Depart early at 05:30 AM IST. Keep VHF Channel 16 active.',
  evidence: {
    riskScore: 40,
    riskLevel: 'Moderate',
    nearestPfzKm: 31.8,
    routeDistanceKm: 36.4,
    routeRisk: 'Low'
  },
  context: {
    vesselLocation: { latitude: 16.98, longitude: 82.24 },
    language: 'en'
  },
  confidence: 0.95
};

/**
 * Execute Agentic AI Query Analysis
 * @param {Object} queryInput - { query, userLocation, language }
 */
export async function analyzeMarineQuery(queryInput = {}) {
  return withFallback(
    async () => {
      const res = await endpoints.marineAnalyze(queryInput);
      const adapted = adaptAiResponse(res);
      return adapted;
    },
    MOCK_AI_FALLBACK,
    'AgenticAI'
  );
}
