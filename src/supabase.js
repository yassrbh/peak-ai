import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nbyfocgzipimzhpzrkbn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieWZvY2d6aXBpbXpocHpya2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTA4MjUsImV4cCI6MjA4OTc4NjgyNX0.SYS4LKyBVVz__pEqzX8eJHXCMr0qhIukgD1tLEvwHv4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
