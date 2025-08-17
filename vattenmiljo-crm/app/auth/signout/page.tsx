'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Droplets } from 'lucide-react'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut()
        console.log('User signed out successfully')
        
        // Redirect to signin page after a short delay
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } catch (error) {
        console.error('Error signing out:', error)
        // Still redirect even if there's an error
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    }

    signOut()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Vattenmiljö CRM</h1>
              <p className="text-blue-100 text-sm">Professionell kundhantering</p>
            </div>
          </div>

          <div className="px-8 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loggar ut...
            </h2>
            <p className="text-gray-600 text-sm">
              Du omdirigeras till inloggningssidan om ett ögonblick
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Vattenmiljö AB • Professionell vattenrening
          </p>
        </div>
      </div>
    </div>
  )
}