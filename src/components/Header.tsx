/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Ticket, MessageSquare, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  onOpenTicket: () => void;
  onScrollToSearch: () => void;
}

export default function Header({ onOpenTicket, onScrollToSearch }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // height of fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-slate-200/80 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* LOGO & WORDMARK */}
          <div 
            className="flex flex-col cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex items-center gap-3">
              {/* Geometric Blue/Slate Glass/Cross Logo */}
              <div className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#067EB3] via-sky-500 to-[#6D6F6E] p-[1.5px] shadow-[0_4px_12px_rgba(6,126,179,0.15)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                  <div className="relative w-4 h-4">
                    {/* Medical Cross Concept made with clean modern bars */}
                    <div className="absolute top-1/2 left-0 w-4 h-1 bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] rounded-full -translate-y-1/2" />
                    <div className="absolute left-1/2 top-0 w-1 h-4 bg-gradient-to-b from-[#067EB3] to-[#6D6F6E] rounded-full -translate-x-1/2" />
                  </div>
                </div>
                {/* Luminous Core Glow */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#067EB3] to-[#6D6F6E] blur-[4px] opacity-20 group-hover:opacity-40 transition-opacity -z-10" />
              </div>
              
              <div className="leading-tight">
                <div className="flex items-baseline font-display">
                  <span className="text-slate-900 font-extrabold text-xl tracking-tight">GUIDED</span>
                  <span className="text-[#067EB3] font-normal text-xl tracking-wide ml-1">BROKER</span>
                </div>
              </div>
            </div>
            <span className="text-[9px] text-slate-500 tracking-widest font-mono uppercase mt-0.5 ml-1">
              A Company of B&C Agency LLC
            </span>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm font-medium text-slate-600 hover:text-[#067EB3] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('resources-grid')}
              className="text-sm font-medium text-slate-600 hover:text-[#067EB3] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Grid size={15} />
              Resources
            </button>
            <button
              onClick={onOpenTicket}
              className="text-sm font-medium text-slate-600 hover:text-[#067EB3] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Ticket size={15} />
              Open a Ticket
            </button>
          </nav>

          {/* DESKTOP CTA BUTTON */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(6, 126, 179, 0.25)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onScrollToSearch}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white shadow-md border border-slate-200/20 flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare size={14} />
              Talk to Concierge
            </motion.button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#067EB3] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE NAV MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-lg shadow-lg"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-[#067EB3] hover:bg-slate-50 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('resources-grid')}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-[#067EB3] hover:bg-slate-50 transition-colors"
              >
                Resources
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTicket();
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:text-[#067EB3] hover:bg-slate-50 transition-colors"
              >
                Open a Ticket
              </button>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onScrollToSearch();
                  }}
                  className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare size={16} />
                  Talk to Concierge
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
