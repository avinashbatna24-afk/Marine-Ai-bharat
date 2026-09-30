import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import MarineIntelligenceHUD from '../components/map/MarineIntelligenceHUD';
import MapLegendWidget from '../components/map/MapLegendWidget';
import MapToolToolbar from '../components/map/MapToolToolbar';
import { MapPin, Navigation, Bell, HelpCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPFZs } from '../api/pfzApi';
import { getGeofences } from '../api/geofenceApi';
import { getSST } from '../api/weatherApi';

export default function MarineMapPage() {
  const [showRisk, setShowRisk] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();

  // API State
  const [pfzState, setPfzState] = useState({ data: [], isFallback: false, source: 'live' });
  const [geofenceState, setGeofenceState] = useState({ data: [], isFallback: false, source: 'live' });
  const [sstState, setSstState] = useState({ data: null, isFallback: false, source: 'live' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      try {
        const [pfzRes, geoRes, sstRes] = await Promise.all([
          getPFZs({ category: 'ALL' }),
          getGeofences({ latitude: 16.98, longitude: 82.24 }),
          getSST({ minLat: 16.0, maxLat: 18.0, minLon: 81.5, maxLon: 83.5 })
        ]);

        if (!isMounted) return;

        setPfzState(pfzRes);
        setGeofenceState(geoRes);
        setSstState(sstRes);
      } catch {
        // Fallbacks handled inside services
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMapData();
    return () => { isMounted = false; };
  }, []);

  const startIcon = useMemo(() => L.divIcon({
    className: 'start-marker',
    html: `<div style="background-color: #1363DF; color: white; font-weight: font-bold; font-size: 11px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(19,99,223,0.8);">A</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  }), []);

  const pfzTargetIcon = useMemo(() => L.divIcon({
    className: 'target-marker',
    html: `<div style="background-color: #00B4D8; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(0,180,216,0.9);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  }), []);

  const startPoint = [16.98, 82.24];
  const targetPoint = [16.742, 82.491];
  const routeWaypoints = [
    startPoint,
    [16.90, 82.35],
    [16.82, 82.42],
    targetPoint
  ];

  const displayPfzs = pfzState.data?.length > 0 ? pfzState.data : [
    { id: 'PFZ-001', name: 'PFZ-001', latitude: 16.742, longitude: 82.491, score: 82, distanceKm: 31.8 }
  ];

  const isAnyFallback = pfzState.isFallback || geofenceState.isFallback || sstState.isFallback;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* MAP PAGE HEADER & SUB-NAV */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
                Marine GIS Intelligence Map
              </h1>
              {isAnyFallback && (
                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Demo GIS Layers (Offline Fallback)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                <MapPin className="w-3 h-3 text-[#1363DF]" />
                Kakinada Coast (16.98° N, 82.24° E)
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono">
            {['Dashboard', 'Analysis', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white font-bold text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
          <div className="hidden sm:flex items-center gap-3 border-r border-slate-200 pr-3">
            <button className="hover:text-[#1363DF] font-medium cursor-pointer">Global View</button>
            <button className="hover:text-[#1363DF] font-medium cursor-pointer">Safety Zones</button>
            <button className="hover:text-[#1363DF] font-medium cursor-pointer">Traffic Density</button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL MAP CANVAS CONTAINER */}
      <div className="w-full h-[640px] rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden relative bg-[#020b14]">
        <MapContainer
          center={[16.88, 82.38]}
          zoom={10}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {showRisk && (
            <Circle
              center={[16.92, 82.32]}
              radius={14000}
              pathOptions={{
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '6, 6'
              }}
            />
          )}

          {showRoute && (
            <Polyline
              positions={routeWaypoints}
              pathOptions={{
                color: '#00B4D8',
                weight: 3,
                dashArray: '8, 8'
              }}
            />
          )}

          {/* Start Point Marker */}
          <Marker position={startPoint} icon={startIcon}>
            <Popup>
              <div className="font-sans text-xs text-slate-900">
                <strong>Kakinada Anchorage (Departure)</strong>
                <p>16.98° N, 82.24° E</p>
              </div>
            </Popup>
          </Marker>

          {/* Live PFZ Markers */}
          {displayPfzs.map((pfz) => (
            <Marker
              key={pfz.id || pfz.name}
              position={[pfz.latitude, pfz.longitude]}
              icon={pfzTargetIcon}
            >
              <Popup defaultOpen={pfz.id === 'PFZ-001'}>
                <div className="font-sans text-xs text-slate-900 space-y-2 p-1 min-w-[160px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <strong className="font-bold text-[#0F172A]">{pfz.name || pfz.id}</strong>
                    <span className="text-amber-600 font-bold">▲</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="font-semibold text-slate-900">{pfz.distanceKm || 31.8} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suitability:</span>
                      <span className="font-bold text-[#22C55E]">{pfz.score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => navigate('/safe-routes')}
                      className="flex-1 py-1 px-2 bg-[#00B4D8] hover:bg-[#0096B4] text-[#001F3F] font-bold text-[11px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Find Route</span>
                    </button>
                    <button
                      onClick={() => navigate('/pfz-explorer')}
                      className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] rounded border border-slate-300 transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 left-4 z-[1000]">
          <MapToolToolbar
            onZoomIn={() => {}}
            onZoomOut={() => {}}
            onRecenter={() => {}}
            toggleRisk={() => setShowRisk(!showRisk)}
            toggleRoute={() => setShowRoute(!showRoute)}
            showRisk={showRisk}
            showRoute={showRoute}
          />
        </div>

        <div className="absolute top-4 right-4 z-[1000]">
          <MarineIntelligenceHUD onGeneratePrediction={() => navigate('/safety-risk')} />
        </div>

        <div className="absolute bottom-4 left-4 z-[1000]">
          <MapLegendWidget />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3.5 py-1 rounded-full text-[11px] font-mono text-slate-700 border border-[#E2E8F0] shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>{isAnyFallback ? 'Offline Fallback Sync Active' : 'Live Express GIS Sync: Active'}</span>
        </div>
      </div>
    </div>
  );
}
