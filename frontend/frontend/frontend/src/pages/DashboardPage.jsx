import React, { useState, useEffect } from 'react';
import SpatialIntelligenceMap from '../components/dashboard/SpatialIntelligenceMap';
import MarineAICoPilot from '../components/dashboard/MarineAICoPilot';
import BottomTelemetryGrid from '../components/dashboard/BottomTelemetryGrid';
import { useNavigate } from 'react-router-dom';
import { getTelemetry } from '../api/weatherApi';
import { getNearbyPFZs } from '../api/pfzApi';
import { getAlerts } from '../api/alertsApi';
import { calculateMarineRisk } from '../api/riskApi';

// Default initial location: Kakinada Anchorage / Coast
const DEFAULT_LOCATION = { lat: 16.98, lon: 82.24 };

export default function DashboardPage() {
  const navigate = useNavigate();

  // Section Loading States
  const [isLoading, setIsLoading] = useState({
    telemetry: true,
    pfz: true,
    alerts: true,
    risk: true
  });

  // Section Data States
  const [telemetryState, setTelemetryState] = useState({ data: null, isFallback: false, source: 'live' });
  const [pfzState, setPfzState] = useState({ data: [], isFallback: false, source: 'live' });
  const [alertsState, setAlertsState] = useState({ data: [], isFallback: false, source: 'live' });
  const [riskState, setRiskState] = useState({ data: null, isFallback: false, source: 'live' });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        // 1. Concurrently fetch independent telemetry, PFZs, and active alerts
        const [telemetryRes, pfzRes, alertsRes] = await Promise.all([
          getTelemetry(DEFAULT_LOCATION),
          getNearbyPFZs({ latitude: DEFAULT_LOCATION.lat, longitude: DEFAULT_LOCATION.lon, limit: 5 }),
          getAlerts()
        ]);

        if (!isMounted) return;

        setTelemetryState(telemetryRes);
        setPfzState(pfzRes);
        setAlertsState(alertsRes);

        setIsLoading((prev) => ({ ...prev, telemetry: false, pfz: false, alerts: false }));

        // 2. Compute Marine Risk using live/normalized weather and ocean telemetry
        const telemetryData = telemetryRes.data;
        const riskInput = {
          windSpeed: telemetryData?.wind?.speed ?? 14,
          windGust: telemetryData?.wind?.gust ?? 18,
          waveHeight: telemetryData?.waves?.height ?? 1.2,
          rainProbability: telemetryData?.precipitation ?? 0,
          lightning: 0,
          cyclone: 0
        };

        const riskRes = await calculateMarineRisk(riskInput);

        if (!isMounted) return;

        setRiskState(riskRes);
        setIsLoading((prev) => ({ ...prev, risk: false }));
      } catch (err) {
        if (import.meta.env?.DEV) {
          console.warn('[MarineAI Dashboard] Unexpected data load error:', err);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAnyFallback = telemetryState.isFallback || pfzState.isFallback || alertsState.isFallback || riskState.isFallback;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* SUBTLE FALLBACK STATUS INDICATOR */}
      {isAnyFallback && (
        <div className="bg-[#0A2239] border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-between font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Notice: Using offline fallback data for unreachable backend services.</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Live API Priority</span>
        </div>
      )}

      {/* TOP ROW: SPATIAL MAP (LEFT) & AI COPILOT ASSISTANT (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SPATIAL MAP (8 COLUMNS) */}
        <div className="lg:col-span-8">
          <SpatialIntelligenceMap
            pfzs={pfzState.data}
            location={DEFAULT_LOCATION}
            isLoading={isLoading.pfz}
            isFallback={pfzState.isFallback}
          />
        </div>

        {/* AI COPILOT ASSISTANT (4 COLUMNS) */}
        <div className="lg:col-span-4">
          <MarineAICoPilot
            onNavigateToRoute={() => navigate('/safe-routes')}
            location={DEFAULT_LOCATION}
          />
        </div>
      </div>

      {/* BOTTOM ROW: TELEMETRY & ACTIVE ALERTS BLOCK (7 CARDS HORIZONTAL) */}
      <div className="w-full pt-1">
        <BottomTelemetryGrid
          telemetry={telemetryState.data}
          alertsCount={alertsState.data?.length ?? 2}
          isLoading={isLoading.telemetry}
          isFallback={telemetryState.isFallback}
          source={telemetryState.source}
        />
      </div>
    </div>
  );
}
