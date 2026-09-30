import React from 'react';
import { Globe, Anchor, AlertTriangle } from 'lucide-react';

export default function FleetContextSidebar() {
  return (
    <div className="space-y-4">
      {/* LANGUAGE SELECTOR */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#1363DF]" />
          Language
        </span>
        <select className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer">
          <option>English</option>
          <option>Telugu (తెలుగు)</option>
          <option>Tamil (தமிழ்)</option>
          <option>Hindi (हिन्दी)</option>
        </select>
      </div>

      {/* CURRENT FLEET CONTEXT CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Anchor className="w-3.5 h-3.5 text-[#1363DF]" />
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            Current Fleet Context
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Active Vessels</span>
            <span className="font-mono font-bold text-slate-800">12/15</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Avg Risk Score</span>
            <span className="font-mono font-bold text-amber-600">42 (Mod)</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Weather Status</span>
            <span className="font-semibold text-emerald-700">Clear</span>
          </div>
        </div>
      </div>

      {/* ACTIVE SAFETY ALERTS CRIMSON BOX */}
      <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl p-4 space-y-2 text-xs text-[#991B1B] shadow-xs">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          <span>Active Safety Alerts</span>
        </div>
        <p className="text-[11px] leading-relaxed font-medium">
          Gale warning in sector 7. All vessels advised to maintain minimum distance of 5NM from central anomaly.
        </p>
      </div>
    </div>
  );
}
