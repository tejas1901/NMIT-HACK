import os
import sys
import json
import requests
from dotenv import load_dotenv

load_dotenv(".env")

N8N_URL = os.getenv("N8N_INSTANCE_URL", "https://tejas1901.app.n8n.cloud").rstrip("/")
N8N_API_KEY = os.getenv("N8N_API_KEY", "")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")

def check_n8n_api():
    """Verify connection to n8n Cloud via REST API."""
    if not N8N_API_KEY:
        print("[!] N8N_API_KEY is not set in .env")
        print("    To use API automation:")
        print("    1. Open your n8n server: " + N8N_URL)
        print("    2. Go to Settings -> n8n API -> Create API Key")
        print("    3. Paste it into .env as N8N_API_KEY=<your_key>")
        return False
    
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(f"{N8N_URL}/api/v1/workflows", headers=headers)
        if response.status_code == 200:
            workflows = response.json().get("data", [])
            print(f"[+] Successfully connected to n8n! Found {len(workflows)} workflow(s).")
            for wf in workflows:
                print(f" - [{wf.get('id')}] {wf.get('name')} (Active: {wf.get('active')})")
            return True
        else:
            print(f"[-] Failed to authenticate with n8n: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[-] Error connecting to n8n: {e}")
        return False

def import_workflow_to_n8n(workflow_file="n8n_workflow_freightguard.json"):
    """Programmatically push the local workflow JSON to the n8n Cloud server."""
    if not N8N_API_KEY:
        print("[!] Cannot auto-import without N8N_API_KEY in .env.")
        print(f"    Quick manual fix: In {N8N_URL}, click Workflows -> Import from File -> select {workflow_file}.")
        return False
    
    if not os.path.exists(workflow_file):
        print(f"[-] Workflow file {workflow_file} not found.")
        return False

    with open(workflow_file, "r", encoding="utf-8") as f:
        workflow_data = json.load(f)

    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        # POST /api/v1/workflows
        response = requests.post(f"{N8N_URL}/api/v1/workflows", headers=headers, json=workflow_data)
        if response.status_code in [200, 201]:
            created = response.json()
            wf_id = created.get("id")
            print(f"[+] Successfully imported workflow '{created.get('name')}' (ID: {wf_id}) to n8n server!")
            # Attempt to activate
            act_resp = requests.post(f"{N8N_URL}/api/v1/workflows/{wf_id}/activate", headers=headers)
            if act_resp.status_code == 200:
                print(f"[+] Workflow {wf_id} is now ACTIVE on {N8N_URL}")
            return True
        else:
            print(f"[-] Failed to import workflow: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[-] Error uploading workflow to n8n: {e}")
        return False

def trigger_webhook(payload: dict):
    """Trigger an n8n webhook workflow."""
    if not N8N_WEBHOOK_URL:
        print("[!] N8N_WEBHOOK_URL is not set in .env")
        return None
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=10)
        print(f"[+] Webhook response ({response.status_code}): {response.text}")
        return response
    except Exception as e:
        print(f"[-] Webhook error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--import":
        import_workflow_to_n8n()
    else:
        check_n8n_api()
