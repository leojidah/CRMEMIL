'use client'

import React from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { UserX, Mail, LogOut } from 'lucide-react'

export default function InactiveUserPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserX className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Kontot är inaktiverat
            </h2>
            <p className="text-gray-600 mb-6">
              Ditt användarkonto har tillfälligt inaktiverats. Kontakta administratören för att återaktivera ditt konto.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-700 text-sm">
                <p className="font-medium mb-1">Behöver du hjälp?</p>
                <p>Kontakta din administratör eller IT-support för att återaktivera ditt konto.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logga ut</span>
            </button>

            <div className="text-center">
              <Link 
                href="/auth/signin"
                className="text-sm text-gray-600 hover:text-gray-700 underline"
              >
                Tillbaka till inloggning
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Kontaktinformation</h3>
              <div className="space-y-1 text-xs text-gray-500">
                <p>
                  <span className="font-medium">E-post:</span>{' '}
                  <a href="mailto:admin@vattenmiljo.se" className="text-blue-600 hover:text-blue-700 underline">
                    admin@vattenmiljo.se
                  </a>
                </p>
                <p>
                  <span className="font-medium">Telefon:</span> 08-123 45 67
                </p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
              Kontostatus
            </h4>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Inaktiverat konto</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ditt konto har inaktiverats av en administratör. Detta kan bero på säkerhetsskäl, 
              organisationsförändringar eller andra administrativa beslut.
            </p>
          </div>

          {/* Help Information */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">
              Nästa steg
            </h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Kontakta din systemadministratör</li>
              <li>• Uppge ditt användarnamn eller e-post</li>
              <li>• Vänta på bekräftelse om återaktivering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}