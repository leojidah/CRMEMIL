'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugInfo() {
  const [dbStatus, setDbStatus] = useState<string>('Checking...')
  const [authStatus, setAuthStatus] = useState<string>('Checking...')
  const [envStatus, setEnvStatus] = useState<string>('Checking...')

  useEffect(() => {
    checkEnvironment()
    checkDatabase()
    checkAuth()
  }, [])

  const checkEnvironment = () => {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (hasUrl && hasAnonKey) {
      setEnvStatus('✅ Environment variables loaded')
    } else {
      setEnvStatus(`❌ Missing: ${!hasUrl ? 'URL ' : ''}${!hasAnonKey ? 'ANON_KEY' : ''}`)
    }
  }

  const checkDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        setDbStatus(`❌ Database error: ${error.message}`)
      } else {
        setDbStatus('✅ Database connection working')
      }
    } catch (error) {
      setDbStatus(`❌ Database error: ${error}`)
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setAuthStatus(`❌ Auth error: ${error.message}`)
      } else if (session) {
        setAuthStatus(`✅ User logged in: ${session.user.email}`)
      } else {
        setAuthStatus('ℹ️ No user session (not logged in)')
      }
    } catch (error) {
      setAuthStatus(`❌ Auth error: ${error}`)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm text-white p-2 rounded-b-lg text-xs border border-gray-700 border-t-0 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-blue-400 flex items-center gap-1">
          🔧 Debug
        </div>
        <button 
          onClick={() => {
            checkEnvironment()
            checkDatabase()
            checkAuth()
          }}
          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors duration-200"
        >
          🔄
        </button>
      </div>
      <div className="space-y-1">
        <div className="p-1.5 bg-gray-800/50 rounded text-xs">
          <div className="font-mono break-all">{envStatus}</div>
        </div>
        <div className="p-1.5 bg-gray-800/50 rounded text-xs">
          <div className="font-mono break-all">{dbStatus}</div>
        </div>
        <div className="p-1.5 bg-gray-800/50 rounded text-xs">
          <div className="font-mono break-all">{authStatus}</div>
        </div>
      </div>
    </div>
  )
}