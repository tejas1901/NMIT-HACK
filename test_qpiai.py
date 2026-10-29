import os
from dotenv import load_dotenv

# Load credentials from qcloud.env
load_dotenv("qcloud.env")

api_key = os.getenv("API_KEY")

if not api_key:
    print("[!] API_KEY is empty. Please add your QpiAI API key to qcloud.env first.")
    exit(1)

try:
    from qpiai_quantum import QpiAIQuantumAuth
    print("[*] Authenticating with QpiAI QCloud...")
    QpiAIQuantumAuth.login(api_key=api_key)
    
    print("[*] Verifying API Key...")
    QpiAIQuantumAuth.verify_api_key()
    
    print("[+] API Key verified successfully!")
    print("[*] Listing available compute resources:")
    resources = QpiAIQuantumAuth.list_compute_resources()
    print(resources)

except ImportError:
    print("[!] 'qpiai-quantum' SDK is not installed yet. Run: pip install qpiai-quantum")
except Exception as e:
    print(f"[-] Connection failed: {e}")
