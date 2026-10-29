import os
import sys
import json
import requests

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

class GenAICopilot:
    """
    Local Generative AI Copilot powered by Ollama (llama3.2:3b).
    Generates intelligent root-cause incident briefings, QpiAI quantum optimization explanations,
    and automated operational mitigation notices.
    """
    def __init__(self, model_name="llama3.2:3b", host="http://localhost:11434"):
        self.model_name = model_name
        self.host = host.rstrip("/")

    def generate_incident_report(self, shipment: dict, ml_risk: dict, quantum_opt: dict) -> dict:
        """
        Synthesizes ML telemetry and QpiAI quantum optimization results into
        actionable executive intelligence and formal dispatch notices.
        """
        order_id = shipment.get('order_id', 'SHP-8492')
        region = shipment.get('order_region', 'NH-44 Bengaluru - Mumbai Corridor')
        mode = shipment.get('shipping_mode', 'First Class')
        cargo = shipment.get('department_name', 'Industrial Goods')
        order_value = shipment.get('order_item_total', 250000.00)

        delay_prob = ml_risk.get('delay_probability', 85.0)
        risk_tier = ml_risk.get('risk_tier', 'HIGH')
        penalty = ml_risk.get('predicted_penalty_usd', 12000.00)
        factors = ml_risk.get('contributing_factors', ["Regional transit congestion along Western Ghats"])

        carrier_choice = quantum_opt.get('selected_carrier', {}).get('name', 'Expedited Regional Express')
        expedite_fee = quantum_opt.get('selected_carrier', {}).get('expedite_cost', 4200.0)
        net_savings = quantum_opt.get('net_financial_savings_usd', 7800.0)
        quantum_backend = quantum_opt.get('quantum_backend', 'QpiAI-QSV-Local')

        prompt = f"""You are FreightGuard AI, an expert industrial supply chain risk & incident response copilot.
Generate a concise, professional Incident Triage and Mitigation Briefing for logistics operations managers in Indian freight corridors.

=== TELEMETRY DATA ===
- Shipment ID: {order_id}
- Cargo: {cargo} (Value: ₹{order_value:,.2f} INR)
- Assigned Mode: {mode} along {region}
- Predictive ML Delay Risk: {delay_prob}% (Severity Tier: {risk_tier})
- Financial Penalty / Demurrage Exposure: ₹{penalty:,.2f} INR
- Key Contributing Factors: {', '.join(factors)}
- QpiAI Quantum Optimization Solution: {carrier_choice}
- Surcharge: ₹{expedite_fee:,.2f} INR | Net Projected Savings: ₹{net_savings:,.2f} INR
- Optimization Quantum Engine: {quantum_backend}

=== REQUIRED RESPONSE FORMAT ===
Provide exactly three sections in clear Markdown:

### 1. Root-Cause Incident Assessment
(2-3 sentences explaining why this shipment is delayed and the financial penalty exposure in Indian Rupees)

### 2. QpiAI Quantum Optimization Strategy
(2-3 sentences explaining why '{carrier_choice}' is the mathematically optimal choice and how it saves ₹{net_savings:,.2f} INR)

### 3. Automated Carrier Rerouting Notice
(A formal dispatch email ready to send to logistics dispatchers and carriers, including Subject line and body with tracking details)
"""

        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "num_predict": 250
                }
            }
            res = requests.post(f"{self.host}/api/generate", json=payload, timeout=60)
            if res.status_code == 200:
                generated_text = res.json().get("response", "").strip()
                return {
                    "status": "SUCCESS",
                    "model": self.model_name,
                    "generated_briefing": generated_text
                }
            else:
                print(f"[!] Ollama returned status {res.status_code}: {res.text}")
                return self._fallback_report(order_id, region, mode, cargo, order_value, delay_prob, risk_tier, penalty, factors, carrier_choice, expedite_fee, net_savings)
        except Exception as e:
            print(f"[!] Ollama connection error: {e}. Utilizing intelligent deterministic template.")
            return self._fallback_report(order_id, region, mode, cargo, order_value, delay_prob, risk_tier, penalty, factors, carrier_choice, expedite_fee, net_savings)

    def _fallback_report(self, order_id, region, mode, cargo, order_value, delay_prob, risk_tier, penalty, factors, carrier_choice, expedite_fee, net_savings):
        """High-fidelity template fallback in case Ollama is busy."""
        briefing = f"""### 1. Root-Cause Incident Assessment
Shipment **{order_id}** ({cargo}, Valued at ₹{order_value:,.2f}) en route across **{region}** via **{mode}** has been flagged at **{risk_tier} RISK** with an estimated delay probability of **{delay_prob}%**. Historical tracking models identify strict SLA windows and toll waypoint congestion as primary bottlenecks, creating an unmitigated demurrage and contractual penalty exposure of **₹{penalty:,.2f} INR**.

### 2. QpiAI Quantum Optimization Strategy
The QpiAI Quantum Circuit formulated and solved the multi-carrier risk/cost trade-off on `QpiAI-QSV-Local`. Re-routing the consignment to **{carrier_choice}** incurs an expedite surcharge of **₹{expedite_fee:,.2f} INR**, successfully mitigating contractual penalties and yielding a **Net Preserved Value of ₹{net_savings:,.2f} INR**.

### 3. Automated Carrier Rerouting Notice
**Subject:** [URGENT DISPATCH ACTION] Re-routing Authorization: Shipment #{order_id}
**To:** operations-dispatch@nh44-freight.in
**Priority:** High

Attention Logistics Operations,

FreightGuard AI telemetry has identified a critical bottleneck for Shipment **#{order_id}** ({cargo}). Pursuant to our SLA mitigation protocol, this shipment has been algorithmically re-allocated:

* **Current Status:** Diverted from {mode} to **{carrier_choice}**
* **Target Delivery:** Accelerated by 48 hours to prevent destination demurrage
* **Approved Expedite Surcharge:** ₹{expedite_fee:,.2f} INR (Authorized via QpiAI Optimizer)

Please confirm receipt and generate the updated FASTag/GST e-Waybill manifest immediately.

Regards,  
*FreightGuard AI Autonomous Dispatch Engine*
"""
        return {
            "status": "SUCCESS_FALLBACK",
            "model": "template-engine",
            "generated_briefing": briefing
        }

    def is_available(self) -> bool:
        """Check if local Ollama server is responding."""
        try:
            r = requests.get(f"{self.host}/api/tags", timeout=2)
            return r.status_code == 200
        except Exception:
            return False

    def answer_query(self, query: str, context: str = "") -> dict:
        """
        Answer arbitrary logistics, cargo booking, and supply chain questions
        using the local Ollama LLM (llama3.2:3b).
        """
        system_prompt = (
            "You are FreightGuard AI Logistics Copilot, an expert conversational assistant built for "
            "freight forwarding, cargo bookings, carrier dispatch, demurrage mitigation, and QpiAI quantum routing. "
            "Give direct, highly practical, and knowledgeable answers in 2-4 concise paragraphs with markdown bullet points if helpful."
        )

        full_prompt = f"{system_prompt}\n\nContext:\n{context}\n\nUser Question: {query}\n\nAnswer:" if context else f"{system_prompt}\n\nUser Question: {query}\n\nAnswer:"

        try:
            payload = {
                "model": self.model_name,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.4,
                    "top_p": 0.9,
                    "num_predict": 120
                }
            }
            res = requests.post(f"{self.host}/api/generate", json=payload, timeout=20)
            if res.status_code == 200:
                answer = res.json().get("response", "").strip()
                return {
                    "status": "SUCCESS",
                    "model": self.model_name,
                    "answer": answer,
                    "ollama_active": True
                }
        except Exception as e:
            print(f"[!] Ollama answer_query connection notice: {e}")

        # Intelligent fallback if Ollama model is busy or loading
        return {
            "status": "FALLBACK",
            "model": "rule-copilot",
            "answer": (
                f"Cargo Copilot Insight: Regarding '{query}', our logistics engine recommends confirming shipment SLA, "
                "verifying port dwell times, and evaluating expedited carrier alternatives via QpiAI quantum optimization."
            ),
            "ollama_active": False
        }


if __name__ == "__main__":
    copilot = GenAICopilot()
    sample_shipment = {
        "order_id": "ORD-94182",
        "shipping_mode": "First Class",
        "order_region": "NH-48 Bengaluru - Mumbai Industrial Corridor",
        "department_name": "Apparel & Textiles",
        "order_item_total": 380000.00
    }
    sample_ml = {
        "delay_probability": 92.4,
        "risk_tier": "CRITICAL",
        "predicted_penalty_usd": 13850.00,
        "contributing_factors": [
            "Strict SLA window for First Class freight",
            "Peak seasonal transit congestion in Western Ghats corridor"
        ]
    }
    sample_opt = {
        "selected_carrier": {
            "name": "Expedited Regional Express",
            "expedite_cost": 4200.0
        },
        "net_financial_savings_usd": 7530.00,
        "quantum_backend": "QpiAI-QSV-Local"
    }

    print("[*] Generating GenAI Incident Briefing with Ollama (llama3.2:3b)...")
    res = copilot.generate_incident_report(sample_shipment, sample_ml, sample_opt)
    print("\n" + "="*55)
    print("      GENAI COPILOT INCIDENT BRIEFING")
    print("="*55)
    print(res["generated_briefing"])
    print("="*55 + "\n")
