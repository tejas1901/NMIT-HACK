import os
import re
import json

nmit_root = r"c:\Users\LENOVO\OneDrive\Desktop\nmit hackathon"
new_root = r"c:\Users\LENOVO\OneDrive\Desktop\New folder"

print("--- AUDIT SCAN START ---")

# 1. Inspect backend/main.py endpoints
backend_main = os.path.join(nmit_root, "backend", "main.py")
endpoints = []
if os.path.exists(backend_main):
    with open(backend_main, "r", encoding="utf-8") as f:
        content = f.read()
    for m in re.finditer(r'@app\.(get|post|put|delete|patch)\((?:path=)?[\'"]([^\'"]+)[\'"]', content):
        endpoints.append((m.group(1).upper(), m.group(2)))

print(f"Existing backend endpoints found: {len(endpoints)}")
for method, path in endpoints:
    print(f"  {method:6} {path}")

# 2. Inspect frontend views in New folder
new_views_dir = os.path.join(new_root, "src", "views")
views = os.listdir(new_views_dir) if os.path.exists(new_views_dir) else []
print(f"\nViews in New folder: {len(views)}")
for v in sorted(views):
    print(f"  {v}")

# 3. Inspect mock datasets in New folder
new_data_dir = os.path.join(new_root, "src", "data")
data_files = os.listdir(new_data_dir) if os.path.exists(new_data_dir) else []
print(f"\nData files in New folder: {len(data_files)}")
for df in sorted(data_files):
    print(f"  {df}")

# 4. Inspect types in New folder
types_file = os.path.join(new_root, "src", "types", "index.ts")
if os.path.exists(types_file):
    with open(types_file, "r", encoding="utf-8") as f:
        t_content = f.read()
    interfaces = re.findall(r'export\s+(?:interface|type)\s+([A-Za-z0-9_]+)', t_content)
    print(f"\nExported types/interfaces: {len(interfaces)}")
    print(f"  {', '.join(interfaces[:25])}...")

print("--- AUDIT SCAN COMPLETE ---")
