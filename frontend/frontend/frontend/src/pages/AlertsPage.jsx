import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  CloudRain, 
  Wind, 
  Waves, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Filter,
  RefreshCw,
  Bell,
  ShieldAlert
} from 'lucide-react';
import { getAlerts, getActiveWarnings, evaluateAlerts } from '../api/alertsApi';
import { adaptAlertModel, adaptWarningsModel } from '../api/adapters';

const FALLBACK_INITIAL_ALERTS = [
  {
    id: 'alt-1',
    title: 'High Wind Speed Detected',
    description: 'Sustained wind speed of 32 kt detected in your current area.',
    location: 'Bay of Bengal, India',
    timestamp: '10:20 AM IST',
    severity: 'Critical',
    icon: Wind
  },
  {
    id: 'alt-2',
    title: 'Cyclone Activity Nearby',
    description: 'Cyclone "Mocha" is 120 km away from your location.',
    location: 'Bay of Bengal, India',
    timestamp: '09:45 AM IST',
    severity: 'High',
    icon: RefreshCw
  },
  {
    id: 'alt-3',
    title: 'High Wave Height',
    description: 'Wave height of 4.5 m detected in your area.',
    location: 'Bay of Bengal, India',
    timestamp: '08:30 AM IST',
    severity: 'Medium',
    icon: Waves
  },
  {
    id: 'alt-4',
    title: 'Heavy Rainfall Expected',
    description: 'Heavy rainfall expected in the next 6 hours.',
    location: 'Bay of Bengal, India',
    timestamp: '07:15 AM IST',
    severity: 'Low',
    icon: CloudRain
  },
  {
    id: 'alt-5',
    title: 'System Update',
    description: 'New weather model data is now available.',
    location: 'Bay of Bengal, India',
    timestamp: 'Yesterday, 11:30 PM',
    severity: 'Info',
    icon: Info
  },
  {
    id: 'alt-6',
    title: 'Geofence Boundary Warning',
    description: 'Vessel approach within 1.5 nm of Restricted Firing Zone B.',
    location: 'Kakinada Offshore Sector',
    timestamp: 'Yesterday, 09:15 PM',
    severity: 'Critical',
    icon: AlertTriangle
  },
  {
    id: 'alt-7',
    title: 'PFZ Advisory Released',
    description: 'INCOIS Chlorophyll-a satellite telemetry updated for PFZ-03.',
    location: 'Godavari Outer Plume',
    timestamp: 'Yesterday, 06:40 PM',
    severity: 'Info',
    icon: CheckCircle2
  },
  {
    id: 'alt-8',
    title: 'Squall Line Formation',
    description: 'Convective storm cloud formation detected north-east.',
    location: 'Vizag Deep Sea Fairway',
    timestamp: 'May 18, 2025 04:20 PM',
    severity: 'High',
    icon: Wind
  },
  {
    id: 'alt-9',
    title: 'Low Sea Surface Pressure',
    description: 'Barometric pressure dropped to 998 hPa rapidly.',
    location: 'Coromandel Basin',
    timestamp: 'May 18, 2025 02:00 PM',
    severity: 'Medium',
    icon: AlertTriangle
  },
  {
    id: 'alt-10',
    title: 'Navigational Light Beacon Fault',
    description: 'Machilipatnam outer fairway buoy #4 signal lost.',
    location: 'Machilipatnam Approach',
    timestamp: 'May 17, 2025 11:10 AM',
    severity: 'Low',
    icon: Info
  }
];

