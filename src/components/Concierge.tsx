/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, Send, Sparkles, Folder, ArrowRight, CornerDownRight, ExternalLink, Loader2, PhoneOff } from 'lucide-react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { CONFIG } from '../config';
import { searchResources } from '../lib/search';
import { submitTicket } from '../lib/ticket';
import { SearchResponse } from '../types';

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

const AGENT_READY = !!CONFIG.elevenLabsAgentId && CONFIG.elevenLabsAgentId !== "YOUR_ELEVENLABS_AGENT_ID";

// Warm the search backend so the first real query isn't a cold start (which can
// take ~7s and trip the voice tool's timeout). Fire-and-forget; ignore result.
function warmSearch() {
  if (CONFIG.useMockSearch) return;
  try {
    fetch(`${CONFIG.apiBaseUrl}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "warmup", top_k: 1 }),
    }).catch(() => {});
  } catch (e) { /* noop */ }
}

// Wrap the concierge in the ElevenLabs ConversationProvider so the hero
// "Tap to Speak" button can drive a real voice session.
export default function Concierge(props: ConciergeProps) {
  const { onSearchExecuted, setQuery, setIsSearching } = props;

  // Client tool the ElevenLabs voice agent calls. It runs the real search in
  // the browser, renders the result card with the clickable link on screen,
  // and returns the answer text for Pete to speak.
  const clientTools = {
    search_portal: async (params: any) => {
      const q = String(params?.query || "").trim();
      if (!q) return "No query was provided.";
      setQuery(q);
      setIsSearching(true);
      try {
        const res = await searchResources(q, Number(params?.top_k) || 8);
        onSearchExecuted(res, q);
        const t = res.top_link;
        return JSON.stringify({
          document_content: (res as any).context || "",
          resource: t ? t.title : null,
          directions: t ? t.directions : null,
          link_shown_on_screen: !!t,
          how_to_answer:
            "Answer the broker's question directly and conversationally in 1-3 sentences using document_content. Then tell them the full document is on their screen — tap 'Open Resource Document'. If document_content doesn't contain the answer, say what you found and point them to the document. Never invent facts.",
        });
      } catch (e) {
        return "The search failed, please try again.";
      } finally {
        setIsSearching(false);
      }
    },

    // Pete files a support ticket on the broker's behalf — same destination as
    // the manual form (Supabase tickets + GHL webhook), so it appears in the
    // admin dashboard.
    open_ticket: async (params: any) => {
      const first = String(params?.first_name ?? params?.firstName ?? "").trim();
      const last = String(params?.last_name ?? params?.lastName ?? "").trim();
      const email = String(params?.email ?? "").trim();
      const summary = String(params?.summary ?? params?.issue ?? params?.details ?? "").trim();
      let department = String(params?.department ?? "Other").trim();
      const match = CONFIG.ticketDepartments.find(
        (d) => d.toLowerCase() === department.toLowerCase()
      );
      department = match || "Other";
      const highPriority =
        params?.high_priority === true ||
        params?.highPriority === true ||
        /\b(high|urgent|asap|emergency)\b/i.test(String(params?.priority ?? ""));

      if (!first || !last || !email || !summary) {
        return JSON.stringify({
          submitted: false,
          missing: [
            !first && "first name", !last && "last name",
            !email && "email", !summary && "a short summary of the issue",
          ].filter(Boolean),
          say: "Ask the broker for the missing details before submitting, then call open_ticket again.",
        });
      }

      try {
        const { ticketId } = await submitTicket({ department, firstName: first, lastName: last, email, summary, highPriority });
        return JSON.stringify({
          submitted: true,
          ticket_id: ticketId,
          say: `The ticket is submitted. The confirmation number is ${ticketId}. The ProtectHealth team will follow up by email.`,
        });
      } catch (e) {
        return JSON.stringify({
          submitted: false,
          say: "I couldn't submit the ticket just now. Please try again, or use the Open a Ticket button on the page.",
        });
      }
    },
  };

  return (
    <ConversationProvider
      agentId={AGENT_READY ? CONFIG.elevenLabsAgentId : undefined}
      connectionType="webrtc"
      clientTools={clientTools}
      onConnect={() => warmSearch()}
      onError={(e) => console.error("ElevenLabs conversation error:", e)}
    >
      <ConciergeInner {...props} />
    </ConversationProvider>
  );
}

function ConciergeInner({
  onSearchExecuted,
  result,
  query,
  setQuery,
  isSearching,
  setIsSearching
}: ConciergeProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const callRef = useRef<HTMLDivElement>(null);

  // Real ElevenLabs voice session state
  const { startSession, endSession, status, isSpeaking } = useConversation();
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // As soon as a call is connecting/active, scroll the Pete visual into view
  // (key on mobile, where the overlay otherwise opens below the fold).
  useEffect(() => {
    if (isConnecting || isConnected) {
      const id = setTimeout(() => {
        callRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 90);
      return () => clearTimeout(id);
    }
  }, [isConnecting, isConnected]);

  // Pre-warm the search backend on load AND keep it warm every 90s, so voice
  // queries never hit a cold start (which made Pete time out and say "can't pull
  // it up" even though the result rendered).
  useEffect(() => {
    warmSearch();
    const id = setInterval(warmSearch, 90000);
    return () => clearInterval(id);
  }, []);

  // Cycle through placeholders for text box
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Submit text search query
  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = customQuery !== undefined ? customQuery : query;
    if (!queryToSend.trim()) return;

    setIsSearching(true);
    try {
      const searchRes = await searchResources(queryToSend);
      onSearchExecuted(searchRes, queryToSend);
    } catch (err) {
      console.error("Search failure: ", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChipClick = (text: string) => {
    setQuery(text);
    handleSearchSubmit(undefined, text);
  };

  // Start / stop the real voice conversation with Pete.
  const handleVoiceToggle = async () => {
    if (!AGENT_READY) return;
    if (isConnected || isConnecting) {
      endSession();
      return;
    }
    warmSearch(); // warm the backend the moment they start a call
    try {
      // Ask for the mic up front so the browser prompt is tied to this click.
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startSession({ agentId: CONFIG.elevenLabsAgentId, connectionType: 'webrtc' });
    } catch (err) {
      console.error("Could not start voice session:", err);
      alert("I couldn't access your microphone. Please allow mic access and try again.");
    }
  };

  const voiceLabel = isConnecting
    ? 'Connecting…'
    : isConnected
      ? (isSpeaking ? 'Pete is speaking' : 'Listening — tap to end')
      : 'Tap to Speak';

  // Map category code to human readable label + badge styles
  const getCategoryDetails = (cat: string) => {
    if (cat?.startsWith('administrative')) return { badge: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Administrative' };
    if (cat?.startsWith('support')) return { badge: 'bg-[#067EB3]/10 text-[#067EB3] border-[#067EB3]/20', label: 'Support & Training' };
    if (cat?.startsWith('directory')) return { badge: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Directory' };
    if (cat?.startsWith('carrier') || cat === 'important_links') return { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Carrier Portal' };
    return { badge: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Resource' };
  };

  return (
    <section id="concierge-section" className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Decorative gradient glowing canvas backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#067EB3]/10 via-[#6D6F6E]/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#067EB3]/5 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse duration-10000" />

      <div className="max-w-4xl mx-auto text-center">

        {/* Title Block */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-slate-200/80 mb-6 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]"
          >
            <Sparkles size={13} className="text-[#067EB3]" />
            <span className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase font-mono">
              AI Voice &amp; Text Assistant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.7, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.15 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.04]"
          >
            Ask the GuidedBroker{" "}
            <span className="gradient-concierge">Concierge</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.7 }}
            className="text-slate-600 mt-5 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Find any carrier portal login page, direct deposit statement, eligibility guide, or training asset details by voice or text. Instantly.
          </motion.p>
        </div>

        {/* CONCIERGE GLASS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.85 }}
          className="bg-white/95 backdrop-blur-xl border border-white/60 ring-1 ring-slate-200/70 rounded-3xl p-6 md:p-8 shadow-[0_30px_70px_-20px_rgba(6,126,179,0.30)] relative overflow-hidden mb-12"
        >

          {/* Animated gradient border sheen */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-[#067EB3]/20 via-transparent to-[#7c3aed]/20 opacity-60 pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#067EB3]/[0.03] -z-10 pointer-events-none" />

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

            {/* Voice Trigger Button — drives the real ElevenLabs agent */}
            <div className="relative flex gap-4 w-full md:w-auto shrink-0">
              {/* Pulsing spotlight glow behind the mic (idle only) */}
              {!isConnected && !isConnecting && (
                <div
                  aria-hidden
                  className="absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(6,126,179,0.6),rgba(124,58,237,0.25)_45%,transparent_70%)] blur-2xl animate-spotlight pointer-events-none -z-0"
                />
              )}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={handleVoiceToggle}
                disabled={!AGENT_READY}
                className={`relative z-10 flex-1 md:flex-initial py-4 px-7 rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 cursor-pointer border transition-[box-shadow,transform] ${
                  isConnected
                    ? 'bg-rose-500 text-white border-rose-400/40 shadow-[0_6px_0_#9f1239,0_16px_30px_rgba(239,68,68,0.35)]'
                    : 'text-white border-white/25 bg-gradient-to-b from-[#0a9fd6] to-[#056a96] shadow-[0_7px_0_#044f73,0_18px_34px_rgba(6,126,179,0.45)] hover:shadow-[0_9px_0_#044f73,0_24px_44px_rgba(6,126,179,0.55)] active:shadow-[0_2px_0_#044f73,0_8px_16px_rgba(6,126,179,0.4)]'
                } ${!AGENT_READY ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* glossy top highlight for the 3D feel */}
                <span aria-hidden className="absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/25 blur-[2px] pointer-events-none" />
                {isConnecting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Connecting…</span>
                  </>
                ) : isConnected ? (
                  <>
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <span className={`absolute inline-flex h-3 w-3 rounded-full bg-white/70 opacity-75 ${isSpeaking ? 'animate-ping' : 'animate-pulse'}`} />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </div>
                    <span>{voiceLabel}</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Mic size={17} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-300 animate-ping" />
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
        </motion.div>

        {/* LIVE VOICE CALL OVERLAY — shown while a real conversation is active */}
        <AnimatePresence>
          {(isConnecting || isConnected) && (
            <motion.div
              ref={callRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12 relative overflow-hidden scroll-mt-24"
            >
              <div className="flex flex-col items-center">
                {/* ProtectHealth Pete avatar — transparent, fades into the white card */}
                <div className="relative mb-1 flex items-end justify-center">
                  {/* subtle pulsing halo ring while speaking */}
                  {isSpeaking && (
                    <span className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full border-2 border-[#067EB3]/25 animate-ping" />
                  )}
                  <img
                    src="/pete.png"
                    alt="ProtectHealth Pete, your AI concierge"
                    className="relative w-48 sm:w-56 object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                </div>

                <h4 className="font-display font-bold text-slate-900 text-lg uppercase tracking-widest font-mono">
                  {isConnecting ? 'Connecting to Pete…' : isSpeaking ? 'Pete is speaking' : 'Listening…'}
                </h4>

                {/* Live waveform */}
                <div className="flex items-end justify-center gap-1.5 h-12 my-6">
                  {[24, 40, 16, 48, 32, 56, 20, 44, 32, 24, 40, 16, 52, 28, 48, 12, 36, 24].map((h, i) => (
                    <span
                       key={i}
                       style={{ height: `${h}px` }}
                       className={`w-1 rounded-full ${isSpeaking ? 'bg-[#067EB3] animate-wave' : 'bg-slate-300'}`}
                    />
                  ))}
                </div>

                <p className="text-slate-600 font-mono text-sm max-w-md mx-auto">
                  {isConnecting ? 'One moment, connecting you to Pete…' : 'Ask out loud — "Where are my 2026 commissions?"'}
                </p>

                <button
                  onClick={() => endSession()}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <PhoneOff size={14} />
                  End conversation
                </button>
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
                      <span>{getCategoryDetails(result.top_link.category).label === 'Carrier Portal' ? 'Launch Carrier Portal' : 'Open Resource Document'}</span>
                      <ExternalLink size={13} />
                    </motion.a>
                  </div>
                )}

                {/* Secondary results section */}
                {result.matches && result.matches.length > 1 && (
                  <div className="border-t border-slate-200 pt-5 mt-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#067EB3] mb-3.5 font-mono">
                      More relevant links found ({result.matches.length - 1}):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.matches.slice(1).map((match, i) => (
                        <a
                          key={(match as any).id ?? i}
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
