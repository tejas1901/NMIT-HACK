import os
import re

new_views_dir = r"c:\Users\LENOVO\OneDrive\Desktop\New folder\src\views"

report = []
for fname in sorted(os.listdir(new_views_dir)):
    if not fname.endswith(".tsx"):
        continue
    fpath = os.path.join(new_views_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        code = f.read()

    # Find imports
    imports = re.findall(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', code)
    # Find props interface
    props = re.findall(r'interface\s+([A-Za-z0-9_]*Props[A-Za-z0-9_]*)', code)
    # Find fetch or axios
    fetches = re.findall(r'fetch\([\'"`]([^\'"`]+)[\'"`]', code)
    # Find functions / buttons
    handlers = re.findall(r'const\s+(handle[A-Za-z0-9_]+)\s*=', code)

    report.append({
        "file": fname,
        "imports": imports,
        "props": props,
        "fetches": fetches,
        "handlers": handlers,
        "lines": len(code.splitlines())
    })

print(f"Scanned {len(report)} views.")
for r in report:
    print(f"\n=== {r['file']} ({r['lines']} lines) ===")
    print(f"  Props: {r['props']}")
    print(f"  Fetches: {r['fetches']}")
    print(f"  Handlers: {r['handlers']}")
    data_imports = [imp for imp in r['imports'] if 'data' in imp or 'mock' in imp or 'yard' in imp or 'truck' in imp or 'labeled' in imp]
    print(f"  Data imports: {data_imports}")
