import pandas as pd
from datasets import load_dataset
import os

print("Downloading dataset...")
subsets = ['agents', 'categories', 'comments', 'tickets']

output_dir = "dataset"
os.makedirs(output_dir, exist_ok=True)

for subset in subsets:
    print(f"Loading {subset}...")
    ds = load_dataset("mindweave/help-desk-tickets", subset)
    
    # Usually it's in the 'train' split
    if 'train' in ds:
        df = ds['train'].to_pandas()
    else:
        # Get the first available split
        first_split = list(ds.keys())[0]
        df = ds[first_split].to_pandas()
        
    csv_path = os.path.join(output_dir, f"{subset}.csv")
    df.to_csv(csv_path, index=False)
    
    print(f"--- {subset.upper()} (first 3 rows) ---")
    print(df.head(3))
    print(f"Saved to {csv_path}\n")

print("Done!")
