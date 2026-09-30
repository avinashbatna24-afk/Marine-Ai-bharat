import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus, Target, Shield, Cloud, Bell, Fish, Hexagon } from 'lucide-react';

export default function SpatialIntelligenceMap({ pfzs, location, isLoading, isFallback }) {
  const [layers, setLayers] = useState({
    pfz: true,
    risk: true,
    weather: true,
    alerts: true,
    geofences: true,
  });

  const centerLat = location?.lat || 16.92;
  const centerLon = location?.lon || 82.38;

  // Custom vessel marker icon
  const vesselIcon = useMemo(() => L.divIcon({
    className: 'vessel-marker',
    html: `<div style="background-color: #00B4D8; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(0,180,216,0.9);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }), []);

  // Custom PFZ green marker icon builder
  const createPfzIcon = useMemo(() => (label, score) => L.divIcon({
    className: 'pfz-marker-badge',
    html: `<div style="display: flex; align-items: center; gap: 4px; background: rgba(6, 24, 40, 0.9); border: 1.5px solid #22C55E; color: white; padding: 2px 8px; border-radius: 8px; font-family: monospace; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
      ${label} <span style="color: #4ADE80">${score}</span>
    </div>`,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  }), []);

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Restricted Zone coordinates
  const restrictedZoneCoords = [
    [16.88, 82.28],
    [16.92, 82.38],
    [16.82, 82.42],
    [16.78, 82.32],
  ];

  // Route path coordinates
  const routePoints = [
    [16.98, 82.24], // Kakinada Vessel
    [17.06, 82.48], // PFZ-03
  ];

  const secondaryRoutePoints = [
    [16.98, 82.24],
    [16.72, 82.28], // PFZ-02
    [16.88, 82.58], // PFZ-01
  ];

  const displayPfzs = (pfzs && pfzs.length > 0) ? pfzs : [
    { id: 'PFZ-03', name: 'PFZ-03 (High Potential)', latitude: 17.06, longitude: 82.48, score: 92, distanceKm: 18.4 },
    { id: 'PFZ-02', name: 'PFZ-02', latitude: 16.72, longitude: 82.28, score: 85, distanceKm: 35.1 },
    { id: 'PFZ-01', name: 'PFZ-01', latitude: 16.88, longitude: 82.58, score: 68, distanceKm: 24.5 }
  ];

  return (
    <div className="bg-[#04111D] rounded-xl border border-slate-800 shadow-card overflow-hidden flex flex-col h-[540px]">
      {/* INTACT HEADER TOGGLE CONTROL BAR */}
      <div className="p-3 bg-[#04111D] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* PFZ TOGGLE */}
          <button
            onClick={() => toggleLayer('pfz')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              layers.pfz
                ? 'bg-slate-800 text-white border-emerald-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Fish className="w-3.5 h-3.5 text-emerald-400" />
            <span>PFZ</span>
            <div className={`w-7 h-3.5 rounded-full transition-colors relative flex items-center p-0.5 ${layers.pfz ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform transform ${layers.pfz ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* RISK TOGGLE */}
          <button
            onClick={() => toggleLayer('risk')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              layers.risk
                ? 'bg-slate-800 text-white border-rose-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Risk</span>
            <div className={`w-7 h-3.5 rounded-full transition-colors relative flex items-center p-0.5 ${layers.risk ? 'bg-rose-500' : 'bg-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform transform ${layers.risk ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* WEATHER TOGGLE */}
          <button
            onClick={() => toggleLayer('weather')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              layers.weather
                ? 'bg-slate-800 text-white border-sky-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Weather</span>
            <div className={`w-7 h-3.5 rounded-full transition-colors relative flex items-center p-0.5 ${layers.weather ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform transform ${layers.weather ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* ALERTS TOGGLE */}
          <button
            onClick={() => toggleLayer('alerts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              layers.alerts
                ? 'bg-slate-800 text-white border-amber-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Alerts</span>
            <div className={`w-7 h-3.5 rounded-full transition-colors relative flex items-center p-0.5 ${layers.alerts ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform transform ${layers.alerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* GEOFENCES TOGGLE */}
          <button
            onClick={() => toggleLayer('geofences')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              layers.geofences
                ? 'bg-slate-800 text-white border-cyan-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Geofences</span>
            <div className={`w-7 h-3.5 rounded-full transition-colors relative flex items-center p-0.5 ${layers.geofences ? 'bg-emerald-500' : 'bg-slate-700'}`}>
              <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform transform ${layers.geofences ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {isFallback && (
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
            Demo Map Layer
          </span>
        )}
      </div>

      {/* MAP CONTAINER */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={10}
          zoomControl={false}
          scrollWheelZoom={false}
          className="w-full h-full bg-[#030d16]"
        >
          {/* Dark Esri Satellite Map Tile */}
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Restricted Zone Polygon */}
          {layers.geofences && (
            <Polygon
              positions={restrictedZoneCoords}
              pathOptions={{
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '6, 6'
              }}
            >
              <Popup>
                <div className="p-1 font-mono text-xs text-rose-500 font-bold">
                  Restricted Zone - No Fishing Allowed
                </div>
              </Popup>
            </Polygon>
          )}

          {/* Primary Route Line to PFZ-03 */}
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#38BDF8',
              weight: 2.5,
              dashArray: '8, 8',
              opacity: 0.9
            }}
          />

          {/* Secondary Route Line to PFZ-02 & PFZ-01 */}
          <Polyline
            positions={secondaryRoutePoints}
            pathOptions={{
              color: '#22C55E',
              weight: 2,
              dashArray: '6, 6',
              opacity: 0.8
            }}
          />

          {/* Vessel Location (Kakinada) */}
          <Marker position={[16.98, 82.24]} icon={vesselIcon}>
            <Popup>
              <div className="font-mono text-xs p-1">
                <strong>Vessel Location: Kakinada</strong>
                <p className="text-slate-400">16.98° N, 82.24° E</p>
              </div>
            </Popup>
          </Marker>

          {/* PFZ Markers */}
          {layers.pfz && displayPfzs.map((pfzItem) => (
            <Marker
              key={pfzItem.id || pfzItem.name}
              position={[pfzItem.latitude, pfzItem.longitude]}
              icon={createPfzIcon(pfzItem.id || 'PFZ', `${pfzItem.score}%`)}
            >
              <Popup>
                <div className="font-mono text-xs p-1">
                  <strong className="text-emerald-400">{pfzItem.name || pfzItem.id}</strong>
                  <p>Suitability: {pfzItem.score}% | Distance: {pfzItem.distanceKm} km</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* MAP ROUTE DISTANCE BADGE */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#04111D]/90 border border-slate-700 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-200 shadow-md">
          18.4 km
        </div>

        {/* RESTRICTED ZONE OVERLAY LABEL */}
        <div className="absolute bottom-1/2 left-1/3 z-[1000] text-center pointer-events-none">
          <div className="text-xs font-mono font-bold text-rose-400 bg-rose-950/70 border border-rose-600/40 px-2 py-0.5 rounded shadow">
            Restricted Zone
          </div>
        </div>

        {/* BOTTOM RIGHT MAP CONTROLS & SCALE BAR */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
          <div className="flex flex-col gap-1 bg-[#04111D]/90 p-1 rounded-xl border border-slate-800 shadow-lg">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              <Minus className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#00B4D8] hover:bg-slate-800 transition-all cursor-pointer border-t border-slate-800 pt-1">
              <Target className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#00B4D8] font-mono text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer">
              3D
            </button>
          </div>

          <div className="bg-[#04111D]/90 border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <div className="w-12 h-0.5 bg-slate-400 relative">
              <div className="absolute -top-1 left-0 w-0.5 h-2 bg-slate-400"></div>
              <div className="absolute -top-1 right-0 w-0.5 h-2 bg-slate-400"></div>
            </div>
            <span>20 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
