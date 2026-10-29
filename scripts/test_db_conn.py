import psycopg2
import os

db_url = 'postgresql://postgres:Tejas192406%40@db.iwcqkrzefoawlpugergc.supabase.co:5432/postgres'

try:
    print("Connecting to:", db_url.split('@')[1])
    conn = psycopg2.connect(db_url, connect_timeout=8)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    ver = cur.fetchone()
    print("SUCCESS! Connected to live Postgres:")
    print(ver[0])
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    tables = cur.fetchall()
    print("Current public tables:", [t[0] for t in tables])
    conn.close()
except Exception as e:
    print("Connection error:", type(e).__name__, e)
