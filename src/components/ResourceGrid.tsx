/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ResourceItem, ResourceCategory } from '../types';
import { 
  FileText, Key, Award, BookOpen, ShieldAlert, FileSpreadsheet, Sparkles, 
  Users, Eye, PhoneCall, Building, Contact, ClipboardList, Globe, 
  ExternalLink, Activity, Heart, RefreshCw, UserPlus, Building2, 
  Calendar, FileCode, Bookmark, ShieldCheck, Layers, CheckSquare,
  ArrowUpRight, HelpCircle
} from 'lucide-react';

interface ResourceGridProps {
  resources: ResourceItem[];
}

// Icon mapper to prevent dynamic import issues
const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const iconProps = { className: className || "w-5 h-5" };
  switch (name) {
    case "FileText": return <FileText {...iconProps} />;
    case "Key": return <Key {...iconProps} />;
    case "Award": return <Award {...iconProps} />;
    case "BookOpen": return <BookOpen {...iconProps} />;
    case "ShieldAlert": return <ShieldAlert {...iconProps} />;
    case "FileSpreadsheet": return <FileSpreadsheet {...iconProps} />;
    case "Sparkles": return <Sparkles {...iconProps} />;
    case "Users": return <Users {...iconProps} />;
    case "Eye": return <Eye {...iconProps} />;
    case "PhoneCall": return <PhoneCall {...iconProps} />;
    case "Building": return <Building {...iconProps} />;
    case "Contact": return <Contact {...iconProps} />;
    case "ClipboardList": return <ClipboardList {...iconProps} />;
    case "Globe": return <Globe {...iconProps} />;
    case "ExternalLink": return <ExternalLink {...iconProps} />;
    case "Activity": return <Activity {...iconProps} />;
    case "Heart": return <Heart {...iconProps} />;
    case "RefreshCw": return <RefreshCw {...iconProps} />;
    case "UserPlus": return <UserPlus {...iconProps} />;
    case "Building2": return <Building2 {...iconProps} />;
    case "Calendar": return <Calendar {...iconProps} />;
    case "FileCode": return <FileCode {...iconProps} />;
    case "Bookmark": return <Bookmark {...iconProps} />;
    case "ShieldCheck": return <ShieldCheck {...iconProps} />;
    case "Layers": return <Layers {...iconProps} />;
    case "CheckSquare": return <CheckSquare {...iconProps} />;
    default: return <ExternalLink {...iconProps} />;
  }
};

export default function ResourceGrid({ resources }: ResourceGridProps) {
  // Group resources by category
  const categories: { key: ResourceCategory; label: string; textGradient: string }[] = [
    { 
      key: 'administrative', 
      label: 'Administrative',
      textGradient: 'from-violet-600 to-[#067EB3]'
    },
    { 
      key: 'support_training', 
      label: 'Support & Training',
      textGradient: 'from-[#067EB3] to-sky-600'
    },
    { 
      key: 'directory', 
      label: 'Directory',
      textGradient: 'from-teal-600 to-[#067EB3]'
    },
    { 
      key: 'important_links', 
      label: 'Important Links',
      textGradient: 'from-amber-600 to-[#6D6F6E]'
    }
  ];

  return (
    <section id="resources-grid" className="py-20 relative px-4 sm:px-6 lg:px-8">
      {/* Light gradient blur block */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-[#067EB3]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#6D6F6E]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-slate-200/80 mb-5">
            <Layers size={13} className="text-[#067EB3]" />
            <span className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase font-mono">Browse Manually</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-slate-900">The </span><span className="gradient-concierge font-concierge text-[1.15em]">Resource Library</span>
          </h2>
          <p className="text-slate-600 mt-4 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Every directory, compliance manual, commission table, and carrier login — organized and one tap away.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#067EB3] via-[#22d3ee] to-[#7c3aed] mx-auto mt-6 rounded-full" />
        </motion.div>

        {/* Categories Grid - 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {categories.map((c, colIndex) => {
            const filteredItems = resources.filter(item => item.category === c.key);
            const isImportantLinks = c.key === 'important_links';

            return (
              <div 
                key={c.key} 
                className={`flex flex-col gap-5 ${
                  isImportantLinks ? 'lg:col-span-1' : ''
                }`}
              >
                {/* Column Headline with custom styling */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <span className={`text-base font-bold font-display uppercase tracking-wider bg-gradient-to-r ${c.textGradient} bg-clip-text text-transparent`}>
                    {c.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {filteredItems.length}
                  </span>
                </div>

                {/* Column Item Tiles */}
                <div className="flex flex-col gap-4">
                  {filteredItems.map((item, itemIndex) => (
                    <motion.a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={item.id}
                      whileHover={{ 
                        scale: 1.025, 
                        y: -3,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.04)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        type: "spring", 
                        damping: 15,
                        delay: (colIndex * 0.1) + (itemIndex * 0.05) 
                      }}
                      className={`group relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        isImportantLinks
                          ? 'bg-amber-50/50 border-amber-200/70 hover:border-amber-400 hover:bg-amber-50 hover:shadow-[0_14px_30px_-14px_rgba(245,158,11,0.45)]'
                          : 'bg-white border-slate-200/80 hover:border-[#067EB3]/50 hover:shadow-[0_16px_34px_-16px_rgba(6,126,179,0.45)]'
                      }`}
                    >
                      {/* Subtle micro neon indicator inside carrier logins */}
                      {isImportantLinks && (
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}

                      <div className="flex gap-3.5 items-start">
                        
                        {/* Icon displayer */}
                        <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isImportantLinks
                            ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                            : 'bg-gradient-to-br from-[#067EB3]/15 to-[#7c3aed]/10 text-[#067EB3] group-hover:from-[#067EB3] group-hover:to-[#0a9fd6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#067EB3]/30'
                        }`}>
                          <IconComponent name={item.iconName} />
                        </div>

                        {/* Text and labels */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-[#067EB3] transition-colors tracking-tight line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          
                          {/* Portal meta tag */}
                          <div className="flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-[10px] font-medium text-[#067EB3] uppercase tracking-widest font-mono">
                              {isImportantLinks ? 'Launch Portal' : 'Open Document'}
                            </span>
                            <ArrowUpRight size={10} className="text-[#067EB3]" />
                          </div>
                        </div>

                      </div>

                    </motion.a>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
