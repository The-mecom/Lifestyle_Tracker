import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vqdoileaowsflzqnpazx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZG9pbGVhb3dzZmx6cW5wYXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjkzOTgsImV4cCI6MjA4NzM0NTM5OH0.cHFEaWu2drV93lK6MqCWW-Zwmd4O9XBNtpnXG0Iti-g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
