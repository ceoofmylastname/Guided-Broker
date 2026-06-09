/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Centralized configurations for easy adjustments and backend wiring.

export const CONFIG = {
  // Replace this with your actual ElevenLabs conversational agent ID
  elevenLabsAgentId: "YOUR_ELEVENLABS_AGENT_ID", 
  
  // API Configurations
  apiBaseUrl: "", // e.g. "https://api.yourdomain.com"
  
  // Toggle this to false to send real network POST requests to "/api/search"
  useMockSearch: true,
};
