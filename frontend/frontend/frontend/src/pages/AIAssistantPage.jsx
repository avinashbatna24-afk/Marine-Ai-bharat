import React, { useState } from 'react';
import ProcessingPipeline from '../components/assistant/ProcessingPipeline';
import AIResponseCard from '../components/assistant/AIResponseCard';
import FleetContextSidebar from '../components/assistant/FleetContextSidebar';
import { Send, Mic, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeMarineQuery } from '../api/aiApi';

export default function AIAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'user',
      text: 'Can I go fishing tomorrow morning, where is the nearest suitable PFZ, and what is the safest route?'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const userQuery = inputText.trim();
    const userMsg = { id: Date.now(), type: 'user', text: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      await analyzeMarineQuery({
        query: userQuery,
        userLocation: { latitude: 16.98, longitude: 82.24 }
      });
    } catch {
      // Safe fallback handled in service
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickChip = (chipText) => {
    setInputText(`Tell me about ${chipText.toLowerCase()} for Kakinada Coast`);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
          Marine AI Assistant
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Ask questions about weather, ocean conditions, PFZs, safety and routes.
        </p>
      </div>

      {/* 2-COLUMN MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT MAIN CHAT COLUMN (8/12 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CHAT STREAM CONTAINER */}
          <div className="space-y-6 min-h-[420px]">
            {/* USER MESSAGE BUBBLE */}
            <div className="flex justify-end">
              <div className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-4 py-3 rounded-xl shadow-xs max-w-[85%] font-medium leading-relaxed">
                Can I go fishing tomorrow morning, where is the nearest suitable PFZ, and what is the safest route?
              </div>
            </div>

            {/* PROCESSING PIPELINE */}
            {isProcessing && <ProcessingPipeline />}

            {/* AI RESPONSE CARD */}
            <AIResponseCard
              onViewAnalysis={() => navigate('/safety-risk')}
              onShowRoute={() => navigate('/safe-routes')}
            />
          </div>

          {/* CHAT INPUT AREA & QUICK CHIPS */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 space-y-3">
            {/* QUICK SUGGESTION CHIPS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['Nearest PFZ', "Tomorrow's safety", 'Sea conditions', 'Cyclone alerts', 'Safe route'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleQuickChip(chip)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono px-3 py-1 rounded-full border border-slate-200 shrink-0 transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* INPUT FIELD BOX */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#1363DF] focus-within:ring-2 focus-within:ring-[#00B4D8]/20 transition-all">
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <Mic className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Marine AI..."
                className="flex-1 bg-transparent text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="w-8 h-8 rounded-lg bg-[#00B4D8] hover:bg-[#0096B4] text-[#001F3F] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLEET CONTEXT SIDEBAR (4/12 COLS) */}
        <div className="lg:col-span-4">
          <FleetContextSidebar />
        </div>
      </div>
    </div>
  );
}
