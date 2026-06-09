// Cloudflare Pages Function: POST /api/search
// Embeds the query with Gemini (768d, normalized) and queries Pinecone.
// Same endpoint the ElevenLabs `search_portal` tool and the website text box both call.
//
// Required env vars (Cloudflare Pages → Settings → Environment variables):
//   GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_URL

const GEMINI_MODEL = "gemini-embedding-2-preview";
const DIM = 768;

function normalize(v) {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n);
  return n > 0 ? v.map(x => x / n) : v;
}

async function embedQuery(query, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:embedContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${GEMINI_MODEL}`,
      content: { parts: [{ text: query }] },
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: DIM
    })
  });
  if (!res.ok) throw new Error("gemini " + res.status + " " + (await res.text()));
  const data = await res.json();
  const values = (data.embedding && data.embedding.values) || (data.embeddings && data.embeddings[0].values);
  return normalize(values);
}

async function queryPinecone(vector, topK, host, key) {
  const base = host.startsWith("http") ? host : "https://" + host;
  const res = await fetch(base.replace(/\/$/, "") + "/query", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Api-Key": key },
    body: JSON.stringify({ vector, topK, includeMetadata: true })
  });
  if (!res.ok) throw new Error("pinecone " + res.status + " " + (await res.text()));
  return res.json();
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function onRequestOptions() {
  return new Response(null, { headers: cors });
}

export async function onRequestPost({ request, env }) {
  try {
    const { query, top_k = 5 } = await request.json();
    if (!query || !query.trim()) {
      return Response.json({ error: "query required" }, { status: 400, headers: cors });
    }

    const vector = await embedQuery(query, env.GEMINI_API_KEY);
    const pc = await queryPinecone(vector, top_k, env.PINECONE_INDEX_URL, env.PINECONE_API_KEY);

    const matches = (pc.matches || []).map(m => ({
      title: m.metadata?.title || m.metadata?.file_name || "Resource",
      url: m.metadata?.url || "#",
      category: m.metadata?.category || "Resource",
      directions: m.metadata?.directions || "",
      snippet: (m.metadata?.text || "").slice(0, 220),
      score: m.score
    }));

    const top = matches[0];
    const body = {
      top_link: top ? { title: top.title, url: top.url, category: top.category, directions: top.directions } : null,
      answer: top
        ? `${top.title}. ${top.directions || ""}`.trim()
        : "I couldn't find a matching resource. Try the carrier name, or open a support ticket.",
      matches
    };
    return Response.json(body, { headers: cors });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: cors });
  }
}
