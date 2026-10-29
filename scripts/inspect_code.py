import os, re

p = r'c:\Users\LENOVO\OneDrive\Desktop\New folder\src\App.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

tabs = sorted(set(re.findall(r"activeTab === '([^']+)'", content)))
print('Tabs in App.tsx:', tabs)
