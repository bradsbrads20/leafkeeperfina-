import { createClient } from '@supabase/supabase-js'

// For local development (your running Supabase)
const supabaseUrl = 'http://localhost:54321'
const supabaseAnonKey = 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)