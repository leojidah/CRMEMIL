'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) {
        setError('Ett fel uppstod. Kontrollera din e-postadress och försök igen.')
      } else {
        setIsSuccess(true)
        setMessage(`Vi har skickat återställningsinstruktioner till ${email}. Kolla din inkorg och följ länken för att återställa ditt lösenord.`)
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Ett oväntat fel uppstod. Försök igen senare.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Glömt lösenord?
            </h2>
            <p className="text-gray-600">
              Ange din e-postadress så skickar vi dig instruktioner för att återställa ditt lösenord.
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-green-700 text-sm">
                  <p className="font-medium mb-1">E-post skickad!</p>
                  <p>{message}</p>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Tillbaka till inloggning</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-postadress
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="din@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Skicka återställningslänk'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Tillbaka till inloggning</span>
                </Link>
              </div>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Har du fortfarande problem?{' '}
              <a 
                href="mailto:support@vattenmiljo.se" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Kontakta support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}