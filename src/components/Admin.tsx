/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * In-app admin dashboard. Logs admins in via Supabase Auth, verifies their
 * admin role against the database (so all DB admins work), and lists every
 * ticket from the shared `tickets` table — replacing the external Lovable portal.
 */
import React, { useEffect, useState } from 'react';
import {
  Loader2, LogOut, RefreshCw, Search, ShieldCheck, AlertCircle,
  X, Paperclip, AlertTriangle, Mail, Building2, Clock, Inbox,
} from 'lucide-react';
import { CONFIG } from '../config';

interface Ticket {
  id: string;
  ticket_id: string;
  department: string;
  first_name: string;
  last_name: string;
  email: string;
  summary: string;
  high_priority: boolean;
  file_name: string | null;
  created_at: string;
}

const SESSION_KEY = 'ph_admin_token';

const authHeaders = (token: string) => ({
  apikey: CONFIG.supabaseAnonKey,
  Authorization: `Bearer ${token}`,
});

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [onlyHigh, setOnlyHigh] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);

  useEffect(() => { if (token) loadTickets(token); /* eslint-disable-next-line */ }, []);

  async function loadTickets(t: string) {
    setLoading(true); setError('');
    try {
      const res = await fetch(
        `${CONFIG.supabaseUrl}/rest/v1/tickets?select=*&order=created_at.desc`,
        { headers: authHeaders(t) }
      );
      if (res.status === 401) { signOut(); setLoginError('Session expired — please sign in again.'); return; }
      if (!res.ok) throw new Error('Could not load tickets (' + res.status + ')');
      setTickets(await res.json());
    } catch (e: any) {
      setError(e?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(''); setLoggingIn(true);
    try {
      const res = await fetch(`${CONFIG.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: CONFIG.supabaseAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) {
        setLoginError(data.error_description || data.msg || 'Invalid email or password.');
        return;
      }
      // Verify this user actually has the admin role in the database.
      const roleRes = await fetch(
        `${CONFIG.supabaseUrl}/rest/v1/user_roles?select=role&role=eq.admin`,
        { headers: authHeaders(data.access_token) }
      );
      const roles = roleRes.ok ? await roleRes.json() : [];
      if (!Array.isArray(roles) || roles.length === 0) {
        setLoginError('This account is not an admin.');
        return;
      }
      sessionStorage.setItem(SESSION_KEY, data.access_token);
      setToken(data.access_token);
      setPassword('');
      loadTickets(data.access_token);
    } catch (err: any) {
      setLoginError('Sign-in failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null); setTickets([]); setSelected(null);
  }

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch { return iso; }
  };

  const filtered = tickets.filter((t) => {
    if (onlyHigh && !t.high_priority) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [t.ticket_id, t.first_name, t.last_name, t.email, t.department, t.summary]
      .some((v) => (v || '').toLowerCase().includes(q));
  });

  // ---- LOGIN SCREEN ----
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.10)] p-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#067EB3] to-[#7c3aed] text-white"><ShieldCheck size={18} /></div>
            <h1 className="font-display text-xl font-extrabold text-slate-900">Admin Sign In</h1>
          </div>
          <p className="text-xs text-slate-500 mb-6">GuidedBroker support ticket dashboard.</p>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" /><span>{loginError}</span>
            </div>
          )}

          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@protectnv.com"
            className="w-full mb-4 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3]" />

          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full mb-6 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3]" />

          <button type="submit" disabled={loggingIn}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#067EB3] to-[#6D6F6E] text-white shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
            {loggingIn ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
          </button>
          <a href="/" className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-4">← Back to site</a>
        </form>
      </div>
    );
  }

  // ---- DASHBOARD ----
  const highCount = tickets.filter((t) => t.high_priority).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#067EB3] to-[#7c3aed] text-white"><Inbox size={18} /></div>
            <div>
              <h1 className="font-display text-base font-extrabold text-slate-900 leading-tight">Support Tickets</h1>
              <p className="text-[11px] text-slate-500">{tickets.length} total · {highCount} high priority</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => token && loadTickets(token)} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#067EB3] hover:border-[#067EB3]/40 transition-colors cursor-pointer" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={signOut} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Search size={16} /></div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, department, summary, ticket ID…"
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#067EB3] focus:ring-1 focus:ring-[#067EB3]" />
          </div>
          <button onClick={() => setOnlyHigh((v) => !v)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer flex items-center gap-2 ${onlyHigh ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <AlertTriangle size={14} /> High priority only
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={14} /><span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading && tickets.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-400"><Loader2 size={28} className="animate-spin text-[#067EB3]" /><span className="text-sm">Loading tickets…</span></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">No tickets {search || onlyHigh ? 'match your filters' : 'yet'}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                    <th className="px-4 py-3 font-semibold">Ticket</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Department</th>
                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Summary</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => (
                    <tr key={t.id} onClick={() => setSelected(t)} className="hover:bg-[#067EB3]/[0.03] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#067EB3] font-semibold whitespace-nowrap">{t.ticket_id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{t.first_name} {t.last_name}</div>
                        <div className="text-xs text-slate-400">{t.email}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-600">{t.department}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500 max-w-xs truncate">{t.summary}</td>
                      <td className="px-4 py-3">
                        {t.high_priority
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">HIGH</span>
                          : <span className="text-[10px] text-slate-400 font-mono">normal</span>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-slate-500 whitespace-nowrap">{fmt(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X size={18} /></button>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-[#067EB3] font-bold">{selected.ticket_id}</span>
              {selected.high_priority && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700"><AlertTriangle size={10} /> HIGH</span>}
            </div>
            <h3 className="font-display text-xl font-extrabold text-slate-900 mb-4">{selected.first_name} {selected.last_name}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Mail size={15} className="text-slate-400" /> <a href={`mailto:${selected.email}`} className="text-[#067EB3] hover:underline">{selected.email}</a></div>
              <div className="flex items-center gap-2 text-slate-600"><Building2 size={15} className="text-slate-400" /> {selected.department}</div>
              <div className="flex items-center gap-2 text-slate-600"><Clock size={15} className="text-slate-400" /> {fmt(selected.created_at)}</div>
              <div className="pt-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono mb-1">Summary</div>
                <p className="text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-wrap">{selected.summary}</p>
              </div>
              {selected.file_name && (
                <a href={`${CONFIG.supabaseUrl}/storage/v1/object/public/ticket-files/${selected.file_name}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#067EB3] hover:underline pt-1">
                  <Paperclip size={15} /> View attachment
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
