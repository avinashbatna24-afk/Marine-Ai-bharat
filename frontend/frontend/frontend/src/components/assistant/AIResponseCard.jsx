import React from 'react';
import { Bot, Compass, Route, ShieldCheck, Map } from 'lucide-react';

export default function AIResponseCard({ onViewAnalysis, onShowRoute }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
      {/* SUMMARY HEADER */}
      <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 rounded-lg bg-[#001F3F] border border-[#00B4D8]/40 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-[#00B4D8]" />
        </div>
        <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
          Tomorrow morning's conditions are <strong className="text-amber-600 font-bold">MODERATE</strong>. A suitable PFZ was found <strong className="font-semibold text-slate-900">31.8 km</strong> southeast of your current location. The recommended route avoids high-risk and restricted areas.
        </p>
      </div>

      {/* 2X2 METRIC SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* CARD 1: RISK LEVEL */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center font-bold text-[#0F172A] shrink-0 font-mono">
            40
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Risk Level</span>
            <span className="font-bold text-amber-600">Moderate</span>
          </div>
        </div>

        {/* CARD 2: NEAREST PFZ */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1363DF]/10 text-[#1363DF] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Nearest PFZ</span>
            <span className="font-bold text-slate-800 font-mono">31.8 km</span>
          </div>
        </div>

        {/* CARD 3: ROUTE DISTANCE */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1363DF]/10 text-[#1363DF] flex items-center justify-center shrink-0">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Route Distance</span>
            <span className="font-bold text-slate-800 font-mono">36.4 km</span>
          </div>
        </div>

        {/* CARD 4: ROUTE RISK */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#22C55E] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Route Risk</span>
            <span className="font-bold text-[#22C55E]">Low</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onViewAnalysis}
          className="px-4 py-2 bg-[#06283D] hover:bg-[#04111D] text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
        >
          View Full Analysis
        </button>

        <button
          onClick={onShowRoute}
          className="px-4 py-2 bg-white border border-[#1363DF]/40 text-[#1363DF] hover:bg-[#1363DF]/5 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Map className="w-3.5 h-3.5" />
          <span>Show Route on Map</span>
        </button>
      </div>
    </div>
  );
}
