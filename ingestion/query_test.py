#!/usr/bin/env python3
"""
Quick retrieval test — proves Pinecone is populated and search works,
without needing Cloudflare. Embeds your question with Gemini (RETRIEVAL_QUERY,
768d, normalized) and prints the top matches from Pinecone.

Run:  python ingestion/query_test.py "where are my 2026 commissions"
"""
import os, sys
import numpy as np
from pinecone import Pinecone
from google import genai
from google.genai import types

def _load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        for raw in open(env_path, encoding="utf-8"):
            line = raw.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
_load_env()

DIM = 768
gem = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
index = Pinecone(api_key=os.environ["PINECONE_API_KEY"]).Index(host=os.environ["PINECONE_INDEX_URL"])

def normalize(v):
    a = np.array(v, dtype=np.float32); n = np.linalg.norm(a)
    return (a / n).tolist() if n > 0 else a.tolist()

query = " ".join(sys.argv[1:]) or "where are my 2026 commissions"
res = gem.models.embed_content(
    model="gemini-embedding-2-preview", contents=[query],
    config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY", output_dimensionality=DIM))
vec = normalize(res.embeddings[0].values)

out = index.query(vector=vec, top_k=5, include_metadata=True)
print(f'\nQuery: "{query}"\n')
for i, m in enumerate(out.get("matches", []), 1):
    md = m.get("metadata", {})
    print(f'{i}. {md.get("title","?")}  (score {m.get("score"):.3f})')
    print(f'   link: {md.get("url","#")}')
    print(f'   directions: {md.get("directions","")}\n')
