// ============================================================================
// ROOT LAYOUT - App Layout & Metadata
// ============================================================================

import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'Vattenmiljö CRM',
    template: '%s | Vattenmiljö CRM'
  },
  description: 'Customer Relationship Management system för Vattenmiljö',
  keywords: [
    'CRM',
    'Vattenmiljö',
    'Customer Management',
    'Sales',
    'Installation'
  ],
  authors: [
    {
      name: 'Vattenmiljö Team',
    }
  ],
  creator: 'Vattenmiljö',
  publisher: 'Vattenmiljö',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#ffffff',
  },
};

// ============================================================================
// LAYOUT COMPONENT
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="sv" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-neutral-50`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
        
        {/* Portal root for modals, tooltips, etc. */}
        <div id="portal-root" />
        
        {/* Loading indicator container */}
        <div id="loading-root" />
        
        {/* Notification container */}
        <div id="notification-root" />
      </body>
    </html>
  );
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

export function Loading(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neutral-200 rounded-full animate-spin border-t-primary-500" />
        </div>
        <div className="text-sm text-neutral-600 font-medium">
          Laddar...
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR COMPONENT
// ============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function Error({ error, reset }: ErrorProps): JSX.Element {
  React.useEffect(() => {
    // Log the error to error reporting service
    console.error('Layout Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Något gick fel
        </h2>
        
        <p className="text-neutral-600 mb-6">
          Ett oväntat fel uppstod. Vänligen försök igen.
        </p>
        
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Försök igen
        </button>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
              Teknisk information
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded border overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// NOT FOUND COMPONENT
// ============================================================================

export function NotFound(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-neutral-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Sidan kunde inte hittas
        </h2>
        
        <p className="text-neutral-600 mb-6">
          Den sida du letar efter existerar inte eller har flyttats.
        </p>
        
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Tillbaka till startsidan
        </a>
      </div>
    </div>
  );
}