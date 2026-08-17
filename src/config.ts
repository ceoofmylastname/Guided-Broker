/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Centralized configurations for easy adjustments and backend wiring.

export const CONFIG = {
  // ElevenLabs Agent ID — voice widget loads automatically once this is real.
  elevenLabsAgentId: "kl9lfoKsBZWGlVQLOoJy",

  // Deployed Cloudflare Pages domain. Leave "" to call same-origin "/api/search".
  // e.g. "https://guided-broker.pages.dev"
  apiBaseUrl: "",

  // true  = local mock search (no backend needed, good for demos)
  // false = real POST to `${apiBaseUrl}/api/search` (Pinecone RAG). Now LIVE.
  useMockSearch: false,

  // --- ProtectHealth dashboard (Supabase) ---
  // Ticket intake, the identity gate, and query logging all land here.
  supabaseUrl: "https://hrzonmnswzwridwqbspb.supabase.co",
  // Public anon key (safe to expose; row-level security governs access).
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyem9ubW5zd3p3cmlkd3Fic3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MTQ0NDcsImV4cCI6MjA2MzI5MDQ0N30.tGq9b0awwwTUBlwjCbOnlRDqUOV2NtQEUkBrU3gcbSo",

  // The real admin board. The concierge no longer ships its own — one board,
  // one source of truth, no drift between two views of the same table.
  adminBoardUrl: "https://www.protecthealth.com/admin/tickets",

  // Department options (must match the admin dashboard's list).
  ticketDepartments: [
    "Administrative", "Claims", "Commissions", "CRM Issues", "Group",
    "Individual", "Life", "Medicare", "NVHL Issues", "Other",
  ],
};
