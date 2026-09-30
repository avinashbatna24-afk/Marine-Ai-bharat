import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Route, 
  CloudSun,
  Bell, 
  ShieldAlert, 
  Hexagon,
  FileText,
  Settings,
  MapPin,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X 
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/marine-map', label: 'GIS Map', icon: Map },
  { path: '/pfz-explorer', label: 'PFZ Explorer', icon: Compass },
  { path: '/safe-routes', label: 'Route Planner', icon: Route },
  { path: '/weather', label: 'Weather', icon: CloudSun },
  { path: '/alerts', label: 'Alerts', icon: Bell, badge: '2' },
  { path: '/safety-risk', label: 'Risk Analysis', icon: ShieldAlert },
  { path: '/geofences', label: 'Geofences', icon: Hexagon },
  { path: '/reports', label: 'Reports', icon: FileText },
];

const PRESET_LOCATIONS = [
  { name: 'Bay of Bengal, India', coords: '16.9241° N, 80.1985° E', zone: 'Kakinada Offshore' },
  { name: 'Visakhapatnam Port', coords: '17.6868° N, 83.2185° E', zone: 'Vizag Offshore' },
  { name: 'Machilipatnam Coast', coords: '16.1824° N, 81.1378° E', zone: 'Machilipatnam' },
  { name: 'Chennai Port Outer', coords: '13.0827° N, 80.2707° E', zone: 'Chennai Port' },
  { name: 'Kalingapatnam Deep Sea', coords: '18.3377° N, 84.1264° E', zone: 'Srikakulam Coast' }
];

export default function Sidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapse }) {
  const [currentLocation, setCurrentLocation] = useState(PRESET_LOCATIONS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCoords, setCustomCoords] = useState('');

  const handleSelectPreset = (loc) => {
    setCurrentLocation(loc);
    setIsLocationModalOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customCoords.trim()) return;
    setCurrentLocation({
      name: customName,
      coords: customCoords,
      zone: 'Custom Coordinates'
    });
    setIsLocationModalOpen(false);
    setCustomName('');
    setCustomCoords('');
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER WITH DYNAMIC WIDTH */}
      <aside
        className={`bg-[#04111D] text-slate-300 flex flex-col justify-between h-screen fixed lg:sticky top-0 border-r border-slate-800/60 z-50 select-none transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* BRAND & TOP HEADER SECTION */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="Marine AI Logo" className="w-9 h-9 object-contain shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-sans font-extrabold text-lg text-white tracking-tight leading-tight">
                    Marine AI
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium leading-tight truncate mt-0.5">
                    Marine Intelligence Copilot
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto" title="Marine AI">
                <img src={logoImg} alt="Marine AI Logo" className="w-9 h-9 object-contain" />
              </div>
            )}

            {/* COLLAPSE TOGGLE / MOBILE CLOSE BUTTON */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#1363DF] text-white shadow-md font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <NavLink
              to="/settings"
              onClick={onCloseMobile}
              title={collapsed ? "Settings" : undefined}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1363DF] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </nav>
        </div>

        {/* MY LOCATION CARD AT BOTTOM */}
        <div className="p-3 border-t border-slate-800/80 bg-[#061828]">
          {collapsed ? (
            <div 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex justify-center p-1 text-[#00B4D8] cursor-pointer hover:text-white transition-colors" 
              title={`${currentLocation.coords} - ${currentLocation.name}`}
            >
              <MapPin className="w-5 h-5" />
            </div>
          ) : (
            <div className="bg-[#0A2239] border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#00B4D8]" />
                  <span>My Location</span>
                </div>
                <button 
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Change Location"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[11px] font-mono text-slate-300 leading-snug">
                {currentLocation.coords}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentLocation.name}
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full mt-1 py-1.5 px-2 bg-[#1363DF]/20 hover:bg-[#1363DF]/30 text-[#00B4D8] border border-[#1363DF]/40 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
              >
                Change Location
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* CHANGE LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#0A2239] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 text-white space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00B4D8]" />
                <h3 className="font-bold text-sm text-white">Change Active Vessel Location</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRESET LOCATION OPTIONS */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">Select Coastal Station / Preset:</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleSelectPreset(loc)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      currentLocation.name === loc.name
                        ? 'bg-[#1363DF]/30 border-[#1363DF] text-white font-semibold'
                        : 'bg-[#04111D] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{loc.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{loc.coords}</div>
                    </div>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {loc.zone}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM COORDINATES FORM */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 space-y-3 text-xs">
              <p className="text-xs font-semibold text-slate-300">Or enter Custom Location:</p>
              <div>
                <input
                  type="text"
                  placeholder="Location Name (e.g. Bay of Bengal Sector 4)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#04111D] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Coordinates (e.g. 16.9500° N, 82.3000° E)"
                  value={customCoords}
                  onChange={(e) => setCustomCoords(e.target.value)}
                  className="w-full bg-[#04111D] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#1363DF] hover:bg-[#0D4EB3] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Set Custom Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
