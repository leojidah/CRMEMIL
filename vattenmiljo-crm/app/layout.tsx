// ============================================================================
// ROOT LAYOUT - Vattenmiljö CRM Application
// ============================================================================

import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import SupabaseAuthProvider from '@/components/providers/SupabaseAuthProvider';
import './globals.css';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal'],
  preload: true,
});

// ============================================================================
// METADATA CONFIGURATION
// ============================================================================

export const metadata: Metadata = {
  // Basic Information
  title: {
    default: 'Vattenmiljö CRM - Kundhantering & Försäljning',
    template: '%s | Vattenmiljö CRM'
  },
  description: 'Professionellt CRM-system för Vattenmiljö. Hantera kunder, schemalägg möten, följ upp försäljning och generera rapporter. Byggt för modern vattenrening och miljöteknik.',
  
  // Keywords for SEO (even though robots are disabled)
  keywords: [
    'Vattenmiljö',
    'CRM',
    'Customer Relationship Management',
    'Kundhantering',
    'Försäljning',
    'Vattenrening',
    'Miljöteknik',
    'Installation',
    'Konsultation',
    'Projektstyrning'
  ],

  // Author Information
  authors: [
    {
      name: 'Vattenmiljö Team',
      url: 'https://vattenmiljo.se'
    }
  ],
  creator: 'Vattenmiljö AB',
  publisher: 'Vattenmiljö AB',

  // Robots Configuration (Private CRM System)
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },

  // Open Graph Tags (for internal sharing)
  openGraph: {
    type: 'website',
    siteName: 'Vattenmiljö CRM',
    title: 'Vattenmiljö CRM - Professionell Kundhantering',
    description: 'Internt CRM-system för Vattenmiljö. Hantera kunder, projekt och försäljning effektivt.',
    locale: 'sv_SE',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vattenmiljö CRM Dashboard',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Vattenmiljö CRM',
    description: 'Professionellt CRM-system för vattenrening och miljöteknik',
    images: ['/twitter-image.jpg'],
  },

  // Icons and Manifest
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3b82f6',
      },
    ],
  },
  manifest: '/site.webmanifest',

  // Application Information
  applicationName: 'Vattenmiljö CRM',
  referrer: 'origin-when-cross-origin',
  category: 'business',

  // Additional Meta Tags
  other: {
    'application-name': 'Vattenmiljö CRM',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#ffffff',
    'color-scheme': 'light',
    'format-detection': 'telephone=yes, email=yes',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Vattenmiljö CRM',
  },
};

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// ============================================================================
// LAYOUT PROPS INTERFACE
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html 
      lang="sv" 
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS Prefetching for Performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect for Critical Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>

      <body 
        className={`
          ${inter.className} 
          font-sans 
          antialiased 
          bg-gray-50 
          text-gray-900 
          selection:bg-blue-100 
          selection:text-blue-900
          min-h-screen
        `}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Hoppa till huvudinnehåll
        </a>

        {/* Main Application Container */}
        <div id="root" className="min-h-screen relative">
          {/* Loading Overlay Container */}
          <div 
            id="loading-overlay" 
            className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm hidden items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Laddar...</p>
            </div>
          </div>

          {/* Main Content */}
          <main id="main-content" className="relative z-0">
            <SupabaseAuthProvider>
              {children}
            </SupabaseAuthProvider>
          </main>
        </div>

        {/* Portal Containers for Dynamic Content */}
        <div id="modal-portal" />
        <div id="tooltip-portal" />
        <div id="notification-portal" />
        <div id="drawer-portal" />

        {/* Global Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Theme Detection and Setup
              (function() {
                // Set initial theme
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                
                // Remove loading class when DOM is ready
                document.addEventListener('DOMContentLoaded', function() {
                  document.body.classList.remove('loading');
                });

                // Performance monitoring
                if (typeof window !== 'undefined' && window.performance) {
                  window.addEventListener('load', function() {
                    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                    console.log('Page load time:', loadTime + 'ms');
                  });
                }

                // Error boundary for global errors
                window.addEventListener('error', function(e) {
                  console.error('Global error:', e.error);
                  // Could send to error reporting service here
                });

                // Unhandled promise rejection handler
                window.addEventListener('unhandledrejection', function(e) {
                  console.error('Unhandled promise rejection:', e.reason);
                  // Could send to error reporting service here
                });
              })();
            `,
          }}
        />

        {/* Development Tools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div id="dev-tools" className="fixed bottom-4 right-4 z-50">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-mono">
              DEV
            </div>
          </div>
        )}

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Vattenmiljö CRM',
              applicationCategory: 'BusinessApplication',
              applicationSubCategory: 'CustomerRelationshipManagement',
              operatingSystem: 'Web Browser',
              description: 'Professionellt CRM-system för Vattenmiljö AB',
              url: 'https://crm.vattenmiljo.se',
              author: {
                '@type': 'Organization',
                name: 'Vattenmiljö AB',
                url: 'https://vattenmiljo.se'
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'SEK'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5.0',
                ratingCount: '1'
              }
            }),
          }}
        />
      </body>
    </html>
  );
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  React.useEffect(() => {
    // Log error to monitoring service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="sv">
      <body className={`${inter.className} font-sans antialiased`}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Error Content */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Något gick fel
            </h1>
            <p className="text-gray-600 mb-6">
              Ett oväntat fel uppstod i applikationen. Vi ber om ursäkt för besväret.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Försök igen
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Ladda om sidan
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Teknisk information
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap break-all">
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                  {error.stack && `\n\nStack trace:\n${error.stack}`}
                </pre>
              </details>
            )}

            {/* Support Information */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
              <p>
                Om problemet kvarstår, kontakta{' '}
                <a 
                  href="mailto:support@vattenmiljo.se" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  support@vattenmiljo.se
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

export function Loading(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">V</span>
        </div>
        
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">
            Vattenmiljö CRM
          </p>
          <p className="text-sm text-gray-600">
            Laddar applikationen...
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOT FOUND COMPONENT
// ============================================================================

export function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 404 Content */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Sidan kunde inte hittas
        </h2>
        <p className="text-gray-600 mb-8">
          Den sida du letar efter existerar inte eller har flyttats. 
          Kontrollera URL:en eller gå tillbaka till startsidan.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Tillbaka till startsidan
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Gå tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}