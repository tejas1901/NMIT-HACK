import os
import pandas as pd
import numpy as np

def run_preprocessing():
    input_path = os.path.join("data", "DataCoSupplyChainDataset.csv")
    output_path = os.path.join("data", "processed_shipments.csv")
    sample_json_path = os.path.join("data", "sample_shipments_demo.json")
    
    print(f"[*] Loading raw base dataset from: {input_path}")
    df = pd.read_csv(input_path, encoding="latin-1")
    print(f"[+] Loaded {len(df):,} records with {len(df.columns)} columns.")

    # 1. Clean Column Names
    df.columns = [c.strip().lower().replace(" ", "_").replace("(", "").replace(")", "") for c in df.columns]

    # 2. Extract Temporal Features from order date
    print("[*] Extracting temporal features from order date...")
    df['order_date'] = pd.to_datetime(df['order_date_dateorders'], errors='coerce')
    df['order_month'] = df['order_date'].dt.month.fillna(1).astype(int)
    df['order_day_of_week'] = df['order_date'].dt.dayofweek.fillna(0).astype(int)
    df['order_hour'] = df['order_date'].dt.hour.fillna(12).astype(int)

    # 3. Calculate Delay Days and Penalty Risk (Financial Business Metric)
    real_days = df['days_for_shipping_real']
    sched_days = df['days_for_shipment_scheduled']
    df['delay_days'] = np.maximum(0, real_days - sched_days)
    
    order_val = df['order_item_total'].fillna(0.0)
    is_late = (df['late_delivery_risk'] == 1) | (df['delay_days'] > 0)
    
    base_fee = np.where(is_late, 50.0, 0.0)
    per_day_fee = df['delay_days'] * 40.0
    val_penalty = order_val * 0.05
    
    df['penalty_usd'] = np.where(is_late, np.minimum(order_val, base_fee + per_day_fee + val_penalty), 0.0)
    df['penalty_usd'] = df['penalty_usd'].round(2)

    # 4. Classify Risk Severity Tier
    def assign_risk_tier(row):
        if row.get('delay_days', 0) >= 3 or row.get('penalty_usd', 0) > 250:
            return "CRITICAL"
        elif row.get('delay_days', 0) >= 1 or row.get('penalty_usd', 0) > 100:
            return "HIGH"
        elif row.get('late_delivery_risk', 0) == 1:
            return "MEDIUM"
        else:
            return "LOW"

    df['risk_tier'] = df.apply(assign_risk_tier, axis=1)

    # 5. Filter Curated Features for ML & Optimization
    feature_cols = [
        # Identifiers
        'order_id', 'order_item_id',
        # Categorical features
        'shipping_mode', 'order_region', 'market', 'category_name', 
        'customer_segment', 'department_name',
        # Numerical features
        'days_for_shipment_scheduled', 'order_item_total', 'order_item_quantity', 
        'order_item_discount_rate', 'order_month', 'order_day_of_week', 'order_hour',
        # Ground Truth & Targets
        'days_for_shipping_real', 'delay_days', 'late_delivery_risk', 'penalty_usd', 'risk_tier', 'delivery_status'
    ]
    
    available_cols = [c for c in feature_cols if c in df.columns]
    processed_df = df[available_cols].dropna(subset=['late_delivery_risk', 'shipping_mode'])

    # ── 6. Ingest & Standardize Extra Datasets ─────────────────────────────────
    extra_frames = []

    # Extra Dataset A: Live Manifest Register Data
    manifest_path = os.path.join("data", "live_manifest_register_data.csv")
    if os.path.exists(manifest_path):
        print(f"[*] Ingesting extra dataset: {manifest_path}")
        m_df = pd.read_csv(manifest_path)
        m_norm = pd.DataFrame()
        m_norm['order_id'] = m_df['booking_ref']
        m_norm['order_item_id'] = [f"ITM-{i+1:04d}" for i in range(len(m_df))]
        m_norm['shipping_mode'] = m_df['shipping_mode']
        m_norm['order_region'] = m_df['destination'].apply(lambda x: 'Western Europe' if 'Rotterdam' in str(x) or 'Frankfurt' in str(x) else 'North America')
        m_norm['market'] = m_df['destination'].apply(lambda x: 'Europe' if 'Rotterdam' in str(x) or 'Frankfurt' in str(x) else 'USCA')
        m_norm['category_name'] = m_df['cargo_department']
        m_norm['customer_segment'] = 'Corporate'
        m_norm['department_name'] = m_df['cargo_department']
        m_norm['days_for_shipment_scheduled'] = 3
        m_norm['order_item_total'] = m_df['cargo_value_usd']
        m_norm['order_item_quantity'] = 1
        m_norm['order_item_discount_rate'] = 0.02
        m_norm['order_month'] = 10
        m_norm['order_day_of_week'] = 2
        m_norm['order_hour'] = 14
        m_norm['late_delivery_risk'] = (m_df['xgboost_delay_risk_pct'] >= 50.0).astype(int)
        m_norm['delay_days'] = np.where(m_norm['late_delivery_risk'] == 1, 2, 0)
        m_norm['days_for_shipping_real'] = m_norm['days_for_shipment_scheduled'] + m_norm['delay_days']
        m_norm['penalty_usd'] = m_df['demurrage_risk_usd']
        m_norm['delivery_status'] = m_df['status']
        m_norm['risk_tier'] = m_norm.apply(assign_risk_tier, axis=1)
        extra_frames.append(m_norm)
        print(f"    [+] Ingested {len(m_norm)} records from live_manifest_register_data.csv")

    # Extra Dataset B: DataCo Smart Supply Chain Sample
    dataco_sample_path = os.path.join("data", "dataco_smart_supply_chain_sample.csv")
    if os.path.exists(dataco_sample_path):
        print(f"[*] Ingesting extra dataset: {dataco_sample_path}")
        d_df = pd.read_csv(dataco_sample_path)
        d_norm = pd.DataFrame()
        d_norm['order_id'] = [f"DC-{i+1:04d}" for i in range(len(d_df))]
        d_norm['order_item_id'] = [f"DCI-{i+1:04d}" for i in range(len(d_df))]
        d_norm['shipping_mode'] = d_df['Shipping_Mode']
        d_norm['order_region'] = d_df['Order_Country'].apply(lambda x: 'South Asia' if 'India' in str(x) else ('Southeast Asia' if 'Indonesia' in str(x) else 'North America'))
        d_norm['market'] = d_df['Order_Country'].apply(lambda x: 'Pacific Asia' if ('India' in str(x) or 'Indonesia' in str(x)) else 'USCA')
        d_norm['category_name'] = d_df['Category_Name']
        d_norm['customer_segment'] = 'Consumer'
        d_norm['department_name'] = d_df['Category_Name']
        d_norm['days_for_shipment_scheduled'] = d_df['Days_for_shipment_scheduled']
        d_norm['order_item_total'] = d_df['Order_Item_Product_Price'] * d_df['Order_Item_Quantity']
        d_norm['order_item_quantity'] = d_df['Order_Item_Quantity']
        d_norm['order_item_discount_rate'] = (d_df['Order_Item_Discount'] / np.maximum(1.0, d_df['Order_Item_Product_Price'])).clip(0.0, 0.5)
        d_norm['order_month'] = 10
        d_norm['order_day_of_week'] = 3
        d_norm['order_hour'] = 11
        d_norm['days_for_shipping_real'] = d_df['Days_for_shipping_real']
        d_norm['delay_days'] = np.maximum(0, d_df['Days_for_shipping_real'] - d_df['Days_for_shipment_scheduled'])
        d_norm['late_delivery_risk'] = d_df['Late_delivery_risk']
        d_late = d_norm['late_delivery_risk'] == 1
        d_norm['penalty_usd'] = np.where(d_late, 50.0 + d_norm['delay_days'] * 40.0 + d_norm['order_item_total'] * 0.05, 0.0).round(2)
        d_norm['delivery_status'] = d_df['Delivery_Status']
        d_norm['risk_tier'] = d_norm.apply(assign_risk_tier, axis=1)
        extra_frames.append(d_norm)
        print(f"    [+] Ingested {len(d_norm)} records from dataco_smart_supply_chain_sample.csv")

    # Extra Dataset C: Supply Chain Delay Risk Sample
    delay_sample_path = os.path.join("data", "supply_chain_delay_risk_sample.csv")
    if os.path.exists(delay_sample_path):
        print(f"[*] Ingesting extra dataset: {delay_sample_path}")
        s_df = pd.read_csv(delay_sample_path)
        s_norm = pd.DataFrame()
        s_norm['order_id'] = s_df['shipment_id']
        s_norm['order_item_id'] = [f"SCH-{i+1:04d}" for i in range(len(s_df))]
        s_norm['shipping_mode'] = s_df['planned_transit_time_hrs'].apply(lambda x: 'First Class' if x <= 24 else 'Standard Class')
        s_norm['order_region'] = 'North America'
        s_norm['market'] = 'USCA'
        s_norm['category_name'] = 'Commercial Freight'
        s_norm['customer_segment'] = 'Corporate'
        s_norm['department_name'] = 'Heavy Industrial'
        s_norm['days_for_shipment_scheduled'] = np.maximum(1, (s_df['planned_transit_time_hrs'] / 24).round().astype(int))
        s_norm['order_item_total'] = 12000.0
        s_norm['order_item_quantity'] = 1
        s_norm['order_item_discount_rate'] = 0.0
        s_norm['order_month'] = 10
        s_norm['order_day_of_week'] = 1
        s_norm['order_hour'] = 9
        s_norm['days_for_shipping_real'] = np.maximum(1, (s_df['actual_transit_time_hrs'] / 24).round().astype(int))
        s_norm['delay_days'] = np.maximum(0, s_norm['days_for_shipping_real'] - s_norm['days_for_shipment_scheduled'])
        s_norm['late_delivery_risk'] = s_df['delay_flag']
        s_norm['penalty_usd'] = s_df['demurrage_cost_usd']
        s_norm['delivery_status'] = np.where(s_df['delay_flag'] == 1, 'Late delivery', 'Complete')
        s_norm['risk_tier'] = s_norm.apply(assign_risk_tier, axis=1)
        extra_frames.append(s_norm)
        print(f"    [+] Ingested {len(s_norm)} records from supply_chain_delay_risk_sample.csv")

    # Extra Dataset D: Logistics Disruption Sample
    disrupt_path = os.path.join("data", "logistics_disruption_sample.csv")
    if os.path.exists(disrupt_path):
        print(f"[*] Ingesting extra dataset: {disrupt_path}")
        l_df = pd.read_csv(disrupt_path)
        l_norm = pd.DataFrame()
        l_norm['order_id'] = l_df['disruption_id']
        l_norm['order_item_id'] = [f"DSP-{i+1:04d}" for i in range(len(l_df))]
        l_norm['shipping_mode'] = l_df['transport_mode'].apply(lambda x: 'First Class' if 'Maritime' in str(x) else 'Standard Class')
        l_norm['order_region'] = l_df['origin_port'].apply(lambda x: 'Western Europe' if 'Rotterdam' in str(x) else 'North America')
        l_norm['market'] = l_df['origin_port'].apply(lambda x: 'Europe' if 'Rotterdam' in str(x) else 'USCA')
        l_norm['category_name'] = l_df['cargo_type']
        l_norm['customer_segment'] = 'Enterprise Cargo'
        l_norm['department_name'] = l_df['cargo_type']
        l_norm['days_for_shipment_scheduled'] = 3
        l_norm['order_item_total'] = 50000.0
        l_norm['order_item_quantity'] = 1
        l_norm['order_item_discount_rate'] = 0.0
        l_norm['order_month'] = 10
        l_norm['order_day_of_week'] = 4
        l_norm['order_hour'] = 16
        l_norm['days_for_shipping_real'] = 6
        l_norm['delay_days'] = 3
        l_norm['late_delivery_risk'] = 1
        l_norm['penalty_usd'] = l_df['cost_impact_usd']
        l_norm['delivery_status'] = 'Late delivery'
        l_norm['risk_tier'] = l_norm.apply(assign_risk_tier, axis=1)
        extra_frames.append(l_norm)
        print(f"    [+] Ingested {len(l_norm)} records from logistics_disruption_sample.csv")

    if extra_frames:
        combined_extra = pd.concat(extra_frames, ignore_index=True)
        # Ensure column alignment
        processed_df = pd.concat([processed_df, combined_extra[available_cols]], ignore_index=True)
        print(f"[+] Total merged dataset size: {len(processed_df):,} records (Base + Extra Datasets)")

    # Save processed dataset
    print(f"[*] Saving processed dataset to: {output_path}")
    processed_df.to_csv(output_path, index=False)
    print(f"[+] Saved {len(processed_df):,} rows.")

    # 7. Save a representative sample of 20 shipments for quick testing / demos
    sample_dfs = []
    for tier in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        tier_sub = processed_df[processed_df['risk_tier'] == tier]
        if len(tier_sub) > 0:
            sample_dfs.append(tier_sub.sample(min(5, len(tier_sub)), random_state=42))
    
    sample_df = pd.concat(sample_dfs).reset_index(drop=True)
    sample_df.to_json(sample_json_path, orient="records", indent=2)
    print(f"[+] Saved {len(sample_df)} sample shipments for UI/Demo to: {sample_json_path}")

    # 8. Print Business Impact Metrics
    total_penalties = processed_df['penalty_usd'].sum()
    avg_penalty_when_late = processed_df[processed_df['penalty_usd'] > 0]['penalty_usd'].mean()
    delay_rate = (processed_df['late_delivery_risk'] == 1).mean() * 100

    print("\n" + "="*50)
    print("      DATASET PREPROCESSING & METRICS SUMMARY")
    print("="*50)
    print(f"Total Shipments Analyzed:       {len(processed_df):,}")
    print(f"Overall Late Delivery Rate:     {delay_rate:.1f}%")
    print(f"Total Simulated Demurrage/Risk: ${total_penalties:,.2f} USD")
    print(f"Average Penalty per Late Order: ${avg_penalty_when_late:.2f} USD")
    print("\nRisk Tier Distribution:")
    print(processed_df['risk_tier'].value_counts(normalize=True).mul(100).round(1).astype(str) + '%')
    print("\nDelay Rate by Shipping Mode:")
    print(processed_df.groupby('shipping_mode')['late_delivery_risk'].mean().mul(100).round(1).astype(str) + '%')
    print("="*50 + "\n")

if __name__ == "__main__":
    run_preprocessing()
