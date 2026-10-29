import os
import json
import logging
import httpx
from typing import Dict, Any, List
from ..models.llm import LLMInsightRequest, LLMInsightResponse
from ..config import settings

logger = logging.getLogger("freightiq.ml.llm")

class LLMService:
    def __init__(self):
        self.ollama_host = settings.ollama_host.rstrip("/")
        self.ollama_model = settings.ollama_model
        self.gemini_api_key = settings.gemini_api_key

    async def generate_insight(self, req: LLMInsightRequest) -> LLMInsightResponse:
        # 1. Attempt Ollama
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                prompt = self._build_prompt(req)
                payload = {
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.25,
                        "num_predict": 300
                    }
                }
                resp = await client.post(f"{self.ollama_host}/api/generate", json=payload)
                if resp.status_code == 200:
                    text = resp.json().get("response", "").strip()
                    if text:
                        return self._parse_and_format_response(text, "ollama", self.ollama_model, req)
        except Exception as ollama_err:
            logger.info(f"Ollama unavailable ({ollama_err}). Checking secondary fallbacks...")

        # 2. Attempt Gemini if configured
        if self.gemini_api_key:
            try:
                gemini_res = await self._call_gemini(req)
                if gemini_res:
                    return gemini_res
            except Exception as gemini_err:
                logger.warning(f"Gemini fallback failed: {gemini_err}")

        # 3. Deterministic Template Fallback (Guaranteed to succeed and never crash)
        return self._generate_deterministic_template(req)

    def _build_prompt(self, req: LLMInsightRequest) -> str:
        return f"""You are FreightGuard AI, an industrial supply chain incident commander.
Generate a grounded, actionable 3-part incident triage briefing based on this telemetry:

=== TELEMETRY METRICS ===
- Shipment ID: {req.shipment_id}
- Cargo: {req.cargo} (Value: ₹{req.cargo_value:,.2f} INR)
- Corridor: {req.corridor} via {req.shipping_mode}
- Demurrage Delay Probability: {req.demurrage_probability}% ({req.demurrage_risk_tier})
- Unmitigated Demurrage Exposure: ₹{req.demurrage_cost_estimated:,.2f} INR
- Contributing Bottlenecks: {'; '.join(req.top_contributing_factors)}
- Quantum Solution: Reallocate to '{req.quantum_carrier_selected}'
- Projected Net Financial Savings: ₹{req.quantum_net_savings:,.2f} INR (via {req.quantum_solver})

Provide three clear sections:
### 1. Root-Cause Incident Assessment
### 2. QpiAI Quantum Optimization Strategy
### 3. Automated Carrier Rerouting Notice
"""

    async def _call_gemini(self, req: LLMInsightRequest) -> LLMInsightResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        prompt = self._build_prompt(req)
        body = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=body)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return self._parse_and_format_response(text, "gemini", "gemini-1.5-flash", req)
        return None

    def _generate_deterministic_template(self, req: LLMInsightRequest) -> LLMInsightResponse:
        assessment = (
            f"Shipment {req.shipment_id} ({req.cargo}, Valued at ₹{req.cargo_value:,.2f} INR) traversing {req.corridor} "
            f"is flagged under {req.demurrage_risk_tier} RISK with a {req.demurrage_probability}% delay probability. "
            f"Primary bottlenecks: {req.top_contributing_factors[0] if req.top_contributing_factors else 'corridor weather and toll congestion'}, "
            f"creating an unmitigated demurrage exposure of ₹{req.demurrage_cost_estimated:,.2f} INR."
        )

        quantum_strat = (
            f"The carrier allocation Hamiltonian executed on {req.quantum_solver} identified '{req.quantum_carrier_selected}' "
            f"as the optimal energy minimum. Reallocating from {req.shipping_mode} ensures arrival within SLA boundaries, "
            f"yielding a Net Projected Value of ₹{req.quantum_net_savings:,.2f} INR."
        )

        dispatch_notice = (
            f"SUBJECT: [URGENT DISPATCH] Automated Rerouting Authorization: #{req.shipment_id}\n"
            f"TO: operations-dispatch@freightiq.ai | PRIORITY: HIGH\n\n"
            f"Attention Logistics Operations,\n"
            f"FreightIQ Autonomous Intelligence has identified an SLA breach cliff for Consignment #{req.shipment_id}. "
            f"Action taken:\n"
            f"• Carrier Re-allocated: Diverted to {req.quantum_carrier_selected}\n"
            f"• Demurrage Mitigated: ₹{req.demurrage_cost_estimated:,.2f} INR (Net Savings: ₹{req.quantum_net_savings:,.2f} INR)\n"
            f"• FASTag / e-Waybill Manifest Status: Active electronic re-dispatch authorized."
        )

        full_md = f"### 1. Root-Cause Incident Assessment\n{assessment}\n\n### 2. QpiAI Quantum Optimization Strategy\n{quantum_strat}\n\n### 3. Automated Carrier Rerouting Notice\n{dispatch_notice}"

        badges = [
            f"Risk: {req.demurrage_probability}% ({req.demurrage_risk_tier})",
            f"Net Saved: ₹{req.quantum_net_savings:,.2f}",
            f"Optimal: {req.quantum_carrier_selected}"
        ]

        return LLMInsightResponse(
            status="SUCCESS_FALLBACK",
            engine_used="deterministic-template",
            model_name="deterministic-logistics-rules-v3.2",
            incident_assessment=assessment,
            quantum_strategy_rationale=quantum_strat,
            dispatch_rerouting_notice=dispatch_notice,
            full_markdown=full_md,
            badges=badges
        )

    def _parse_and_format_response(self, text: str, engine: str, model: str, req: LLMInsightRequest) -> LLMInsightResponse:
        badges = [
            f"Risk: {req.demurrage_probability}% ({req.demurrage_risk_tier})",
            f"Saved: ₹{req.quantum_net_savings:,.2f}",
            f"Carrier: {req.quantum_carrier_selected}"
        ]
        return LLMInsightResponse(
            status="SUCCESS",
            engine_used=engine,
            model_name=model,
            incident_assessment=text[:400],
            quantum_strategy_rationale=text[400:800] if len(text) > 400 else "",
            dispatch_rerouting_notice=text[800:] if len(text) > 800 else "",
            full_markdown=text,
            badges=badges
        )

llm_service = LLMService()
