'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthenticatedCRM from '@/components/AuthenticatedCRM'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (!user || error) {
        router.push('/login')
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  // Create a session-like object for compatibility
  const session = {
    user: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email!,
      role: 'salesperson', // Default role since we're using Supabase auth
      isActive: true
    }
  }

  return <AuthenticatedCRM session={session} />
}