export default function AlertsPage() {
  const [alertsState, setAlertsState] = useState({
    alerts: FALLBACK_INITIAL_ALERTS,
    isLoading: true,
    isFallback: false,
    error: null
  });
  const [warningsState, setWarningsState] = useState({
    warnings: [],
    isLoading: true,
    isFallback: false,
    error: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Alerts');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Load Alerts & Warnings from Centralized API Layer
  const loadAlertData = async (isMounted = true) => {
    const locationParams = { lat: 16.9241, lon: 80.1985 };

    // 1. Fetch Active Alerts
    try {
      const alertsRes = await getAlerts();
      if (!isMounted) return;
      
      let liveList = alertsRes.data || [];

      // Also evaluate telemetry alerts if live engine is available
      try {
        const evalRes = await evaluateAlerts({
          latitude: 16.9241,
          longitude: 80.1985,
          windSpeed: 28,
          waveHeight: 3.5
        });
        if (evalRes.data && evalRes.data.length > 0) {
          // Merge evaluated alerts without duplicating IDs
          const existingIds = new Set(liveList.map(a => a.id));
          evalRes.data.forEach(item => {
            if (!existingIds.has(item.id)) {
              liveList.push(item);
            }
          });
        }
      } catch (e) {
        // Silent evaluation fallback
      }

      // If live API succeeds, retain live alerts list (even if empty)
      if (!alertsRes.isFallback) {
        setAlertsState({
          alerts: liveList,
          isLoading: false,
          isFallback: false,
          error: null
        });
      } else {
        setAlertsState({
          alerts: FALLBACK_INITIAL_ALERTS,
          isLoading: false,
          isFallback: true,
          error: alertsRes.error
        });
      }
    } catch (err) {
      if (!isMounted) return;
      setAlertsState({
        alerts: FALLBACK_INITIAL_ALERTS,
        isLoading: false,
        isFallback: true,
        error: err
      });
    }

    // 2. Fetch IMD Marine Warnings
    try {
      const warnRes = await getActiveWarnings(locationParams);
      if (!isMounted) return;
      const adaptedWarn = adaptWarningsModel(warnRes.data);

      setWarningsState({
        warnings: adaptedWarn.warnings || [],
        isLoading: false,
        isFallback: !!warnRes.isFallback,
        error: warnRes.error
      });
    } catch (err) {
      if (!isMounted) return;
      setWarningsState({
        warnings: [],
        isLoading: false,
        isFallback: true,
        error: err
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadAlertData(isMounted);
    return () => { isMounted = false; };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlertData(true);
    setIsRefreshing(false);
  };

  const alerts = alertsState.alerts || FALLBACK_INITIAL_ALERTS;
  const isFallbackActive = alertsState.isFallback || warningsState.isFallback;

  // Dynamic Counts Calculation
  const criticalCount = useMemo(() => alerts.filter((a) => a.severity === 'Critical').length, [alerts]);
  const highCount = useMemo(() => alerts.filter((a) => a.severity === 'High').length, [alerts]);
  const mediumCount = useMemo(() => alerts.filter((a) => a.severity === 'Medium').length, [alerts]);
  const lowCount = useMemo(() => alerts.filter((a) => a.severity === 'Low' || a.severity === 'Info').length, [alerts]);
  const totalCount = alerts.length;

  // Filter Alerts
  const filteredAlerts = useMemo(() => {
    if (selectedFilter === 'All Alerts') return alerts;
    return alerts.filter((a) => a.severity === selectedFilter);
  }, [alerts, selectedFilter]);

  // Paginated Alerts
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAlerts.length / pageSize)), [filteredAlerts, pageSize]);
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage, pageSize]);

  // Helper for Icon Selection
  const getAlertIcon = (alert) => {
    if (alert.icon) return alert.icon;
    const title = (alert.title || '').toLowerCase();
    const desc = (alert.description || '').toLowerCase();
    if (title.includes('wind') || desc.includes('wind') || title.includes('squall')) return Wind;
    if (title.includes('wave') || desc.includes('wave') || title.includes('sea')) return Waves;
    if (title.includes('rain') || desc.includes('rain') || title.includes('precip')) return CloudRain;
    if (title.includes('cyclone') || title.includes('storm')) return RefreshCw;
    if (title.includes('geofence') || alert.severity === 'Critical') return AlertTriangle;
    if (title.includes('pfz') || title.includes('update')) return CheckCircle2;
    return Info;
  };

  // Helper for Severity Badges & Icon Styles
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          badge: 'bg-red-100 text-red-700 border border-red-200 font-bold',
          iconBg: 'bg-red-50 text-red-600 border border-red-200/60',
          leftBorder: 'border-l-4 border-l-red-500'
        };
      case 'High':
        return {
          badge: 'bg-orange-100 text-orange-700 border border-orange-200 font-bold',
          iconBg: 'bg-orange-50 text-orange-600 border border-orange-200/60',
          leftBorder: 'border-l-4 border-l-orange-500'
        };
      case 'Medium':
        return {
          badge: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] font-bold',
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
          leftBorder: 'border-l-4 border-l-amber-400'
        };
      case 'Low':
        return {
          badge: 'bg-blue-100 text-blue-700 border border-blue-200 font-bold',
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
          leftBorder: 'border-l-4 border-l-blue-500'
        };
      case 'Info':
      default:
        return {
          badge: 'bg-blue-50 text-blue-600 border border-blue-100 font-bold',
          iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
          leftBorder: 'border-l-4 border-l-slate-300'
        };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* PAGE HEADER & FILTER DROPDOWN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
              Alerts & Advisories
            </h1>
            {isFallbackActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Demo Data (Offline Fallback)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Data
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Stay updated with critical events, IMD warnings, and maritime safety notifications.
          </p>
        </div>

        {/* CONTROLS: REFRESH & FILTER DROPDOWN */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh & Evaluate Marine Alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1363DF] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-xl shadow-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-xs text-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="All Alerts">All Alerts</option>
              <option value="Critical">Critical Alerts</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
              <option value="Info">System Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* STAT CARDS ROW (5 STAT CARDS GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* CRITICAL */}
        <div
          onClick={() => { setSelectedFilter('Critical'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'Critical' ? 'bg-red-100/80 border-red-300 shadow-sm' : 'bg-red-50/60 border-red-200/70 hover:bg-red-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-red-700">{alertsState.isLoading ? '...' : criticalCount}</p>
              <p className="text-xs text-red-600 font-semibold">Critical</p>
            </div>
          </div>
        </div>

        {/* HIGH */}
        <div
          onClick={() => { setSelectedFilter('High'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'High' ? 'bg-orange-100/80 border-orange-300 shadow-sm' : 'bg-orange-50/60 border-orange-200/70 hover:bg-orange-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center shrink-0 border border-orange-200 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-orange-700">{alertsState.isLoading ? '...' : highCount}</p>
              <p className="text-xs text-orange-600 font-semibold">High</p>
            </div>
          </div>
        </div>

        {/* MEDIUM */}
        <div
          onClick={() => { setSelectedFilter('Medium'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'Medium' ? 'bg-amber-100/80 border-amber-300 shadow-sm' : 'bg-amber-50/60 border-amber-200/70 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-amber-700">{alertsState.isLoading ? '...' : mediumCount}</p>
              <p className="text-xs text-amber-600 font-semibold">Medium</p>
            </div>
          </div>
        </div>

        {/* LOW */}
        <div
          onClick={() => { setSelectedFilter('Low'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'Low' ? 'bg-blue-100/80 border-blue-300 shadow-sm' : 'bg-blue-50/60 border-blue-200/70 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-blue-700">{alertsState.isLoading ? '...' : lowCount}</p>
              <p className="text-xs text-blue-600 font-semibold">Low</p>
            </div>
          </div>
        </div>

        {/* ALL ALERTS */}
        <div
          onClick={() => { setSelectedFilter('All Alerts'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between col-span-2 sm:col-span-1 ${
            selectedFilter === 'All Alerts' ? 'bg-slate-200/80 border-slate-400 shadow-sm' : 'bg-slate-100/80 border-slate-200 hover:bg-slate-200/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-300 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-slate-800">{alertsState.isLoading ? '...' : totalCount}</p>
              <p className="text-xs text-slate-600 font-semibold">All Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT LIST CONTAINER CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-[#0F172A]">
            Active Marine Alert Console
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Filtered: {filteredAlerts.length} item{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ALERT ROWS LIST */}
        <div className="space-y-3">
          {paginatedAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No alerts found for this filter severity.
            </div>
          ) : (
            paginatedAlerts.map((alt) => {
              const styles = getSeverityStyle(alt.severity);
              const Icon = getAlertIcon(alt);
              return (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-2xs ${styles.leftBorder}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${styles.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs md:text-sm text-[#0F172A]">{alt.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{alt.description}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{alt.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="font-mono text-xs text-slate-500">{alt.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${styles.badge}`}>
                        {alt.severity}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-slate-500 border-t border-slate-100">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredAlerts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredAlerts.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredAlerts.length}</span> alerts
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#1363DF] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
