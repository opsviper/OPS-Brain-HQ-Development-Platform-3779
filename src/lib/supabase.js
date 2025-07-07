import { createClient } from '@supabase/supabase-js'

// Real Supabase credentials 
const SUPABASE_URL = 'https://crzycouyfnljrjzaywpv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyenljb3V5Zm5sanJqemF5d3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjczNTQsImV4cCI6MjA2NjM0MzM1NH0.fC0hb5vS6aGzs20EosMvz4BDpeSxSAZSkW29AmIkE9s'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Test connection immediately
const testConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('users_67abc23def')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
    } else {
      console.log('✅ Supabase connected successfully')
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err)
  }
}

testConnection()

export default supabase