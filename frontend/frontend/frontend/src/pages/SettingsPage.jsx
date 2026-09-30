import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Ruler, 
  Map, 
  Database, 
  Users, 
  Code, 
  User, 
  Lock, 
  Globe, 
  Clock, 
  Calendar, 
  Layout, 
  RefreshCw, 
  Radio, 
  AlertCircle, 
  Check, 
  Save,
  Shield,
  Key,
  Anchor,
  Wind,
  Waves
} from 'lucide-react';

const SETTINGS_NAV = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'vessel', label: 'Vessel & Safety Thresholds', icon: Anchor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'units', label: 'Units & Measurement', icon: Ruler },
  { id: 'map', label: 'Map Preferences', icon: Map },
  { id: 'data', label: 'Data Preferences', icon: Database },
  { id: 'users', label: 'Users & Access', icon: Users },
  { id: 'api', label: 'API & Integrations', icon: Code },
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [savedNotice, setSavedNotice] = useState(false);

  // General Form States
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY (20 May 2025)');
  
  const [defaultDashboardView, setDefaultDashboardView] = useState('Overview');
  const [refreshInterval, setRefreshInterval] = useState('5 minutes');

  const [liveDataToggle, setLiveDataToggle] = useState(true);
  const [dataUpdateAlertsToggle, setDataUpdateAlertsToggle] = useState(true);
  const [dataRetention, setDataRetention] = useState('90 Days');

  // Vessel & Safety Risk Thresholds
  const [vesselType, setVesselType] = useState('Artisanal Trawler');
  const [vesselLength, setVesselLength] = useState('14.5 m');
  const [maxWaveTolerance, setMaxWaveTolerance] = useState('3.0 m');
  const [maxWindTolerance, setMaxWindTolerance] = useState('25 kt');

  // Additional tab states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [cycloneAlerts, setCycloneAlerts] = useState(true);
  const [speedUnit, setSpeedUnit] = useState('Knots (kts)');
  const [coordFormat, setCoordFormat] = useState('Decimal Degrees (DD)');

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marine_ai_user_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
        if (parsed.defaultDashboardView) setDefaultDashboardView(parsed.defaultDashboardView);
        if (parsed.refreshInterval) setRefreshInterval(parsed.refreshInterval);
        if (typeof parsed.liveDataToggle === 'boolean') setLiveDataToggle(parsed.liveDataToggle);
        if (typeof parsed.dataUpdateAlertsToggle === 'boolean') setDataUpdateAlertsToggle(parsed.dataUpdateAlertsToggle);
        if (parsed.dataRetention) setDataRetention(parsed.dataRetention);
        if (parsed.vesselType) setVesselType(parsed.vesselType);
        if (parsed.vesselLength) setVesselLength(parsed.vesselLength);
        if (parsed.maxWaveTolerance) setMaxWaveTolerance(parsed.maxWaveTolerance);
        if (parsed.maxWindTolerance) setMaxWindTolerance(parsed.maxWindTolerance);
        if (typeof parsed.emailAlerts === 'boolean') setEmailAlerts(parsed.emailAlerts);
        if (typeof parsed.smsAlerts === 'boolean') setSmsAlerts(parsed.smsAlerts);
        if (typeof parsed.cycloneAlerts === 'boolean') setCycloneAlerts(parsed.cycloneAlerts);
        if (parsed.speedUnit) setSpeedUnit(parsed.speedUnit);
        if (parsed.coordFormat) setCoordFormat(parsed.coordFormat);
      }
    } catch (e) {
      // LocalStorage unavailable fallback
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const settingsObj = {
      language,
      timezone,
      dateFormat,
      defaultDashboardView,
      refreshInterval,
      liveDataToggle,
      dataUpdateAlertsToggle,
      dataRetention,
      vesselType,
      vesselLength,
      maxWaveTolerance,
      maxWindTolerance,
      emailAlerts,
      smsAlerts,
      cycloneAlerts,
      speedUnit,
      coordFormat,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('marine_ai_user_settings', JSON.stringify(settingsObj));
    } catch (e) {}

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage your operational preferences, safety risk parameters, notifications, and navigation units.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3.5 py-2 rounded-lg font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* SETTINGS LAYOUT: LEFT SUB-SIDEBAR + RIGHT CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SUB-SIDEBAR TABS */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] shadow-card p-2 space-y-1">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-[#1363DF] font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1363DF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT WORKSPACE AREA */}
        <div className="lg:col-span-9 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* GENERAL TAB CONTENT */}
            {activeTab === 'general' && (
              <>
                {/* SECTION 1: GENERAL PREFERENCES */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                    General Preferences
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* LANGUAGE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span>Language</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Select your preferred interface language</p>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                      </select>
                    </div>

                    {/* TIMEZONE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>Timezone</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Select your operating timezone</p>
                      </div>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                        <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                        <option value="(GMT+08:00) Asia/Singapore">(GMT+08:00) Asia/Singapore</option>
                      </select>
                    </div>

                    {/* DATE FORMAT */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>Date Format</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Choose how dates are displayed</p>
                      </div>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="DD MMM YYYY (20 May 2025)">DD MMM YYYY (20 May 2025)</option>
                        <option value="YYYY-MM-DD (2025-05-20)">YYYY-MM-DD (2025-05-20)</option>
                        <option value="MM/DD/YYYY (05/20/2025)">MM/DD/YYYY (05/20/2025)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DASHBOARD PREFERENCES */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                    Dashboard Preferences
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* DEFAULT DASHBOARD VIEW */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Layout className="w-4 h-4 text-slate-500" />
                          <span>Default Dashboard View</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Choose your default landing page</p>
                      </div>
                      <select
                        value={defaultDashboardView}
                        onChange={(e) => setDefaultDashboardView(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer"
                      >
                        <option value="Overview">Overview</option>
                        <option value="Map">GIS Map</option>
                        <option value="PFZ Explorer">PFZ Explorer</option>
                        <option value="Route Planner">Route Planner</option>
                      </select>
                    </div>

                    {/* REFRESH INTERVAL */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <RefreshCw className="w-4 h-4 text-slate-500" />
                          <span>Refresh Interval</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Auto-refresh live telemetry</p>
                      </div>
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="1 minute">1 minute (High Frequency)</option>
                        <option value="5 minutes">5 minutes</option>
                        <option value="15 minutes">15 minutes</option>
                        <option value="Manual">Manual Refresh Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DATA PREFERENCES */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                    Data Preferences
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* LIVE DATA TOGGLE */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Radio className="w-4 h-4 text-slate-500" />
                          <span>Live Data Connection</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Enable or disable Express backend live telemetry</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLiveDataToggle(!liveDataToggle)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          liveDataToggle ? 'bg-[#1363DF]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            liveDataToggle ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* DATA UPDATE ALERTS TOGGLE */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <AlertCircle className="w-4 h-4 text-slate-500" />
                          <span>Data Update Notifications</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Get notified when new satellite SST/PFZ data is ingested</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDataUpdateAlertsToggle(!dataUpdateAlertsToggle)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          dataUpdateAlertsToggle ? 'bg-[#1363DF]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            dataUpdateAlertsToggle ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* DATA RETENTION */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Database className="w-4 h-4 text-slate-500" />
                          <span>Data Retention</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Choose how long local telemetry history is stored</p>
                      </div>
                      <select
                        value={dataRetention}
                        onChange={(e) => setDataRetention(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                        <option value="180 Days">180 Days</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VESSEL & SAFETY RISK THRESHOLDS TAB */}
            {activeTab === 'vessel' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Vessel Specification & Safety Risk Parameters
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">Vessel Class</p>
                      <p className="text-slate-400 text-[11px]">Primary craft specification used for risk calculations</p>
                    </div>
                    <select
                      value={vesselType}
                      onChange={(e) => setVesselType(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Artisanal Trawler">Artisanal Trawler (Motorized)</option>
                      <option value="Deep Sea Gillnetter">Deep Sea Gillnetter</option>
                      <option value="Mechanized Purse Seiner">Mechanized Purse Seiner</option>
                      <option value="Coastal Patrol Craft">Coastal Patrol Craft</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Maximum Wave Height Tolerance</p>
                      <p className="text-slate-400 text-[11px]">Swell threshold before risk engine triggers Severe status</p>
                    </div>
                    <select
                      value={maxWaveTolerance}
                      onChange={(e) => setMaxWaveTolerance(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="1.5 m">1.5 m (Cautious)</option>
                      <option value="2.5 m">2.5 m (Standard)</option>
                      <option value="3.0 m">3.0 m (Moderate)</option>
                      <option value="4.0 m">4.0 m (Heavy Sea)</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Maximum Wind Speed Tolerance</p>
                      <p className="text-slate-400 text-[11px]">Wind gust limit for safe fishing operations</p>
                    </div>
                    <select
                      value={maxWindTolerance}
                      onChange={(e) => setMaxWindTolerance(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="15 kt">15 kt (Light)</option>
                      <option value="20 kt">20 kt (Moderate)</option>
                      <option value="25 kt">25 kt (Standard Trawler)</option>
                      <option value="35 kt">35 kt (Heavy Craft)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Notification Dispatch Controls
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">High Swell & Cyclone Push Alerts</p>
                      <p className="text-slate-400 text-[11px]">Instant emergency warnings for storm surges & rough sea states</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCycloneAlerts(!cycloneAlerts)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        cycloneAlerts ? 'bg-[#1363DF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${cycloneAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Email Daily Digest</p>
                      <p className="text-slate-400 text-[11px]">Receive daily PDF operational reports at 08:00 AM IST</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        emailAlerts ? 'bg-[#1363DF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* UNITS & MEASUREMENT TAB */}
            {activeTab === 'units' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Maritime Units & Navigation Metrics
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">Vessel Speed Units</p>
                      <p className="text-slate-400 text-[11px]">Calibration for ETA and speed logs</p>
                    </div>
                    <select
                      value={speedUnit}
                      onChange={(e) => setSpeedUnit(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="Knots (kts)">Knots (kts)</option>
                      <option value="Km/h">Kilometers / hour (km/h)</option>
                      <option value="Meters/sec">Meters / second (m/s)</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Coordinate Display Format</p>
                      <p className="text-slate-400 text-[11px]">Latitude and Longitude representation</p>
                    </div>
                    <select
                      value={coordFormat}
                      onChange={(e) => setCoordFormat(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="Decimal Degrees (DD)">Decimal Degrees (16.9241° N, 80.1985° E)</option>
                      <option value="Degrees Minutes Seconds (DMS)">Degrees Minutes Seconds (16° 55' 26" N)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER TABS FALLBACK GENERIC CARD */}
            {['map', 'data', 'users', 'api', 'account', 'security'].includes(activeTab) && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5 uppercase tracking-wider font-mono">
                  {SETTINGS_NAV.find(n => n.id === activeTab)?.label}
                </h2>
                <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-700">Active Operational Configuration</p>
                  <p className="max-w-md mx-auto text-slate-400">
                    Settings in this category are managed according to Indian Coast Guard & ISRO INCOIS telemetry standards.
                  </p>
                </div>
              </div>
            )}

            {/* BOTTOM SAVE CHANGES BUTTON */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#1363DF] hover:bg-[#0D4EB3] text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-blue-200" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
