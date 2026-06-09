/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, BookOpen, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketForm({ isOpen, onClose }: TicketFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('jrmenterprisegroup@gmail.com'); // Defaults to user email from metadata
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your directory name.');
    if (!email.trim() || !email.includes('@')) return setError('Please provide a valid business email.');
    if (!subject.trim()) return setError(' Please specify a help category / subject.');
    if (!message.trim()) return setError('Please describe the resource or portal you are searching for.');

    setIsSubmitting(true);

    // Simulate sending ticket to webhooks or backend
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      const generatedNum = `PH-2026-T${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketNumber(generatedNum);
    }, 1800);
  };

  const handleReset = () => {
    setName('');
    setSubject('');
    setMessage('');
    setIsSuccess(false);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Frosted glass overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Form Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] overflow-hidden z-10 p-6 md:p-8"
          >
            {/* Luminous accent ambient glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-tr from-[#067EB3] to-[#6D6F6E] rounded-full blur-3xl opacity-10 pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-teal-500 to-slate-200 rounded-full blur-3xl opacity-10 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 relative">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight">Open a Support Ticket</h3>
                <p className="text-xs text-slate-500 mt-1">Can't find a document? We'll track it down for you.</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="ticket-form"
                  onSubmit={handleSubmit}
                  className="space-y-4 text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Broker Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Business Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="broker@agency.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3] transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Inquiry / Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <BookOpen size={15} />
                      </div>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Missing Anthem Dental Quote rates or 2026 direct deposits"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3] transition-all"
                      />
                    </div>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      What are you looking for?
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please list as many details as possible (carrier name, commission month, state, etc.) so we can find this resource quickly."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3] transition-all resize-none"
                    />
                  </div>

                  {/* Footer Form Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Submitting Ticket...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Send Support Ticket
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-container"
                  className="py-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  
                  <h4 className="font-display text-lg font-bold text-slate-900 mb-2">Ticket Submitted Successfully!</h4>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto mb-6">
                    A ProtectHealth help specialist has been alerted. We are researching this file and will email you directly.
                  </p>

                  {/* Ticket confirmation tag */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-xs mx-auto mb-8">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      CONFIRMATION NUMBER
                    </span>
                    <span className="block text-xl font-bold font-mono text-[#067EB3] mt-1">
                      {ticketNumber}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1">
                      Sent to: {email}
                    </span>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Submit Another Ticket
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-[#067EB3] text-xs font-semibold text-white hover:bg-[#067EB3]/90 transition-colors cursor-pointer"
                    >
                      Back to Dashboard
                    </button>
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
