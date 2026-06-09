/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONFIG } from '../config';
import { RESOURCES_DATA } from '../data/resources';
import { SearchResponse, ResourceItem } from '../types';

// Helper synonym mapping to improve the search experience
const SYNONYMS: { [key: string]: string[] } = {
  commissions: ["commission", "comission", "comms", "statement", "payout", "payment", "payouts", "statements", "2026", "money", "split", "deposit"],
  nvhl: ["nvhl", "nhl", "nevada health link administrative", "licensing", "appointment"],
  logo: ["logo", "branding", "assets", "vector", "style guide", "brand", "logotype", "images"],
  aca: ["aca", "obamacare", "marketplace", "exchange", "compliance", "federal", "on-exchange"],
  life: ["life", "underwriting", "death benefit", "whole life", "term life", "palic"],
  seg: ["seg", "state employee", "governmental", "group plan"],
  voluntary: ["voluntary", "ancillary", "supplemental", "vision", "dental", "critical illness", "short term", "accident"],
  aetna: ["aetna", "producer world", "aetna portal"],
  ambetter: ["ambetter", "centene", "ambetter portal", "ambetter login"],
  anthem: ["anthem", "toolbox", "blue cross", "anthem login", "anthem portal"],
  caresource: ["caresource", "caresource login", "caresource portal"],
  evolve: ["evolve", "molina", "hometown", "hometown health", "evolve login"],
  clearwater: ["clearwater", "clearwater ppo", "appoint", "appointed", "contracting", "ppo"],
  hpn: ["hpn", "health plan of nevada", "hpn login", "hpn portal"],
  meeting: ["meeting", "room", "reservation", "reservations", "schedule", "reserve", "book", "google meet", "calendar", "conference"],
  newera: ["new era", "newera", "phila", "philadelphia american", "palic"],
  selecthealth: ["select health", "selecthealth", "selecthealth login", "selecthealth portal"]
};

/**
 * Searches the ProtectHealth GuidedBroker resources database.
 * Supports either client-side dynamic search or real POST queries to /api/search.
 */
