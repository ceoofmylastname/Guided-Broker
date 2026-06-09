#!/usr/bin/env python3
"""
GuidedBroker Concierge — ingestion pipeline.
Parses every doc in knowledge-base/, plus every row in sources.csv, embeds with
gemini-embedding-2-preview (768d, normalized), and upserts to Pinecone.

Run:  python ingest.py
Env:  GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_URL, LLAMA_PARSE_API_KEY
"""
import os, csv, glob, time, hashlib
import numpy as np
from pinecone import Pinecone
from google import genai
from google.genai import types

# Auto-load .env from the repo root so `python ingestion/ingest.py` just works.
def _load_env():
    here = os.path.dirname(__file__)
    env_path = os.path.join(here, "..", ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
_load_env()

GEMINI_API_KEY     = os.environ["GEMINI_API_KEY"]
PINECONE_API_KEY   = os.environ["PINECONE_API_KEY"]
PINECONE_INDEX_URL = os.environ["PINECONE_INDEX_URL"]
LLAMA_PARSE_API_KEY = os.environ.get("LLAMA_PARSE_API_KEY")

KB_DIR   = os.path.join(os.path.dirname(__file__), "..", "knowledge-base")
SOURCES  = os.path.join(os.path.dirname(__file__), "sources.csv")
DIM      = 768

gem = genai.Client(api_key=GEMINI_API_KEY)
pc  = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(host=PINECONE_INDEX_URL)


def normalize(v):
    arr = np.array(v, dtype=np.float32)
    n = np.linalg.norm(arr)
    return (arr / n).tolist() if n > 0 else arr.tolist()


def embed(texts, task_type):
    out = []
    for i in range(0, len(texts), 50):
        batch = texts[i:i + 50]
        res = gem.models.embed_content(
            model="gemini-embedding-2-preview",
            contents=batch,
            config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=DIM),
        )
        out.extend(normalize(e.values) for e in res.embeddings)
        time.sleep(0.3)
    return out


def load_sources():
    """sources.csv maps a folder/category to a real URL + spoken directions."""
    rows = []
    if not os.path.exists(SOURCES):
        return rows
    with open(SOURCES, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append(r)
    return rows


def category_for(path):
    """Derive category from the knowledge-base sub-folder."""
    rel = os.path.relpath(path, KB_DIR).replace("\\", "/")
    parts = rel.split("/")
    return "/".join(parts[:2]) if len(parts) >= 2 else parts[0]


def chunk(text, size=1800, overlap=200):
    """Char-based chunking (~512 tokens). Swap in LlamaIndex SentenceSplitter if installed."""
    out, i = [], 0
    while i < len(text):
        out.append(text[i:i + size])
        i += size - overlap
    return [c for c in out if c.strip()]


def parse_file(path):
    """PDFs via pypdf (works on Python 3.9); txt/md read directly.
    Set USE_LLAMA_PARSE=1 (and have Python 3.10+) to use LlamaParse for higher fidelity."""
    ext = os.path.splitext(path)[1].lower()
    if ext in (".txt", ".md"):
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read()
    if ext == ".pdf":
        if LLAMA_PARSE_API_KEY and os.environ.get("USE_LLAMA_PARSE") == "1":
            from llama_parse import LlamaParse
            parser = LlamaParse(api_key=LLAMA_PARSE_API_KEY, result_type="markdown")
            docs = parser.load_data(path)
            return "\n\n".join(d.text for d in docs)
        from pypdf import PdfReader
        reader = PdfReader(path)
        return "\n\n".join((page.extract_text() or "") for page in reader.pages)
    print(f"  ! skipped {path} (unsupported type {ext})")
    return ""


def vid(*parts):
    return hashlib.sha1("::".join(parts).encode()).hexdigest()[:24]


def main():
    sources = load_sources()
    src_by_cat = {s.get("category", "").strip(): s for s in sources}
    vectors = []

    # 1) Every source row becomes its own searchable vector (so thin folders still return a link).
    if sources:
        texts = [f"{s['title']}. {s.get('description','')}" for s in sources]
        embs = embed(texts, "RETRIEVAL_DOCUMENT")
        for s, e in zip(sources, embs):
            vectors.append({"id": vid("src", s["title"]), "values": e, "metadata": {
                "text": texts[sources.index(s)], "title": s["title"], "url": s.get("url", "#"),
                "category": s.get("category", ""), "directions": s.get("directions", ""), "kind": "link"}})
        print(f"Embedded {len(sources)} source links.")

    # 2) Every document in the knowledge base, chunked + tagged with its category's URL/directions.
    files = [p for p in glob.glob(os.path.join(KB_DIR, "**", "*"), recursive=True) if os.path.isfile(p)]
    for path in files:
        cat = category_for(path)
        src = src_by_cat.get(cat, {})
        raw = parse_file(path)
        if not raw.strip():
            continue
        chunks = chunk(raw)
        embs = embed(chunks, "RETRIEVAL_DOCUMENT")
        fname = os.path.basename(path)
        for j, (c, e) in enumerate(zip(chunks, embs)):
            vectors.append({"id": vid(path, str(j)), "values": e, "metadata": {
                "text": c, "title": src.get("title", cat), "url": src.get("url", "#"),
                "category": cat, "directions": src.get("directions", ""),
                "file_name": fname, "kind": "doc"}})
        print(f"  {fname}: {len(chunks)} chunks ({cat})")

    if not vectors:
        print("Nothing to upsert. Add files to knowledge-base/ and rows to sources.csv.")
        return

    for i in range(0, len(vectors), 100):
        index.upsert(vectors=vectors[i:i + 100])
        print(f"Upserted {min(i + 100, len(vectors))}/{len(vectors)}")
    print("Done.")


if __name__ == "__main__":
    main()
