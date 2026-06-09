/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
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
    <footer className="bg-slate-50 border-t border-slate-200 py-12 relative overflow-hidden">
      {/* Light glow reflection */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#067EB3]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          
          {/* Logo Brand Footer */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              {/* Logo block */}
              <div className="relative w-6 h-6 flex items-center justify-center rounded-lg bg-gradient-to-tr from-[#067EB3] to-[#6D6F6E] p-[1px]">
                <div className="w-full h-full rounded-[7px] bg-white flex items-center justify-center">
                  <div className="relative w-3 h-3">
                    <div className="absolute top-1/2 left-0 w-3 h-0.5 bg-[#067EB3] -translate-y-1/2" />
                    <div className="absolute left-1/2 top-0 w-0.5 h-3 bg-[#067EB3] -translate-x-1/2" />
                  </div>
                </div>
              </div>
              <div className="flex items-baseline font-display">
                <span className="text-slate-900 font-bold text-base tracking-tight">GUIDED</span>
                <span className="text-[#067EB3] font-normal text-base tracking-wide ml-1">BROKER</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest leading-none">
              A Company of B&C Agency LLC
            </p>
          </div>

          {/* Small Footer Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#067EB3] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('resources-grid')}
              className="hover:text-[#067EB3] transition-colors cursor-pointer"
            >
              Resources
            </button>
            <a
              href="mailto:support@protecthealth.com"
              className="hover:text-[#067EB3] transition-colors"
            >
              Email Support
            </a>
            <a
              href="https://protecthealth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#067EB3] transition-colors"
            >
              ProtectHealth
            </a>
          </nav>

          {/* Legal / Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-400">
              &copy; {currentYear} ProtectHealth. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Broker Support Center by B&C Agency.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
