import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setAccessToken(session?.access_token || null)
        console.log('🔑 useSupabaseAuth: Access token:', session?.access_token ? 'Present' : 'Missing')
      } catch (error) {
        console.error('❌ useSupabaseAuth: Error getting session:', error)
        setAccessToken(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 useSupabaseAuth: Auth state changed:', event)
      setAccessToken(session?.access_token || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { accessToken, loading }
}