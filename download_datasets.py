import os
import sys
import urllib.request

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

DATASETS = [
    {
        "name": "DataCo Smart Supply Chain Dataset",
        "filename": os.path.join(DATA_DIR, "DataCoSupplyChainDataset.csv"),
        "url": "https://raw.githubusercontent.com/swapnilsaurav/MachineLearning/master/DataCoSupplyChainDataset.csv"
    }
]

def download_with_progress(url, filename, name):
    print(f"[*] Starting download: {name}")
    print(f"    Target: {filename}")
    
    def reporthook(count, block_size, total_size):
        if total_size > 0:
            percent = int(count * block_size * 100 / total_size)
            downloaded_mb = (count * block_size) / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            sys.stdout.write(f"\r    Progress: {percent}% ({downloaded_mb:.1f}/{total_mb:.1f} MB)")
            sys.stdout.flush()
        else:
            downloaded_mb = (count * block_size) / (1024 * 1024)
            sys.stdout.write(f"\r    Downloaded: {downloaded_mb:.1f} MB")
            sys.stdout.flush()

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
            meta = response.info()
            total_size = int(meta.get("Content-Length", 0))
            block_size = 1024 * 64
            count = 0
            while True:
                buf = response.read(block_size)
                if not buf:
                    break
                out_file.write(buf)
                count += 1
                reporthook(count, block_size, total_size)
        print(f"\n[+] Successfully saved {filename}!\n")
        return True
    except Exception as e:
        print(f"\n[-] Error downloading {name}: {e}\n")
        return False

if __name__ == "__main__":
    for ds in DATASETS:
        if os.path.exists(ds["filename"]):
            print(f"[=] {ds['name']} already exists at {ds['filename']}.")
        else:
            download_with_progress(ds["url"], ds["filename"], ds["name"])