export async function searchResources(query: string, topK: number = 5): Promise<SearchResponse> {
  const trimmed = query.trim().toLowerCase();

  // If mock is disabled, perform real flight request to /api/search
  if (!CONFIG.useMockSearch) {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, top_k: topK })
      });
      if (!response.ok) {
        throw new Error(`HTTP Search Error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Failed to search real backend API. Falling back to local search.", err);
      // Fallback to mock search on error so the app doesn't break
    }
  }

  // --- LOCAL HIGH-FIDELITY SEARCH ALGORITHM ---
  if (!trimmed) {
    return {
      answer: "Please enter or speak a question to begin.",
      top_link: null,
      matches: []
    };
  }

  // Score each resource based on content and synonyms match to rank results
  const itemsWithScores = RESOURCES_DATA.map(item => {
    let score = 0;
    
    // Exact title match gets huge weight
    const itemTitle = item.title.toLowerCase();
    const itemDesc = item.description.toLowerCase();
    const itemId = item.id.toLowerCase();
    
    // Substring searches
    if (itemTitle.includes(trimmed)) score += 20;
    if (itemDesc.includes(trimmed)) score += 10;
    
    // Split the query into terms for word overlap
    const queryWords = trimmed.split(/[\s,.\-/?]+/);
    
    queryWords.forEach(word => {
      if (word.length < 2) return; // Ignore single characters
      
      // Direct matches on title word
      if (itemTitle.includes(word)) score += 5;
      if (itemDesc.includes(word)) score += 2;
      if (itemId.includes(word)) score += 4;
      
      // Synonym mappings
      Object.keys(SYNONYMS).forEach(synKey => {
        const synList = SYNONYMS[synKey];
        if (synList.includes(word) || word.includes(synKey)) {
          // If this item represents this synonym key
          const represents = 
            itemId.includes(synKey) ||
            itemTitle.includes(synKey) ||
            (synKey === 'newera' && (item.id === 'palic-new-era' || item.id === 'new-era-training')) ||
            (synKey === 'aca' && (item.category === 'administrative' ? item.id === 'nvhl' : true));
            
          if (represents) {
            score += 15;
          }
        }
      });
    });
    
    // Normalize score
    return { item, score };
  });

  // Filter out items with score of 0, sort in descending order
  const ranked = itemsWithScores
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // If nothing matched, perform a fallback simple matching or return a generic guide
  if (ranked.length === 0) {
    return {
      answer: `I searched the database for "${query}" but couldn't find an exact resource. Try asking for "commissions", "Ambetter broker portal", or search our browsable grid below!`,
      top_link: null,
      matches: RESOURCES_DATA.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        category: item.category,
        score: 0.1,
        snippet: item.description
      }))
    };
  }

  const topMatch = ranked[0].item;
  const topScore = ranked[0].score;

  // Synthesize conversational plain-language answers based on matched resources
  let synthesizedAnswer = "";
  let directionText = "";

  switch (topMatch.id) {
    case "commissions":
      synthesizedAnswer = "Your 2026 commission statement history, payment schedules, and direct deposit details reside safely in our Administrative directory. Click 'Open Commissions Storage' below to review your files.";
      directionText = "Under 'Administrative', select the 'Commissions Documents & Statements' panel.";
      break;
    case "nvhl":
      synthesizedAnswer = "The Nevada Health Link administrative guide and agent appointment documentation can be viewed instantly below.";
      directionText = "Go to the 'Administrative' column and select 'NVHL Portal Info'.";
      break;
    case "ph-logo":
      synthesizedAnswer = "ProtectHealth's vector files, master logos, and B&C brand guidelines are ready for download in our shared vector folders.";
      directionText = "Open the 'ProtectHealth Official Brand Assets' under Administrative.";
      break;
    case "aca-item":
      synthesizedAnswer = "You can access the ACA Compliance handbook and certification preparation resources directly. It includes a deep dive into marketplace requirements.";
      directionText = "Select 'ACA Compliance & Sales Certification' under Support & Training.";
      break;
    case "life-item":
      synthesizedAnswer = "The Sales Suite and Underwriting Guidelines for Life Insurance plans are available below. This contains rate calculators and client brochures.";
      directionText = "Head to 'Support & Training' and click 'Life Insurance Sales Suite'.";
      break;
    case "seg-item":
      synthesizedAnswer = "State Employee Group (SEG) detailed benefit files and compliance configs are available for your training.";
      directionText = "Look under 'Support & Training' and open 'SEG Benefit Guidelines'.";
      break;
    case "voluntary-item":
      synthesizedAnswer = "Training guides for voluntary and ancillary benefits (such as vision/dental add-ons) are ready for you.";
      directionText = "See 'Voluntary & Ancillary Supplemental Training' under Support & Training.";
      break;
    case "dir-aca":
      synthesizedAnswer = "Here is the ACA Directory containing direct phone contacts, support directories, and dedicated agent support lanes.";
      directionText = "Under 'Directory', select 'ACA Directory & Provider Network'.";
      break;
    case "dir-dental-vision":
      synthesizedAnswer = "I found the dental and vision provider networks contact listings. This sheet contains claim filing addresses.";
      directionText = "Open 'Dental & Vision Provider Networks Directory' under the Directory shelf.";
      break;
    case "dir-life":
      synthesizedAnswer = "The phone list and claim hotlines for our partner Life Insurance carrier groups are available inside the directory folder.";
      directionText = "Choose 'Life Insurance Partner Carrier Contact List' under Directory.";
      break;
    case "dir-off-exchange":
      synthesizedAnswer = "Private off-exchange specialized benefits list and insurer support links can be opened below.";
      directionText = "Click 'Off-Exchange Specialized Plan Directory' inside Directory.";
      break;
    case "dir-seg":
      synthesizedAnswer = "The contact details, help emails, and liaison lines for the SEG Benefit Office are mapped below.";
      directionText = "Open 'SEG Administrative Directory & Core Contacts' under Directory.";
      break;
    case "dir-voluntary":
      synthesizedAnswer = "The voluntary insurer and ancillary support list (billing desks, client portals) is available.";
      directionText = "Open the 'Voluntary & Ancillary Insurer Directory' card under Directory.";
      break;
    case "ambetter-portal":
      synthesizedAnswer = "The external Ambetter Health Broker Portal is a popular link. You can look up active ACA enrollments, member rosters, and update client details on their official site.";
      directionText = "Located under 'Important Links' as 'Ambetter Broker Portal'. Opens in a new browser tab.";
      break;
    case "aetna-producer":
      synthesizedAnswer = "To check your Aetna credentials, write plans, or generate small group quotes, click on 'Open Portal' below to launch Aetna Producer World.";
      directionText = "Located under 'Important Links' as 'Aetna Producer World'.";
      break;
    case "anthem-toolbox":
      synthesizedAnswer = "I've located the Anthem Broker Toolbox portal link. This is where you calculate rates, look up renewals, and manage active member details.";
      directionText = "Located under 'Important Links' as 'Anthem Broker Toolbox'.";
      break;
    case "caresource":
      synthesizedAnswer = "The official CareSource Broker and Producer platform link is ready. Use this login page to verify client status and plan coverages.";
      directionText = "Located under 'Important Links' as 'CareSource Broker login'.";
      break;
    case "evolve-molina":
      synthesizedAnswer = "Access Molina and HomeTown Health systems via the shared Evolve Broker Portal. Click through to open the login page.";
      directionText = "Located under 'Important Links' as 'Evolve Portal'.";
      break;
    case "clearwater-ppo":
      synthesizedAnswer = "Onboarding, licensing details, and broker appointments for Clearwater PPO schedules are accessible via the link below.";
      directionText = "Select 'Get Appointed to Sell Clearwater PPO' under Important Links.";
      break;
    case "hpn-portal":
      synthesizedAnswer = "The Health Plan of Nevada (HPN) Broker login can be accessed below. This lets you manage state-specific commercial and marketplace accounts.";
      directionText = "Select 'Health Plan of Nevada Broker Portal' under Important Links.";
      break;
    case "meeting-reservations":
      synthesizedAnswer = "We use an electronic scheduling portal to book physical conference facilities, broker presentations, and study desks. Launch it below.";
      directionText = "Select 'Meeting Room Reservations' under Important Links.";
      break;
    case "nevada-link-login":
      synthesizedAnswer = "To check on-exchange enrollments for Nevada residents, log in to the Nevada Health Link Broker platform. Click below to open.";
      directionText = "Select 'Nevada Health Link Broker Login' under Important Links.";
      break;
    case "new-era-training":
      synthesizedAnswer = "You can download New Era Life's agent documents, handbook booklets, and commission sign-up sheets.";
      directionText = "Select 'New Era Documents & Training' under Important Links.";
      break;
    case "palic-new-era":
      synthesizedAnswer = "Log in to the PALIC (Philadelphia American) / New Era broker engine to write supplement policies and verify commissions on existing lines.";
      directionText = "Select 'PALIC / New Era Broker Login' under Important Links.";
      break;
    case "protecthealth-home":
      synthesizedAnswer = "The parent website for ProtectHealth and corporate details can be visited below.";
      directionText = "Select 'ProtectHealth Broker Platform' under Important Links.";
      break;
    case "selecthealth-portal":
      synthesizedAnswer = "Log in to the SelectHealth Broker Portal to obtain plans, quote small group designs, and check eligibility lists.";
      directionText = "Select 'SelectHealth Broker Portal' under Important Links.";
      break;
    default:
      synthesizedAnswer = `I found a great fit! "${topMatch.title}" appears highly relevant to your query. You can read details and open the document below.`;
      directionText = `Refer to the resource titled "${topMatch.title}" in the categorized section.`;
  }

  // Map other matching nodes to secondary matching list
  const matches = ranked.slice(0, topK).map(r => ({
    id: r.item.id,
    title: r.item.title,
    url: r.item.url,
    category: r.item.category,
    score: parseFloat((r.score / 50).toFixed(2)), // simple normalized scoring
    snippet: r.item.description
  }));

  return {
    answer: synthesizedAnswer,
    top_link: {
      title: topMatch.title,
      url: topMatch.url,
      category: topMatch.category,
      directions: directionText
    },
    matches: matches
  };
}
