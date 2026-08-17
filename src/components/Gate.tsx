/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Identity gate. Blocks the concierge until the visitor is matched against the
 * active broker roster in `ph_agents`. Build audit item 14.
 *
 * Brokers arriving from the CRM's "Ask Pete" button never see this — their
 * single-use handoff token identifies them before the app paints.
 */
import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Loader2, AlertCircle, LifeBuoy } from "lucide-react";
import { identify, Identity } from "../lib/identity";

interface GateProps {
  onVerified: (identity: Identity) => void;
  onOpenTicket: () => void;
}

export default function Gate({ onVerified, onOpenTicket }: GateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await identify(name.trim(), email.trim());
      if (res.ok && res.identity) {
        onVerified(res.identity);
      } else {
        setError(res.message || "We couldn't verify that address. Try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto">
      {/* Backdrop — opaque enough that the directory behind it is unreadable. */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        className="relative w-full max-w-md bg-white rounded-3xl border border-white/60 ring-1 ring-slate-200/70 shadow-[0_30px_70px_-20px_rgba(6,126,179,0.45)] p-7 md:p-9"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#067EB3]/10 text-[#067EB3]">
            <ShieldCheck size={18} />
          </span>
          <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
            Licensed brokers only
          </span>
        </div>

        <h2
          id="gate-title"
          className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          Verify your access
        </h2>
        <p className="text-slate-600 mt-2.5 text-sm leading-relaxed">
          The Resource Center holds commission tables, carrier credentials, and
          client-facing directories. Confirm the work email your ProtectHealth
          CRM login is under to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="gate-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Full name
            </label>
            <input
              id="gate-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Broker"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#067EB3]/30 focus:border-[#067EB3]/50 transition"
            />
          </div>

          <div>
            <label
              htmlFor="gate-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Work email
            </label>
            <input
              id="gate-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@protectnv.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#067EB3]/30 focus:border-[#067EB3]/50 transition"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-sm text-red-800"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={busy}
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed border border-white/10"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Checking the roster…
              </>
            ) : (
              "Enter the Resource Center"
            )}
          </motion.button>
        </form>

        <button
          type="button"
          onClick={onOpenTicket}
          className="mt-5 w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-[#067EB3] transition"
        >
          <LifeBuoy size={13} />
          Not on the roster yet? Open a ticket and we&rsquo;ll add you.
        </button>
      </motion.div>
    </div>
  );
}
