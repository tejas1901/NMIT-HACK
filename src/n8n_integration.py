import os
import sys
import json
import requests
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv(".env")

class N8NWorkflowDispatcher:
    """
    Dispatches high-risk shipment incidents and GenAI triage briefings to n8n Cloud.
    Triggers automated downstream workflows: alerting dispatchers, creating Jira/Slack tickets,
    and recording carrier re-allocation orders.
    """
    def __init__(self):
        self.instance_url = os.getenv("N8N_INSTANCE_URL", "https://tejas1901.app.n8n.cloud").rstrip("/")
        self.webhook_url = os.getenv("N8N_WEBHOOK_URL", "")
        self.api_key = os.getenv("N8N_API_KEY", "")

    def dispatch_incident_event(self, shipment: dict, ml_risk: dict, quantum_opt: dict, genai_report: dict) -> dict:
        """
        Package the end-to-end intelligence pipeline payload and dispatch to n8n.
        """
        payload = {
            "event_type": "FREIGHTGUARD_CRITICAL_INCIDENT",
            "shipment_id": shipment.get("order_id", "SHP-8492"),
            "cargo_category": shipment.get("department_name", "Apparel & Textiles"),
            "order_value_inr": shipment.get("order_item_total", 350000.00),
            "currency": "INR",
            "currency_symbol": "₹",
            "destination_region": shipment.get("order_region", "NH-48 Bengaluru - Mumbai Corridor"),
            "ml_telemetry": {
                "risk_tier": ml_risk.get("risk_tier", "CRITICAL"),
                "delay_probability_pct": ml_risk.get("delay_probability", 92.4),
                "predicted_penalty_inr": ml_risk.get("predicted_penalty_usd", 13850.00),
                "primary_risk_factors": ml_risk.get("contributing_factors", [])
            },
            "qpiai_quantum_solution": {
                "selected_carrier": quantum_opt.get("selected_carrier", {}).get("name", "Expedited Regional Express"),
                "expedite_surcharge_inr": quantum_opt.get("selected_carrier", {}).get("expedite_cost", 4200.0),
                "net_financial_savings_inr": quantum_opt.get("net_financial_savings_usd", 7530.00),
                "quantum_backend": quantum_opt.get("quantum_backend", "QpiAI-QSV-Local")
            },
            "genai_briefing": genai_report.get("generated_briefing", "")
        }

        print(f"[*] Packaging Incident Payload for n8n Cloud: {payload['shipment_id']} ({payload['ml_telemetry']['risk_tier']})")

        if self.webhook_url:
            try:
                print(f"[*] Sending payload to n8n Webhook: {self.webhook_url}")
                resp = requests.post(self.webhook_url, json=payload, timeout=10)
                return {
                    "status": "DISPATCHED_WEBHOOK",
                    "status_code": resp.status_code,
                    "response": resp.text,
                    "payload": payload
                }
            except Exception as e:
                print(f"[!] n8n Webhook delivery failed: {e}")
                return {"status": "WEBHOOK_FAILED", "error": str(e), "payload": payload}
        else:
            print(f"[i] N8N_WEBHOOK_URL not configured. Simulating payload dispatch to {self.instance_url}...")
            return {
                "status": "SIMULATED_LOCAL_DISPATCH",
                "target_instance": self.instance_url,
                "note": "Ready for live trigger. Add your active webhook URL to .env to send live HTTP requests.",
                "payload": payload
            }

if __name__ == "__main__":
    dispatcher = N8NWorkflowDispatcher()
    sample_shipment = {"order_id": "ORD-94182", "order_region": "NH-48 Bengaluru - Mumbai Corridor", "department_name": "Apparel & Textiles", "order_item_total": 380000.00}
    sample_ml = {"risk_tier": "CRITICAL", "delay_probability": 92.4, "predicted_penalty_usd": 13850.00, "contributing_factors": ["Strict SLA window", "Western Ghats congestion"]}
    sample_opt = {"selected_carrier": {"name": "Expedited Regional Express", "expedite_cost": 4200.0}, "net_financial_savings_usd": 7530.00, "quantum_backend": "QpiAI-QSV-Local"}
    sample_genai = {"generated_briefing": "Executive Incident Report generated via Ollama."}
    
    res = dispatcher.dispatch_incident_event(sample_shipment, sample_ml, sample_opt, sample_genai)
    print("\n" + "="*55)
    print("      n8n DISPATCH TEST SUMMARY")
    print("="*55)
    print(f"Status:          {res['status']}")
    print(f"Target Instance: {dispatcher.instance_url}")
    print("Delivered Payload Structure:")
    print(json.dumps(res["payload"], indent=2))
    print("="*55 + "\n")
