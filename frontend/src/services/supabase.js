import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pgrymxphikjzsfsykxsd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncnlteHBoaWtqenNmc3lreHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzczNjksImV4cCI6MjEwNDQxMzM2OX0.vUuM9VqU9ccW0rztgHT0QvZBEj8lopcnKx6hROgL3jo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
