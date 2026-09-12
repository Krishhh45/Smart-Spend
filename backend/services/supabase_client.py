import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://pgrymxphikjzsfsykxsd.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncnlteHBoaWtqenNmc3lreHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzczNjksImV4cCI6MjEwNDQxMzM2OX0.vUuM9VqU9ccW0rztgHT0QvZBEj8lopcnKx6hROgL3jo")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
