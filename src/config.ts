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
  // false = real POST to `${apiBaseUrl}/api/search` (Pinecone RAG). Flip once deployed.
  useMockSearch: true,
};
