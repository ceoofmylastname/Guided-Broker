/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Identity gate + usage logging for the GuidedBroker Resource Center.
 *
 * Nothing here talks to the database directly. Every call goes to the
 * `ph-concierge` edge function, which holds the service role and is the only
 * thing allowed to read `ph_agents` or write the session and query tables.
 *
 * Two ways in:
 *   1. The gate — broker types name + work email, matched against ph_agents.
 *   2. The CRM handoff — the "Ask Pete" button in the broker CRM mints a
 *      single-use `?h=` token, so a signed-in broker is never asked twice.
 */
import { CONFIG } from "../config";

const STORAGE_KEY = "gb_concierge_session";

export interface Identity {
  token: string;
  agentId: string;
  name: string;
}

/**
 * Deliberately a flat shape rather than a discriminated union: this project
 * compiles with `strict` off, and without strictNullChecks TypeScript will not
 * narrow a union on a literal boolean tag.
 */
export interface IdentifyResult {
  ok: boolean;
  identity?: Identity;
  message?: string;
}

function endpoint(): string {
  return `${CONFIG.supabaseUrl}/functions/v1/ph-concierge`;
}

async function call(body: Record<string, unknown>, jwt?: string): Promise<any> {
  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: CONFIG.supabaseAnonKey,
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(body),
  });
  try {
    return await res.json();
  } catch {
    return { ok: false, message: "The concierge is unavailable right now." };
  }
}

// ------------------------------------------------------------------ storage

export function loadStoredIdentity(): Identity | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.agentId) return null;
    return parsed as Identity;
  } catch {
    return null;
  }
}

function store(identity: Identity) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    /* private browsing — the session just won't survive a reload */
  }
}

export function clearIdentity() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

// ------------------------------------------------------------------- gate

/** Match a name + work email against the active broker roster. */
export async function identify(name: string, email: string): Promise<IdentifyResult> {
  const data = await call({ action: "identify", name, email });
  if (data?.ok && data.token) {
    const identity: Identity = {
      token: data.token,
      agentId: data.agent?.id ?? "",
      name: data.agent?.name ?? name,
    };
    store(identity);
    return { ok: true, identity };
  }
  return {
    ok: false,
    message: data?.message || "We couldn't verify that address. Try again.",
  };
}

/** Confirm a stored token is still good. Returns null if it has expired. */
export async function revalidate(token: string): Promise<Identity | null> {
  const data = await call({ action: "me", token });
  if (!data?.ok) {
    clearIdentity();
    return null;
  }
  return { token, agentId: data.agent?.id ?? "", name: data.agent?.name ?? "" };
}

/**
 * Redeem a single-use `?h=` handoff minted by the CRM. Strips the token from
 * the address bar on success so it can't be copied out of a screenshot.
 */
export async function redeemHandoffFromUrl(): Promise<Identity | null> {
  const params = new URLSearchParams(window.location.search);
  const handoff = params.get("h");
  if (!handoff) return null;

  const data = await call({ action: "redeem", handoff });

  params.delete("h");
  const clean = window.location.pathname + (params.toString() ? `?${params}` : "");
  window.history.replaceState({}, "", clean);

  if (!data?.ok || !data.token) return null;

  const identity: Identity = {
    token: data.token,
    agentId: data.agent?.id ?? "",
    name: data.agent?.name ?? "",
  };
  store(identity);
  return identity;
}

// -------------------------------------------------------------------- log

export interface QueryLog {
  query: string;
  channel: "text" | "voice";
  top?: { title?: string; url?: string; score?: number } | null;
  matchCount?: number;
  answered?: boolean;
}

/**
 * Record one question. Fire-and-forget on purpose: a logging failure must
 * never stop a broker from getting their answer.
 */
export function logQuery(token: string, entry: QueryLog): void {
  if (!token) return;
  try {
    void call({
      action: "log",
      token,
      query: entry.query,
      channel: entry.channel,
      top: entry.top ?? null,
      match_count: entry.matchCount ?? null,
      answered: entry.answered !== false,
    });
  } catch {
    /* noop */
  }
}
