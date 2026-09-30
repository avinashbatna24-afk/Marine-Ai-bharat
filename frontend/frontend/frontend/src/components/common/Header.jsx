import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  RotateCw, 
  User,
  PanelLeft,
  Menu
} from 'lucide-react';

export default function Header({ onAskAIClick, onEmergencyClick, onToggleMobileMenu, isSidebarCollapsed }) {
  const [location, setLocation] = useState('Kakinada Coast');
  const [language, setLanguage] = useState('EN');
  const [dataMode, setDataMode] = useState('Real-time Data');
  const [lastSync, setLastSync] = useState('12 min ago');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Just now');
    }, 800);
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* SIDEBAR OPEN/CLOSE TOGGLE BUTTON */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 text-xs text-[#475569]">
          {/* LOCATION SELECTOR */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <MapPin className="w-4 h-4 text-[#1363DF]" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent font-semibold text-[#0F172A] focus:outline-none cursor-pointer text-xs"
            >
              <option value="Kakinada Coast">Kakinada Coast</option>
              <option value="Vizag Offshore">Vizag Offshore</option>
              <option value="Machilipatnam">Machilipatnam</option>
              <option value="Chennai Port">Chennai Port</option>
            </select>
          </div>

          {/* TIMESTAMP SYNC */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {lastSync}</span>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="hidden sm:flex items-center gap-1 text-slate-600 font-medium font-mono cursor-pointer hover:text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-xs"
            >
              <option value="EN">EN</option>
              <option value="TE">TE (తెలుగు)</option>
              <option value="TA">TA (தமிழ்)</option>
              <option value="HI">HI (हिन्दी)</option>
            </select>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-full">
            {location}
          </span>
          <select
            value={dataMode}
            onChange={(e) => setDataMode(e.target.value)}
            className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-full cursor-pointer focus:outline-none"
          >
            <option value="Real-time Data">Real-time Data</option>
            <option value="Cached Satellite">Cached Satellite</option>
            <option value="Historical Replay">Historical Replay</option>
          </select>
        </div>

        {/* ASK AI CYAN ACTION BUTTON */}
        <button
          onClick={onAskAIClick}
          className="flex items-center gap-1.5 bg-[#00B4D8] hover:bg-[#0096B4] text-[#001F3F] font-bold text-xs px-3 md:px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Ask AI</span>
          <span className="sm:hidden">Ask AI</span>
        </button>

        {/* EMERGENCY CRIMSON BUTTON */}
        <button
          onClick={onEmergencyClick}
          className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs px-3 md:px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Emergency</span>
        </button>

        {/* REFRESH ICON BUTTON */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200 hidden sm:block"
          title="Refresh Marine Data"
        >
          <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#1363DF]' : ''}`} />
        </button>

        {/* USER PROFILE ICON BUTTON */}
        <button className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
