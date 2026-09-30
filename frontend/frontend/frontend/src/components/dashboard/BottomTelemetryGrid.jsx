import React from 'react';
import { Wind, Waves, Thermometer, Leaf, Compass, Eye, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BottomTelemetryGrid({ telemetry, alertsCount, isFallback, isLoading }) {
  const navigate = useNavigate();

  const windSpeed = telemetry?.wind?.speed ?? 14;
  const windDir = telemetry?.wind?.direction || 'NE';
  const windLabel = telemetry?.wind?.label || 'Moderate';

  const waveHeight = telemetry?.waves?.height ?? 1.2;
  const waveLabel = telemetry?.waves?.label || 'Moderate';

  const sstValue = telemetry?.sst?.value ?? 28.4;
  const sstLabel = telemetry?.sst?.label || 'Normal';

  const chlaValue = telemetry?.chlorophyll?.value ?? 2.8;
  const chlaLabel = telemetry?.chlorophyll?.label || 'High';

  const currentSpeed = telemetry?.current?.speed ?? 0.6;
  const currentDir = telemetry?.current?.direction || 'NE';
  const currentLabel = telemetry?.current?.label || 'Moderate';

  const visValue = telemetry?.visibility?.value ?? 10;
  const visLabel = telemetry?.visibility?.label || 'Good';

  const countAlerts = alertsCount ?? 2;

  return (
    <div className="space-y-1.5">
      {isFallback && (
        <div className="flex justify-end">
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
            Demo Data (Offline Fallback)
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. WIND CARD */}
        <div className="bg-[#04111D] rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Wind className="w-4 h-4 text-[#00B4D8]" />
            <span>Wind</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {isLoading ? '...' : windSpeed} <span className="text-xs font-semibold text-slate-400">kt {windDir}</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-400 mt-1">
              {windLabel}
            </div>
          </div>
        </div>

        {/* 2. WAVES CARD */}
        <div className="bg-[#04111D] rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Waves className="w-4 h-4 text-[#00B4D8]" />
            <span>Waves</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {isLoading ? '...' : waveHeight} <span className="text-xs font-semibold text-slate-400">m</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-400 mt-1">
              {waveLabel}
            </div>
          </div>
        </div>

        {/* 3. SST CARD */}
        <div className="bg-[#04111D] rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Thermometer className="w-4 h-4 text-rose-400" />
            <span>SST</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {isLoading ? '...' : sstValue} <span className="text-xs font-semibold text-slate-400">°C</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
              {sstLabel}
            </div>
          </div>
        </div>

        {/* 4. CHLOROPHYLL CARD */}
        <div className="bg-[#04111D] rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Chlorophyll</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {isLoading ? '...' : chlaValue} <span className="text-xs font-semibold text-slate-400">mg/m³</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
              {chlaLabel}
            </div>
          </div>
        </div>

        {/* 5. CURRENT CARD */}
        <div className="bg-[#04111D] rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Compass className="w-4 h-4 text-[#00B4D8]" />
            <span>Current</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {isLoading ? '...' : currentSpeed} <span className="text-xs font-semibold text-slate-400">m/s {currentDir}</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-400 mt-1">
              {currentLabel}
            </div>
          </div>
        </div>

        {/* 6. VISIBILITY CARD */}
        <div className="bg-[#04111D] rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Visibility</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-white tracking-tight">
              {isLoading ? '...' : visValue} <span className="text-xs font-semibold text-slate-400">km</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
              {visLabel}
            </div>
          </div>
        </div>

        {/* 7. ACTIVE ALERTS CARD */}
        <div 
          onClick={() => navigate('/alerts')}
          className="bg-[#0A2239] rounded-xl border border-rose-500/30 p-3.5 flex flex-col justify-between shadow-md hover:border-rose-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Active Alerts</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-2xl font-mono font-extrabold text-rose-500 leading-none">
              {isLoading ? '...' : countAlerts}
            </div>
            <div className="text-[11px] font-mono font-semibold text-[#00B4D8] group-hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
