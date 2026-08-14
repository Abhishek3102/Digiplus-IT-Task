import os
import pandas as pd
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document

# Load env variables (for GEMINI_API_KEY)
load_dotenv(".env")
load_dotenv("../.env")

import os
if "GOOGLE_API_KEY" not in os.environ and "GEMINI_API_KEY" in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

print("Loading CSVs...")
tickets = pd.read_csv("dataset/tickets.csv")
categories = pd.read_csv("dataset/categories.csv")
comments = pd.read_csv("dataset/comments.csv")

# Merge tickets with categories
# tickets has 'category_id', categories has 'id'
if 'category_id' in tickets.columns and 'id' in categories.columns:
    tickets = tickets.merge(categories, left_on="category_id", right_on="id", how="left", suffixes=("", "_cat"))
    
# Group comments by ticket_id
comments_grouped = comments.groupby("ticket_id")["body"].apply(lambda x: " | ".join([str(item) for item in x])).reset_index()

# Merge comments into tickets
tickets = tickets.merge(comments_grouped, on="ticket_id", how="left")

docs = []
print("Creating documents...")
for _, row in tickets.iterrows():
    # Build text representation
    title = row.get("title", "") or row.get("subject", "") or f"Ticket {row['ticket_id']}"
    desc = row.get("description", "")
    cat_name = row.get("name", "Unknown Category")
    resolution = row.get("body", "No resolution comments")
    
    content = f"Issue: {title}\nCategory: {cat_name}\nDescription: {desc}\nResolution Context: {resolution}"
    
    metadata = {
        "ticket_id": row["ticket_id"],
        "category": cat_name
    }
    
    docs.append(Document(page_content=content, metadata=metadata))

print(f"Total documents created: {len(docs)}")

# To avoid long running times and API rate limits, let's take a sample of 100 documents for this proof-of-concept
# In production, you would process the full dataset (possibly in batches with a delay)
SAMPLE_SIZE = min(200, len(docs))
sampled_docs = docs[:SAMPLE_SIZE]
print(f"Embedding {SAMPLE_SIZE} sampled documents into FAISS...")

embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2")
vectorstore = FAISS.from_documents(sampled_docs, embeddings)

os.makedirs("faiss_index", exist_ok=True)
vectorstore.save_local("faiss_index")
print("FAISS index saved successfully to faiss_index/")
