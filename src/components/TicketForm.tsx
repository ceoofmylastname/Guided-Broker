/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, Send, CheckCircle2, Loader2, AlertCircle, Building2, Paperclip, AlertTriangle } from 'lucide-react';
import { CONFIG } from '../config';
import { submitTicket, isValidEmail } from '../lib/ticket';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketForm({ isOpen, onClose }: TicketFormProps) {
  const [department, setDepartment] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [summary, setSummary] = useState('');
  const [highPriority, setHighPriority] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!department) return setError('Please choose a department.');
    if (!firstName.trim()) return setError('Please enter your first name.');
    if (!lastName.trim()) return setError('Please enter your last name.');
    if (!isValidEmail(email)) return setError('Please provide a valid email address.');
    if (!summary.trim()) return setError("Please tell us what's going on.");

    setIsSubmitting(true);
    try {
      const { ticketId } = await submitTicket({
        department, firstName, lastName, email, summary, highPriority, file,
      });
      setTicketNumber(ticketId);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong submitting your ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDepartment(''); setFirstName(''); setLastName(''); setEmail('');
    setSummary(''); setHighPriority(false); setFile(null);
    setIsSuccess(false); setError('');
  };

  const inputCls =
    "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3] transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] overflow-hidden z-10 p-6 md:p-8 max-h-[92vh] overflow-y-auto"
          >
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-tr from-[#067EB3] to-[#7c3aed] rounded-full blur-3xl opacity-10 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 relative">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight">Open a Support Ticket</h3>
                <p className="text-xs text-slate-500 mt-1">Tell us what's going on and the ProtectHealth desk will take it from here.</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Close form">
                <X size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4 text-left"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Building2 size={15} /></div>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls + " pl-10 appearance-none cursor-pointer"}>
                        <option value="">Select a department…</option>
                        {CONFIG.ticketDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">First name</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Last name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={inputCls} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail size={15} /></div>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="broker@agency.com" className={inputCls + " pl-10"} />
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Summary</label>
                    <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tell us what's going on…" className={inputCls + " resize-none"} />
                  </div>

                  {/* High priority */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" checked={highPriority} onChange={(e) => setHighPriority(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#067EB3] focus:ring-[#067EB3] cursor-pointer" />
                    <span className="text-sm text-slate-700 flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-500" /> Mark as high priority</span>
                  </label>

                  {/* File */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Attachment <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-dashed border-slate-300 rounded-xl py-2.5 px-4 cursor-pointer hover:border-[#067EB3] transition-colors">
                      <Paperclip size={15} className="text-slate-400" />
                      <span className="truncate">{file ? file.name : 'Attach a file'}</span>
                      <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>

                  <div className="pt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                      {isSubmitting ? (<><Loader2 size={16} className="animate-spin" /> Submitting…</>) : (<><Send size={15} /> Submit Ticket</>)}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div key="success" className="py-8 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="font-display text-lg font-bold text-slate-900 mb-2">Ticket submitted!</h4>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto mb-6">The ProtectHealth desk has it and will follow up by email. Here's your confirmation number.</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-xs mx-auto mb-8">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">Confirmation Number</span>
                    <span className="block text-xl font-bold font-mono text-[#067EB3] mt-1">{ticketNumber}</span>
                    <span className="block text-[11px] text-slate-500 mt-1">Sent to: {email}</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleReset} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">Submit Another</button>
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-[#067EB3] text-xs font-semibold text-white hover:bg-[#067EB3]/90 transition-colors cursor-pointer">Done</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
