import kagglehub
import os
import shutil

def download_datasets():
    print("🚀 Starting Quality Check Dataset Collection...")
    
    # Define datasets to download
    datasets = [
        "atharvaingle/fruit-and-vegetable-disease-healthy-vs-rotten",
        "smaranjitghose/fresh-and-rotten-fruits"
    ]
    
    base_data_dir = os.path.join("backend", "data", "quality_dataset")
    os.makedirs(base_data_dir, exist_ok=True)
    
    for ds in datasets:
        print(f"\n📦 Downloading {ds}...")
        try:
            path = kagglehub.dataset_download(ds)
            print(f"✅ Downloaded to: {path}")
            
            # Destination folder name based on dataset name
            ds_name = ds.split('/')[-1]
            dest_dir = os.path.join(base_data_dir, ds_name)
            
            # Since kagglehub might return a shared cache path, we might want to link or copy
            # For simplicity in training, we'll keep the path reference or copy if needed.
            print(f"📍 Dataset available at: {path}")
            
        except Exception as e:
            print(f"❌ Failed to download {ds}: {e}")

    print("\n✨ Dataset collection process completed!")
    print(f"Files are managed by kagglehub in its cache. You can use these paths for training.")

if __name__ == "__main__":
    download_datasets()
