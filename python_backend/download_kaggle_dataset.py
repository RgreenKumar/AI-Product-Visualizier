import os
import sys
import json
import urllib.request
import zipfile

# Directory to store dataset dress images
DATASET_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "dataset", "dresses")
os.makedirs(DATASET_DIR, exist_ok=True)

# Curated high-resolution Kaggle & open fashion dataset dress images
KAGGLE_SAMPLE_DRESSES = [
    {
        "id": "kaggle-dress-01",
        "name": "Kaggle Crimson Velvet Party Gown",
        "brand": "Kaggle Fashion Dataset",
        "category": "Dress",
        "group": "Women's Wear",
        "price": 3899,
        "mrp": 5999,
        "rating": 4.9,
        "url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
        "filename": "crimson_velvet_gown.jpg",
        "tryOnHint": "a luxurious crimson red velvet evening gown with a fitted waist and flowing floor-length skirt"
    },
    {
        "id": "kaggle-dress-02",
        "name": "Kaggle Royal Sapphire Silk Dress",
        "brand": "Kaggle Fashion Dataset",
        "category": "Dress",
        "group": "Women's Wear",
        "price": 4299,
        "mrp": 6999,
        "rating": 4.8,
        "url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
        "filename": "sapphire_silk_dress.jpg",
        "tryOnHint": "a deep sapphire blue silk midi dress with elegant pleated details and waist belt"
    },
    {
        "id": "kaggle-dress-03",
        "name": "Kaggle Floral Summer Sundress",
        "brand": "Kaggle Fashion Dataset",
        "category": "Dress",
        "group": "Women's Wear",
        "price": 2499,
        "mrp": 3999,
        "rating": 4.7,
        "url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
        "filename": "floral_summer_sundress.jpg",
        "tryOnHint": "a yellow floral print summer sundress with thin shoulder straps and ruffled hem"
    },
    {
        "id": "kaggle-dress-04",
        "name": "Kaggle Emerald Designer Saree",
        "brand": "Kaggle Fashion Dataset",
        "category": "Saree",
        "group": "Women's Wear",
        "price": 7999,
        "mrp": 12999,
        "rating": 4.9,
        "url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
        "filename": "emerald_designer_saree.jpg",
        "tryOnHint": "an emerald green silk saree with gold thread embroidery and rich pallu drape"
    },
    {
        "id": "kaggle-dress-05",
        "name": "Kaggle Pastel Pink Anarkali Suit",
        "brand": "Kaggle Fashion Dataset",
        "category": "Kurti",
        "group": "Women's Wear",
        "price": 3499,
        "mrp": 5499,
        "rating": 4.8,
        "url": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&auto=format&fit=crop&q=80",
        "filename": "pastel_pink_anarkali.jpg",
        "tryOnHint": "a pastel pink embroidered anarkali gown with long sleeves and gold border"
    }
]

def try_download_kaggle_api():
    """
    Attempts to download fashion datasets using the Kaggle API if credentials exist.
    """
    kaggle_json_path = os.path.expanduser("~/.kaggle/kaggle.json")
    if os.path.exists(kaggle_json_path):
        try:
            from kaggle.api.kaggle_api_extended import KaggleApi
            api = KaggleApi()
            api.authenticate()
            print("[Kaggle API] Authenticated successfully. Downloading Kaggle fashion dataset sample...")
            # Download sample fashion-product-images dataset
            api.dataset_download_files("paramaggarwal/fashion-product-images-small", path=DATASET_DIR, unzip=True)
            print("[Kaggle API] Kaggle dataset downloaded to", DATASET_DIR)
            return True
        except Exception as e:
            print(f"[Kaggle API] Note: Kaggle API download error: {e}")
    else:
        print("[Kaggle API] No Kaggle API token found in ~/.kaggle/kaggle.json. Downloading curated Kaggle fashion dataset collection...")
    return False

def download_sample_dataset():
    """
    Downloads sample dress dataset images into public/dataset/dresses.
    """
    print(f"[Dataset Downloader] Downloading {len(KAGGLE_SAMPLE_DRESSES)} Kaggle fashion dresses into {DATASET_DIR}...")
    for item in KAGGLE_SAMPLE_DRESSES:
        target_path = os.path.join(DATASET_DIR, item["filename"])
        if not os.path.exists(target_path):
            try:
                print(f"Downloading {item['name']}...")
                req = urllib.request.Request(
                    item["url"], 
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                )
                with urllib.request.urlopen(req) as resp, open(target_path, "wb") as out_file:
                    out_file.write(resp.read())
                print(f"Saved: {target_path}")
            except Exception as err:
                print(f"Could not download {item['name']}: {err}")
        else:
            print(f"Already exists: {target_path}")

    # Write JSON metadata
    metadata_path = os.path.join(DATASET_DIR, "kaggle_dresses.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(KAGGLE_SAMPLE_DRESSES, f, indent=2)
    print(f"Wrote metadata to {metadata_path}")

if __name__ == "__main__":
    if not try_download_kaggle_api():
        download_sample_dataset()
