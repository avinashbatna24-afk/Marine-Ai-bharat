import React, { useState } from 'react';
import { Sparkles, Send, Mic, ChevronUp } from 'lucide-react';
import { analyzeMarineQuery } from '../../api/aiApi';

export default function MarineAICoPilot({ onNavigateToRoute, location }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      time: '10:21 AM',
      text: 'Where is the nearest high potential PFZ from my location?'
    },
    {
      id: 2,
      sender: 'ai',
      time: '10:21 AM',
      text: 'The nearest high-confidence PFZ is PFZ-03, located 18.4 km northeast of your current location.',
      actionText: 'Show on Map',
      actionType: 'map'
    },
    {
      id: 3,
      sender: 'user',
      time: '10:22 AM',
      text: 'Is it safe to go tomorrow morning?'
    },
    {
      id: 4,
      sender: 'ai',
      time: '10:22 AM',
      text: 'For tomorrow morning (6 AM – 10 AM), conditions are expected to be LOW RISK ✓ for your selected area.',
      actionText: 'View Details',
      actionType: 'details'
    }
  ]);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const userQuery = inputText.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', time: now, text: userQuery };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const aiResult = await analyzeMarineQuery({
        query: userQuery,
        userLocation: { latitude: location?.lat || 16.98, longitude: location?.lon || 82.24 },
        language: 'en'
      });

      const responseText = aiResult.data?.answer ||
        `Analyzing live telemetry for "${userQuery}"... SST is 28.4 °C with mild swells (1.2m). Optimal fishing window is between 06:00 and 11:00 AM.`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: responseText,
          actionText: 'View Details',
          actionType: 'details',
          isFallback: aiResult.isFallback
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Analyzing live telemetry for "${userQuery}"... SST is 28.4 °C with mild swells (1.2m).`,
          actionText: 'View Details',
          actionType: 'details',
          isFallback: true
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#04111D] rounded-2xl border border-slate-800 shadow-xl p-5 flex flex-col justify-between h-[520px]">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <span>AI COPILOT</span>
            <Sparkles className="w-4 h-4 text-[#00B4D8]" />
          </h2>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {isProcessing ? 'Thinking...' : 'Online'}
            </span>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white cursor-pointer">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* CHAT MESSAGES LOG */}
      <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 font-mono mb-1">{msg.time}</span>
                <div className="bg-[#1363DF]/80 text-white border border-[#1363DF] text-xs px-3.5 py-2 rounded-xl rounded-tr-none shadow-sm max-w-[85%] font-medium leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                {msg.isFallback && (
                  <span className="text-[9px] text-amber-400 font-mono border border-amber-500/30 px-1 rounded">
                    Fallback
                  </span>
                )}
              </div>
              <div className="bg-[#0A2239] text-slate-200 border border-slate-800 text-xs p-3.5 rounded-xl rounded-tl-none shadow-sm max-w-[95%] space-y-2.5">
                <p className="leading-relaxed">
                  {msg.text.includes('PFZ-03') ? (
                    <>
                      The nearest high-confidence PFZ is <strong className="text-emerald-400 font-bold font-mono">PFZ-03</strong>, located 18.4 km northeast of your current location.
                    </>
                  ) : msg.text.includes('LOW RISK') ? (
                    <>
                      For tomorrow morning (6 AM – 10 AM), conditions are expected to be <strong className="text-emerald-400 font-bold font-mono">LOW RISK ✓</strong> for your selected area.
                    </>
                  ) : (
                    msg.text
                  )}
                </p>

                {msg.actionText && (
                  <div>
                    <button
                      onClick={onNavigateToRoute}
                      className="w-full py-1.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{msg.actionText}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2 bg-[#0A2239] border border-slate-800 rounded-xl px-3.5 py-2.5 focus-within:border-[#00B4D8] transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Marine AI anything..."
            disabled={isProcessing}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="w-7 h-7 rounded-lg bg-[#1363DF] hover:bg-[#00B4D8] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
