/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, Shield, Sparkles, AlertCircle, FileText,
  HelpCircle, ChevronRight, CornerDownRight, CheckCircle2, Loader2
} from 'lucide-react';

import Header from './components/Header';
import Footer from './components/Footer';
import Concierge from './components/Concierge';
import ResourceGrid from './components/ResourceGrid';
import TicketForm from './components/TicketForm';
import Gate from './components/Gate';

import { RESOURCES_DATA } from './data/resources';
import { SearchResponse } from './types';
import {
  Identity, loadStoredIdentity, redeemHandoffFromUrl, revalidate,
} from './lib/identity';

export default function App() {
  // Global States
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // Identity gate. `checking` covers the first paint, so the directory never
  // flashes on screen before we know who this is.
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // A CRM handoff token in the URL wins — it means a signed-in broker
      // clicked through from the dashboard and should never see the form.
      const fromCrm = await redeemHandoffFromUrl();
      if (cancelled) return;
      if (fromCrm) {
        setIdentity(fromCrm);
        setChecking(false);
        return;
      }

      const stored = loadStoredIdentity();
      if (!stored) {
        setChecking(false);
        return;
      }

      const still = await revalidate(stored.token);
      if (cancelled) return;
      setIdentity(still);
      setChecking(false);
    })();

    return () => { cancelled = true; };
  }, []);

  // When search executes, we update global query state and results
  const handleSearchExecuted = (result: SearchResponse, queryText: string) => {
    setSearchResult(result);
    setQuery(queryText);
    
    // Smooth scroll down to clarify results rendering under the console if on mobile
    setTimeout(() => {
      const element = document.getElementById('concierge-section');
      if (element) {
        // scroll slightly past search bar to focus on the result card directly
        const rect = element.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        window.scrollTo({
          top: absoluteTop + 140,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Scroll viewport down specifically to search bar
  const handleScrollToSearch = () => {
    const element = document.getElementById('concierge-section');
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Auto-focus the input search box
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]');
        if (input) (input as HTMLInputElement).focus();
      }, 500);
    }
  };

  // First paint while we resolve identity. Deliberately shows nothing but a
  // spinner — no resource titles, no carrier names.
  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[#067EB3]" />
        <span className="sr-only">Checking your access</span>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-white">
        <Gate
          onVerified={setIdentity}
          onOpenTicket={() => setIsTicketOpen(true)}
        />
        <TicketForm isOpen={isTicketOpen} onClose={() => setIsTicketOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">

      {/* 1. LAYERED BACKGROUND MESH ORBS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
        {/* Top-left Indigo Orb replaced with Primary Color Blob */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#067EB3]/10 rounded-full blur-[100px] animate-drift-slow" />
        
        {/* Bottom-right Slate-Gray Blob */}
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-[#6D6F6E]/8 rounded-full blur-[120px] animate-drift-medium" />
        
        {/* Center Primary Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#067EB3]/5 rounded-full blur-[150px]" />
      </div>

      {/* 2. MAIN HEADER */}
      <Header 
        onOpenTicket={() => setIsTicketOpen(true)} 
        onScrollToSearch={handleScrollToSearch} 
      />

      <main className="pt-24 pb-8 relative z-10">

        {/* 3. HERO / CONCIERGE CHAT INTERFACE AREA */}
        <Concierge
          onSearchExecuted={handleSearchExecuted}
          result={searchResult}
          query={query}
          setQuery={setQuery}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          identity={identity}
        />

        {/* 4. STATIC CATEGORIZED GRID DIRECTORY GRID AREA */}
        <ResourceGrid resources={RESOURCES_DATA} />

        {/* 5. TICKET HELP CENTER DESK CALL-TO-ACTION BAND */}
        <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-[#f8fafc]/90 border border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-sm">
              
              {/* Internal abstract vectors backdrop */}
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#067EB3]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#6D6F6E]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#067EB3]/10 border border-[#067EB3]/25 text-[#067EB3] text-xs font-semibold mb-4 uppercase font-mono">
                    <Shield size={12} />
                    Agent Support Guaranteed
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Can't find what you need?
                  </h3>
                  <p className="text-slate-600 mt-2.5 text-sm md:text-base leading-relaxed">
                    Open a Support Ticket directly with the ProtectHealth administrative desk. Our team of specialists is standing by to locate custom files and carrier portals.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(6, 126, 179, 0.25)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsTicketOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white font-bold text-sm tracking-wide shadow-md cursor-pointer flex items-center gap-2 shrink-0 border border-white/10"
                >
                  <span>Open a Ticket</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 6. SUPPORT TICKET SYSTEM DIALOG */}
      <TicketForm 
        isOpen={isTicketOpen} 
        onClose={() => setIsTicketOpen(false)} 
      />

      {/* 7. FOOTER */}
      <Footer />

    </div>
  );
}
