import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoded values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

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