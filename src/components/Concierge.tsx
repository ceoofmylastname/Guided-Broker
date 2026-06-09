/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, MicOff, Send, MessageSquare, Volume2, Sparkles, Folder, ArrowRight, CornerDownRight, ExternalLink, HelpCircle, Loader2 } from 'lucide-react';
import { CONFIG } from '../config';
import { searchResources } from '../lib/search';
import { SearchResponse, ResourceCategory } from '../types';

interface ConciergeProps {
  onSearchExecuted: (result: SearchResponse, queryText: string) => void;
  result: SearchResponse | null;
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  setIsSearching: (b: boolean) => void;
}

const PLACEHOLDERS = [
  "Where are my 2026 commissions?",
  "Ambetter broker portal login",
  "ACA provider directory",
  "Clearwater PPO appoints",
  "PALIC New Era login",
  "ProtectHealth official brand asset logo"
];

const SUGGESTIONS = [
  { text: "2026 commissions", label: "📄 Split Commissions" },
  { text: "Ambetter login", label: "🌟 Ambetter Portal" },
  { text: "Clearwater PPO", label: "🤝 Clearwater Appoints" },
  { text: "Meeting Reservations", label: "📅 Room Bookings" }
];

export default function Concierge({ 
  onSearchExecuted, 
  result, 
  query, 
  setQuery, 
  isSearching, 
  setIsSearching 
}: ConciergeProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [isElevenLabsLoaded, setIsElevenLabsLoaded] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load ElevenLabs Web Component SDK script
  useEffect(() => {
    if (CONFIG.elevenLabsAgentId && CONFIG.elevenLabsAgentId !== "YOUR_ELEVENLABS_AGENT_ID") {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => setIsElevenLabsLoaded(true);
      document.body.appendChild(script);

      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {
          // script might be already detached
        }
      };
    }
  }, []);

  // Cycle through placeholders for text box
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Submit Search Query
  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = customQuery !== undefined ? customQuery : query;
    if (!queryToSend.trim()) return;

    setIsSearching(true);
    // Mimic API latency for premium realistic feel
    setTimeout(async () => {
      try {
        const searchRes = await searchResources(queryToSend);
        onSearchExecuted(searchRes, queryToSend);
      } catch (err) {
        console.error("Search failure: ", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);
  };

  // Click on quick suggestion chip
  const handleChipClick = (text: string) => {
    setQuery(text);
    handleSearchSubmit(undefined, text);
  };

  // Simulate premium interactive voice recognition flow
  const triggerMockVoiceListening = () => {
    if (isListening) return;
    setIsListening(true);
    setShowVoiceOverlay(true);
    setVoiceQuery('Listening for your question...');

    const simulatedQueries = [
      "Where can I find 2026 commissions?",
      "Launch Ambetter broker portal",
      "Get appointed with Clearwater PPO benefits",
      "I need official brand assets and logo guides"
    ];
    // Select random query
    const targetQuery = simulatedQueries[Math.floor(Math.random() * simulatedQueries.length)];

    // Timeline for simulated voice experience
    // 1. Listen for 1.8s
    setTimeout(() => {
      setVoiceQuery(`Transcribing: "${targetQuery}"`);
    }, 1800);

    // 2. Transcribe and input character-by-character
    setTimeout(() => {
      setShowVoiceOverlay(false);
      setIsListening(false);
      
      // Type effect sequence
      let currentIdx = 0;
      setQuery('');
      const typingTimer = setInterval(() => {
        if (currentIdx < targetQuery.length) {
          setQuery(targetQuery.substring(0, currentIdx + 1));
          currentIdx++;
        } else {
          clearInterval(typingTimer);
          // Trigger search after typing concludes
          handleSearchSubmit(undefined, targetQuery);
        }
      }, 35);
    }, 3200);
  };

  // Map category code to human readable and styles
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'administrative':
        return { 
          badge: 'bg-violet-50 text-violet-700 border-violet-200', 
          label: 'Administrative' 
        };
      case 'support_training':
        return { 
          badge: 'bg-[#067EB3]/10 text-[#067EB3] border-[#067EB3]/20', 
          label: 'Support & Training' 
        };
      case 'directory':
        return { 
          badge: 'bg-teal-50 text-teal-700 border-teal-200', 
          label: 'Directory' 
        };
      case 'important_links':
        return { 
          badge: 'bg-amber-50 text-amber-700 border-amber-200', 
          label: 'Carrier Portal Connection' 
        };
      default:
        return { 
          badge: 'bg-slate-50 text-slate-700 border-slate-200', 
          label: 'Document' 
        };
    }
  };

  return (
    <section id="concierge-section" className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Decorative gradient glowing canvas backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#067EB3]/10 via-[#6D6F6E]/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#067EB3]/5 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse duration-10000" />
      
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Title Block */}
        <div className="mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 mb-4 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
            <Sparkles size={13} className="text-[#067EB3]" />
            <span className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase font-mono">
              AI Voice & Text Assistant
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Ask the GuidedBroker <span className="bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] bg-clip-text text-transparent">Concierge</span>
          </h1>

          <p className="text-slate-600 mt-4 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Find any carrier portal login page, direct deposit statement, eligibility guide, or training asset details by voice or text. Instantly.
          </p>
        </div>

        {/* CONCIERGE GLASS CARD */}
        <div className="bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.05)] relative overflow-hidden mb-12">
          
          {/* Subtle neon border outline flare */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#067EB3]/5 via-[#6D6F6E]/5 to-[#067EB3]/5 -z-10 pointer-events-none" />

          {/* Form / Controller */}
          <form onSubmit={(e) => handleSearchSubmit(e)} className="relative flex flex-col md:flex-row gap-4 items-center">
            
            {/* Input wrap */}
            <div className="relative w-full flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-24 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3] transition-all font-sans font-normal"
              />

              {/* Dynamic submit action */}
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1.5">
                {query.trim() && (
                  <button
                    type="submit"
                    className="p-2 bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all text-xs cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Send size={14} />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                )}
              </div>
            </div>

            {/* Microphone Trigger Button */}
            <div className="flex gap-4 w-full md:w-auto shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerMockVoiceListening}
                disabled={isListening}
                className={`flex-1 md:flex-initial py-3.5 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                  isListening
                    ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse'
                    : 'bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white border-[#067EB3]/10 shadow-md shadow-[#067EB3]/15'
                }`}
              >
                {isListening ? (
                  <>
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </div>
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Mic size={16} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    </div>
                    <span>Tap to Speak</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* SUGGESTED QUESTION CHIPS */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <span className="text-xs text-slate-400 mr-1.5 font-mono">Suggested:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                type="button"
                onClick={() => handleChipClick(s.text)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#067EB3] hover:bg-slate-100 hover:border-[#067EB3]/25 transition-all cursor-pointer font-sans"
              >
                {s.label}
              </button>
            ))}
          </div>

        </div>

        {/* ElevenLabs Widget Embed Integration Banner */}
        {CONFIG.elevenLabsAgentId !== "YOUR_ELEVENLABS_AGENT_ID" && isElevenLabsLoaded ? (
          <div className="mb-8 p-4 bg-gradient-to-r from-[#067EB3]/10 via-slate-50 to-[#6D6F6E]/5 rounded-2xl border border-slate-200 text-left flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#067EB3]/10 rounded-lg text-[#067EB3]">
                <Volume2 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">ElevenLabs Conversational Voice Enabled</h4>
                <p className="text-xs text-slate-600 mt-0.5">Real-time full duplex natural-language telephony is loaded. Tap the floating sphere to talk directly.</p>
              </div>
            </div>
            {/* Widget mount spot */}
            <div className="shrink-0 relative">
              <elevenlabs-convai agent-id={CONFIG.elevenLabsAgentId}></elevenlabs-convai>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-xs text-slate-500 italic mt-0.5 max-w-lg mx-auto leading-relaxed">
            Note: Speak features are locally simulated for broker sandbox demo. To wire real duplex voice, add your <span className="font-mono text-slate-600 font-semibold bg-slate-100 px-1 py-0.5 rounded">elevenLabsAgentId</span> in <span className="font-mono text-slate-500">config.ts</span>.
          </div>
        )}

        {/* VOICE INPUT SIMULATION TRANSCRIBING OVERLAY SECTION */}
        <AnimatePresence>
          {showVoiceOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 border border-rose-200 rounded-3xl p-8 shadow-sm mb-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-50/20 pointer-events-none" />
              
              <div className="flex flex-col items-center">
                <div className="p-4 bg-rose-100 text-rose-600 rounded-full animate-pulse shadow-sm mb-4">
                  <Volume2 size={32} />
                </div>
                
                <h4 className="font-display font-bold text-slate-900 text-lg tracking-wide uppercase tracking-widest font-mono">GuidedBroker Audio Feed Active</h4>
                
                {/* Simulated Waveform Visualization */}
                <div className="flex items-end justify-center gap-1.5 h-12 my-6">
                  {[24, 40, 16, 48, 32, 56, 20, 44, 32, 24, 40, 16, 52, 28, 48, 12, 36, 24].map((h, i) => (
                    <span 
                       key={i} 
                       style={{ height: `${h}px` }} 
                       className={`w-1 bg-[#067EB3] rounded-full animate-wave`} 
                    />
                  ))}
                </div>

                <p className="text-slate-700 font-mono text-sm sm:italic max-w-md mx-auto line-clamp-2">
                  {voiceQuery}
                </p>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-3">Speak now... "Where are my commissions?"</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS CARD RENDERER */}
        <AnimatePresence mode="wait">
          {/* Loader when searching */}
          {isSearching && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500"
            >
              <Loader2 className="animate-spin text-[#067EB3]" size={32} />
              <p className="text-sm font-mono tracking-widest uppercase">Consulting Resource Index...</p>
            </motion.div>
          )}

          {/* Result Card */}
          {!isSearching && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="bg-[#fafbfd] border border-slate-200 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-left relative overflow-hidden"
            >
              {/* Decorative side accent lines */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#067EB3] to-[#6D6F6E]" />
              
              <div className="flex flex-col gap-6">
                
                {/* Header row containing title and badges */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-tr from-[#067EB3] to-[#6D6F6E] rounded-lg text-white">
                      <Folder size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#067EB3] font-semibold">BEST MATCH FOUND</span>
                      <h3 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                        {result.top_link ? result.top_link.title : "No matching resources"}
                      </h3>
                    </div>
                  </div>

                  {result.top_link && (
                    <span className={`px-3.5 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase font-mono ${
                      getCategoryDetails(result.top_link.category).badge
                    }`}>
                      {getCategoryDetails(result.top_link.category).label}
                    </span>
                  )}
                </div>

                {/* Response / Custom directions */}
                <div className="p-4 rounded-xl bg-white border border-slate-150">
                  <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                    {result.answer}
                  </p>
                </div>

                {/* Top link launch portal button */}
                {result.top_link && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                    
                    {/* Visual breadcrumb instruction directions details */}
                    <div className="flex items-start gap-1 text-xs text-slate-500 max-w-md">
                      <CornerDownRight size={14} className="text-[#067EB3] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">Quick Guide:</span> {result.top_link.directions}
                      </div>
                    </div>

                    {/* Launch button */}
                    <motion.a
                      href={result.top_link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>{result.top_link.category === 'important_links' ? 'Launch Carrier Portal' : 'Open Resource Document'}</span>
                      <ExternalLink size={13} />
                    </motion.a>
                  </div>
                )}

                {/* Secondary results section (Score based index matching) */}
                {result.matches && result.matches.length > 1 && (
                  <div className="border-t border-slate-200 pt-5 mt-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#067EB3] mb-3.5 font-mono">
                      More relevant links found ({result.matches.length - 1}):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.matches.slice(1).map((match) => (
                        <a
                          key={match.id}
                          href={match.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-[#067EB3]/30 text-xs text-slate-600 hover:text-[#067EB3] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#067EB3] group-hover:bg-[#6D6F6E] shrink-0" />
                            <span className="font-semibold truncate text-slate-700 group-hover:text-slate-900">{match.title}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-[#067EB3] text-[10px] pl-2 font-mono">
                            <span className="uppercase">Match {(match.score * 100).toFixed(0)}%</span>
                            <ArrowRight size={11} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
