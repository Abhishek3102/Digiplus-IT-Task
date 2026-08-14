import os
import pandas as pd
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

load_dotenv(".env")
load_dotenv("../.env")

# Map API keys
if "GOOGLE_API_KEY" not in os.environ and "GEMINI_API_KEY" in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

print("Loading CSVs...")
tickets = pd.read_csv("dataset/tickets.csv")
categories = pd.read_csv("dataset/categories.csv")
comments = pd.read_csv("dataset/comments.csv")

if 'category_id' in tickets.columns and 'id' in categories.columns:
    tickets = tickets.merge(categories, left_on="category_id", right_on="id", how="left", suffixes=("", "_cat"))
    
comments_grouped = comments.groupby("ticket_id")["body"].apply(lambda x: " | ".join([str(item) for item in x])).reset_index()
tickets = tickets.merge(comments_grouped, on="ticket_id", how="left")

docs = []
for _, row in tickets.iterrows():
    title = row.get("title", "") or row.get("subject", "") or f"Ticket {row['ticket_id']}"
    desc = row.get("description", "")
    cat_name = row.get("name", "Unknown Category")
    resolution = row.get("body", "No resolution comments")
    
    content = f"Issue: {title}\nCategory: {cat_name}\nDescription: {desc}\nResolution Context: {resolution}"
    metadata = {"ticket_id": row["ticket_id"], "category": cat_name}
    docs.append(Document(page_content=content, metadata=metadata))

print(f"Total documents created: {len(docs)}")

SAMPLE_SIZE = min(50, len(docs))
sampled_docs = docs[:SAMPLE_SIZE]
print(f"Embedding {SAMPLE_SIZE} documents into Qdrant...")

embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2") # or text-embedding-004
# Using gemini-embedding-2 as requested, we'll see if it fails. If so, we'll try something else.

qdrant_url = os.environ.get("QDRANT_URL")
qdrant_api_key = os.environ.get("QDRANT_API_KEY")

qdrant_host = qdrant_url.replace("https://", "").replace("http://", "").split(":")[0]

qdrant_client = QdrantClient(
    host=qdrant_host,
    port=443,
    https=True,
    api_key=qdrant_api_key,
    timeout=60.0
)

import time

batch_size = 15
for i in range(0, len(sampled_docs), batch_size):
    batch = sampled_docs[i:i+batch_size]
    print(f"Uploading batch {i//batch_size + 1}... ({len(batch)} documents)")
    
    QdrantVectorStore.from_documents(
        batch,
        embeddings,
        url=f"https://{qdrant_host}:443",
        api_key=qdrant_api_key,
        collection_name="kb_embeddings",
        force_recreate=(i == 0) # Only recreate on first batch
    )
    
    if i + batch_size < len(sampled_docs):
        print("Sleeping 30 seconds to respect Gemini Free Tier rate limits...")
        time.sleep(30)

print("Qdrant seeding completed successfully!")
