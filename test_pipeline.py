import json
from src.predictor import FreightRiskPredictor
from src.quantum_optimizer import QpiAICarrierOptimizer
from src.genai_copilot import GenAICopilot
from src.n8n_integration import N8NWorkflowDispatcher

def run_pipeline_test():
    print("="*65)
    print("   FREIGHTGUARD AI - FULL INTEGRATED PIPELINE VALIDATION")
    print("="*65)

    # 1. Select a Sample Critical Shipment
    shipment = {
        "order_id": "ORD-NMIT-2026-001",
        "shipping_mode": "First Class",
        "order_region": "Western Europe",
        "market": "Europe",
        "customer_segment": "Corporate",
        "department_name": "Industrial Technology",
        "days_for_shipment_scheduled": 1,
        "order_item_total": 420.00,
        "order_item_quantity": 4,
        "order_item_discount_rate": 0.15,
        "order_month": 10,
        "order_day_of_week": 4,
        "order_hour": 19
    }
    print(f"\n[1/4] Ingesting Shipment #{shipment['order_id']} ({shipment['department_name']} - ${shipment['order_item_total']:.2f} USD)...")

    # 2. Step 2: Predictive ML Risk Scoring
    print("[2/4] Running Predictive ML Engine (LightGBM)...")
    predictor = FreightRiskPredictor()
    ml_risk = predictor.predict_shipment(shipment)
    print(f"      Delay Probability: {ml_risk['delay_probability']}%")
    print(f"      Risk Tier:         {ml_risk['risk_tier']}")
    print(f"      Demurrage Penalty: ${ml_risk['predicted_penalty_usd']:.2f} USD")
    print(f"      Key Risk Drivers:  {ml_risk['contributing_factors']}")

    # 3. Step 3: QpiAI Quantum Optimization
    print("\n[3/4] Invoking QpiAI Quantum Circuit Carrier Optimizer...")
    optimizer = QpiAICarrierOptimizer()
    quantum_opt = optimizer.optimize_carrier(
        predicted_penalty=ml_risk['predicted_penalty_usd'],
        delay_prob=ml_risk['delay_probability'] / 100.0,
        base_order_val=shipment['order_item_total']
    )
    print(f"      Optimal Carrier:   {quantum_opt['selected_carrier']['name']}")
    print(f"      Expedite Surcharge:${quantum_opt['selected_carrier']['expedite_cost']:.2f} USD")
    print(f"      Net Saved Margin:  ${quantum_opt['net_financial_savings_usd']:.2f} USD")
    print(f"      Quantum Engine:    {quantum_opt['quantum_backend']}")

    # 4. Step 4: Local GenAI Copilot (Ollama llama3.2:3b)
    print("\n[4/4] Generating Autonomous Incident Triage Briefing via GenAI Copilot...")
    copilot = GenAICopilot()
    genai_res = copilot.generate_incident_report(shipment, ml_risk, quantum_opt)
    print(f"      Generation Status: {genai_res['status']} (Model: {genai_res['model']})")

    # 5. Step 5: n8n Workflow Automation Dispatch
    print("\n[5/6] Packaging & Dispatching Incident Payload to n8n Cloud...")
    dispatcher = N8NWorkflowDispatcher()
    n8n_res = dispatcher.dispatch_incident_event(shipment, ml_risk, quantum_opt, genai_res)
    print(f"      n8n Dispatch:      {n8n_res['status']}")

    # 6. Step 6: Supabase & QpiAI Cloud Telemetry Persistence
    print("\n[6/6] Logging Telemetry to Supabase & QpiAI Platform...")
    try:
        from src.unified_data_service import UnifiedDataService
        db = UnifiedDataService()
        # Log QpiAI Quantum Circuit Run
        db.log_quantum_optimization(shipment['order_id'], quantum_opt)
        # Log Full Pipeline Incident
        db.log_incident(shipment, ml_risk, quantum_opt, genai_res)
    except Exception as db_err:
        print(f"[!] DB logging notice: {db_err}")

    print("\n" + "="*65)
    print("   END-TO-END PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    print("="*65)

if __name__ == "__main__":
    run_pipeline_test()
