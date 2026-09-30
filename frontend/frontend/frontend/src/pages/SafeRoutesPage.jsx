import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  CheckCircle2, 
  AlertTriangle, 
  SlidersHorizontal, 
  Send, 
  Star, 
  ShieldCheck, 
  Fuel, 
  Clock, 
  MapPin, 
  Compass,
  X,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { findFishingRoute } from '../api/routeApi';
import { checkGeofence } from '../api/geofenceApi';

const DEFAULT_START_COORDS = [16.9241, 82.2418]; // Kakinada Port
const DEFAULT_TARGET_COORDS = [17.04, 82.78];   // PFZ-03 Target

export default function SafeRoutesPage() {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState('Route A');
  const [isFavoritesSaved, setIsFavoritesSaved] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // API State
  const [routeState, setRouteState] = useState({ data: null, isFallback: false, source: 'live' });
  const [geofenceCheckState, setGeofenceCheckState] = useState({ data: null, isFallback: false, source: 'live' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSafeRouteData() {
      try {
        // 1. Fetch live safe fishing route from Express backend solver
        const routeRes = await findFishingRoute({
          startLat: DEFAULT_START_COORDS[0],
          startLon: DEFAULT_START_COORDS[1],
          targetPfzId: 'PFZ-001'
        });

        if (!isMounted) return;
        setRouteState(routeRes);

        const routeData = routeRes.data;
        const waypoints = routeData?.waypoints || [];

        // 2. Independently validate route waypoints against geofence engine
        if (waypoints.length > 0) {
          const checkRes = await checkGeofence({
            latitude: DEFAULT_START_COORDS[0],
            longitude: DEFAULT_START_COORDS[1],
            waypoints
          });
          if (!isMounted) return;
          setGeofenceCheckState(checkRes);
        }
      } catch {
        // Fallback handled in service modules
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSafeRouteData();
    return () => { isMounted = false; };
  }, []);

  const routeData = routeState.data || {};
  const isFallback = routeState.isFallback || geofenceCheckState.isFallback;

  // Transform backend waypoints { lat, lon } into Leaflet polyline points [lat, lon]
  const liveRoutePoints = useMemo(() => {
    if (routeData.waypoints && routeData.waypoints.length > 0) {
      return routeData.waypoints.map(wp => [wp.lat, wp.lon]);
    }
    return [
      DEFAULT_START_COORDS,
      [16.95, 82.35],
      [16.98, 82.52],
      [17.02, 82.68],
      DEFAULT_TARGET_COORDS
    ];
  }, [routeData]);

  // Route B (Alternative Yellow Route)
  const routeBPoints = [
    DEFAULT_START_COORDS,
    [16.84, 82.32],
    [16.72, 82.48],
    [16.75, 82.65],
    DEFAULT_TARGET_COORDS
  ];

  // Custom DivIcon for Start Marker
  const startMarkerIcon = useMemo(() => L.divIcon({
    className: 'start-route-marker',
    html: `
      <div style="
        background-color: #1363DF;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px rgba(19,99,223,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  // Custom DivIcon for Target Marker (PFZ-03)
  const targetMarkerIcon = useMemo(() => L.divIcon({
    className: 'target-route-marker',
    html: `
      <div style="
        background-color: #10B981;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 18px rgba(16,185,129,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  }), []);

  const routeDistance = routeData.distanceKm ? `${routeData.distanceKm} km` : '21.7 km';
  const routeStatus = routeData.geofenceStatus || 'ROUTE_SAFE';
  const isRouteSafe = routeStatus === 'ROUTE_SAFE' || routeStatus === 'CLEAR';

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
              Safest Route to PFZ-03
            </h1>
            {isFallback && (
              <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Demo Data (Offline Fallback)
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            AI-Optimized Safe Fishing Route Solver
          </p>
        </div>

        {/* ROUTE PREFERENCES BUTTON */}
        <button
          onClick={() => setIsPreferencesModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#1363DF]" />
          <span>Route Preferences</span>
        </button>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SATELLITE MAP & ELEVATION/RISK BREAKDOWN (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* SATELLITE MAP DISPLAY */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
            <div className="h-[440px] md:h-[480px] relative w-full">
              <MapContainer
                center={[16.92, 82.52]}
                zoom={9}
                scrollWheelZoom={false}
                className="w-full h-full z-10"
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics"
                />

                {/* HIGH RISK (WAVES) HAZARD ZONE */}
                <Circle
                  center={[17.15, 82.55]}
                  radius={22000}
                  pathOptions={{
                    color: '#EF4444',
                    fillColor: '#EF4444',
                    fillOpacity: 0.45,
                    weight: 1
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-red-600">High Risk (Waves)</div>
                      <div className="text-slate-600">Swell height &gt; 2.8m</div>
                    </div>
                  </Popup>
                </Circle>

                {/* RESTRICTED ZONE */}
                <Circle
                  center={[16.78, 82.48]}
                  radius={16000}
                  pathOptions={{
                    color: '#DC2626',
                    fillColor: '#DC2626',
                    fillOpacity: 0.35,
                    weight: 2,
                    dashArray: '6,6'
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-red-600">Restricted Zone</div>
                      <div className="text-slate-600">Offshore Exclusion Perimeter</div>
                    </div>
                  </Popup>
                </Circle>

                {/* RECOMMENDED LIVE ROUTE (ROUTE A - GREEN DASHED POLYLINE) */}
                <Polyline
                  positions={liveRoutePoints}
                  pathOptions={{
                    color: '#10B981',
                    weight: 4,
                    dashArray: '8,8'
                  }}
                />

                {/* ALTERNATIVE ROUTE (ROUTE B - YELLOW DASHED POLYLINE) */}
                <Polyline
                  positions={routeBPoints}
                  pathOptions={{
                    color: '#F59E0B',
                    weight: 4,
                    dashArray: '8,8'
                  }}
                />

                {/* START MARKER */}
                <Marker position={DEFAULT_START_COORDS} icon={startMarkerIcon}>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-[#1363DF]">Start Point</div>
                      <div className="text-slate-600">Kakinada Port Anchorage</div>
                    </div>
                  </Popup>
                </Marker>

                {/* TARGET MARKER (PFZ-03) */}
                <Marker position={DEFAULT_TARGET_COORDS} icon={targetMarkerIcon}>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-emerald-600">PFZ-03 Destination</div>
                      <div className="text-slate-600">High Catch Potential Zone</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* MAP OVERLAY LABELS */}
              <div className="absolute top-28 left-48 z-[400] bg-slate-950/80 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                Start
              </div>

              <div className="absolute top-24 right-32 z-[400] bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                PFZ-03
              </div>

              <div className="absolute top-16 right-56 z-[400] text-center pointer-events-none">
                <span className="text-xs font-bold text-red-300 drop-shadow-md block">High Risk</span>
                <span className="text-[10px] text-red-200 drop-shadow-md">(Waves)</span>
              </div>

              <div className="absolute bottom-28 left-72 z-[400] text-center pointer-events-none">
                <span className="text-xs font-bold text-red-400 drop-shadow-md block">Restricted Zone</span>
              </div>

              {/* FLOATING MAP LEGEND CARD */}
              <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 select-none min-w-[150px]">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-300">Legend</p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-emerald-500 rounded"></span>
                    <span>Recommended Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-amber-500 rounded"></span>
                    <span>Alternative Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span>High Risk Zone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full border border-red-500 border-dashed"></span>
                    <span>Restricted Zone</span>
                  </div>
                </div>
              </div>

              {/* SCALE INDICATOR AT BOTTOM RIGHT */}
              <div className="absolute bottom-4 right-4 z-[400] bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white px-3 py-1.5 rounded-lg font-mono text-[11px] shadow-md">
                20 km
              </div>
            </div>
          </div>

          {/* BOTTOM ROW UNDER MAP: ELEVATION PROFILE & RISK ALONG ROUTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#0F172A]">
                Route Elevation Profile (Risk)
              </h3>

              <div className="relative h-28 w-full flex items-end pt-2">
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono font-semibold text-slate-400">
                  <span className="text-red-500">High Risk</span>
                  <span className="text-amber-500">Moderate</span>
                  <span className="text-emerald-500">Low Risk</span>
                </div>

                <div className="w-full h-full pl-14 pb-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="riskProfileGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.7" />
                        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 0,50 Q 50,45 100,10 Q 150,40 200,50 L 200,60 L 0,60 Z"
                      fill="url(#riskProfileGradient)"
                    />
                    <path
                      d="M 0,50 Q 50,45 100,10 Q 150,40 200,50"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="absolute bottom-0 left-14 right-0 flex justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-600 font-bold">Start</span>
                  <span className="text-emerald-600 font-bold">PFZ-03</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#0F172A]">
                Risk Along Route
              </h3>

              <div className="flex items-center justify-around gap-4 pt-1">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.8"
                      strokeDasharray="82, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3.8"
                      strokeDasharray="12, 100"
                      strokeDashoffset="-82"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="3.8"
                      strokeDasharray="6, 100"
                      strokeDashoffset="-94"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-sm font-bold text-[#0F172A]">18%</span>
                    <span className="text-[9px] text-slate-400 font-medium leading-none">High Risk</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-600">Low Risk</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">82%</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-slate-600">Moderate Risk</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">12%</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="text-slate-600">High Risk</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ROUTE SUMMARY & COMPARISON STACK (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-sm text-[#0F172A]">
                Route Summary
              </h2>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Route (A)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRouteSafe ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-700 border border-amber-300'}`}>
                  {isRouteSafe ? 'Safest' : 'Caution'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {routeData.summary || 'This route minimizes risk and avoids hazardous areas.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">Distance</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{isLoading ? '...' : routeDistance}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">ETA</span>
                <span className="font-mono font-bold text-slate-800 text-sm">58 min</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium block">Risk Level</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">{isRouteSafe ? 'LOW' : 'MODERATE'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Fuel Estimate</span>
                <span className="font-mono font-bold text-slate-800 text-sm">22.8 L</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Fuel Saved vs Alt</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">12.4 L</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-3">
            <h3 className="font-bold text-xs text-[#0F172A]">
              Hazards Avoided
            </h3>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => setSelectedRoute('Route A')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  selectedRoute === 'Route A'
                    ? 'bg-emerald-50/70 border-emerald-300 font-semibold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-emerald-700 font-bold">Route A (Recommended)</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-600">{routeDistance}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">LOW</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedRoute('Route B')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  selectedRoute === 'Route B'
                    ? 'bg-amber-50/70 border-amber-300 font-semibold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-amber-700 font-bold">Route B (Alternative)</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-600">24.3 km</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">MODERATE</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedRoute('Route C')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  selectedRoute === 'Route C'
                    ? 'bg-red-50/70 border-red-300 font-semibold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-red-700 font-bold">Route C (Shortest)</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-600">18.2 km</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">HIGH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 space-y-2">
            <h3 className="font-bold text-xs text-[#0F172A]">
              Why this route?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Route A is recommended because it avoids high risk zones, restricted areas, and severe weather conditions while maintaining optimal distance and fuel efficiency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFavoritesSaved(!isFavoritesSaved)}
              className={`flex-1 py-3 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isFavoritesSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavoritesSaved ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              <span>{isFavoritesSaved ? 'Saved' : 'Add to Favorites'}</span>
            </button>

            <button
              onClick={() => alert('Starting AI Tactical Navigation along Route A...')}
              className="flex-1 py-3 px-4 bg-[#1363DF] hover:bg-[#0D4EB3] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4 rotate-45" />
              <span>Start Navigation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROUTE PREFERENCES MODAL */}
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#0F172A]">AI Route Preference Options</h3>
              <button
                onClick={() => setIsPreferencesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Optimization Priority</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer">
                  <option value="safety">Maximum Safety (Avoid High Swell)</option>
                  <option value="fuel">Fuel Economy (Eco Speed)</option>
                  <option value="speed">Fastest Arrival (Direct Path)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Restricted Zone Safety Margin</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer font-mono">
                  <option value="2nm">2.0 Nautical Miles Buffer</option>
                  <option value="5nm">5.0 Nautical Miles Buffer</option>
                  <option value="10nm">10.0 Nautical Miles Buffer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsPreferencesModalOpen(false)}
                  className="px-4 py-2 bg-[#1363DF] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Apply Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
