import React from 'react';
import { CheckCircle2, RotateCw } from 'lucide-react';

export default function ProcessingPipeline() {
  const steps = [
    'Understanding request',
    'Checking weather',
    'Checking ocean conditions',
    'Finding suitable PFZ',
    'Assessing marine risk',
    'Checking restricted zones',
    'Optimizing safe route'
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 max-w-md shadow-xs">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1363DF] border-b border-slate-200 pb-2">
        <RotateCw className="w-3.5 h-3.5 animate-spin" />
        <span>Processing Request</span>
      </div>

      <div className="space-y-1.5 text-xs font-mono text-slate-600">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
