// ============================================================================
// ROOT LAYOUT - Vattenmiljö CRM
// ============================================================================

import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  preload: true,
});

// ============================================================================
// METADATA CONFIGURATION
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'Vattenmiljö CRM',
    template: '%s | Vattenmiljö CRM'
  },
  description: 'Modern CRM-system för Vattenmiljö - Hantera kunder, möten och försäljning effektivt.',
  
  keywords: [
    'CRM',
    'Customer Management',
    'Vattenmiljö',
    'Sales Management',
    'Customer Relationship Management'
  ],
  
  authors: [
    {
      name: 'Vattenmiljö',
    }
  ],
  
  creator: 'Vattenmiljö',
  publisher: 'Vattenmiljö',
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  metadataBase: new URL('https://crm.vattenmiljo.se'),
  
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://crm.vattenmiljo.se',
    siteName: 'Vattenmiljö CRM',
    title: 'Vattenmiljö CRM',
    description: 'Modern CRM-system för Vattenmiljö - Hantera kunder, möten och försäljning effektivt.',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Vattenmiljö CRM',
    description: 'Modern CRM-system för Vattenmiljö',
  },
  
  robots: {
    index: false, // CRM should not be indexed
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // Security headers
  other: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
};

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
};

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="sv" 
      className={cn(
        inter.variable, 
        poppins.variable,
        'antialiased'
      )}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance and Security */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Vattenmiljö CRM" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vattenmiljö CRM" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for immediate render */
            body { 
              font-family: ${inter.style.fontFamily}, system-ui, sans-serif;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              margin: 0;
              padding: 0;
            }
            
            /* Loading spinner for initial load */
            .initial-loading {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 9999;
            }
            
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e2e8f0;
              border-top: 4px solid #2563eb;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      
      <body 
        className={cn(
          'min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50',
          'font-sans antialiased',
          'selection:bg-primary-100 selection:text-primary-900'
        )}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                     bg-primary-600 text-white px-4 py-2 rounded-lg z-50
                     transition-all duration-200 hover:bg-primary-700"
        >
          Hoppa till huvudinnehåll
        </a>
        
        {/* Main App Container */}
        <div 
          id="app-root" 
          className="relative min-h-screen flex flex-col"
        >
          {/* Background Elements for Visual Appeal */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div 
              className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full 
                         mix-blend-multiply filter blur-xl opacity-20 animate-pulse-glow"
              style={{ animationDelay: '0s', animationDuration: '4s' }}
            />
            <div 
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-400 rounded-full 
                         mix-blend-multiply filter blur-xl opacity-20 animate-pulse-glow"
              style={{ animationDelay: '2s', animationDuration: '6s' }}
            />
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         w-96 h-96 bg-purple-400 rounded-full 
                         mix-blend-multiply filter blur-xl opacity-10 animate-pulse-glow"
              style={{ animationDelay: '4s', animationDuration: '8s' }}
            />
          </div>
          
          {/* Main Content */}
          <main 
            id="main-content"
            className="relative flex-1 w-full"
            role="main"
          >
            {children}
          </main>
          
          {/* Global Loading Indicator */}
          <div 
            id="global-loading" 
            className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm 
                       flex items-center justify-center z-50 hidden"
            role="status"
            aria-label="Laddar..."
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="loading-spinner w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full" />
              <p className="text-sm text-neutral-600 font-medium">Laddar...</p>
            </div>
          </div>
          
          {/* Toast Notification Container */}
          <div 
            id="toast-container"
            className="fixed top-4 right-4 z-50 space-y-2"
            role="alert"
            aria-live="polite"
          />
        </div>
        
        {/* Development Tools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-40">
            <div className="glass-card p-3 bg-opacity-90">
              <div className="flex items-center space-x-2 text-xs text-neutral-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Dev Mode</span>
                <span className="text-neutral-400">|</span>
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register service worker for PWA functionality
              if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Analytics Script (placeholder for future implementation) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize analytics
              window.analytics = {
                track: function(event, properties) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Analytics Track:', event, properties);
                  }
                  // Implementation for production analytics
                }
              };
            `,
          }}
        />
      </body>
    </html>
  );
}

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

/**
 * Custom error boundary wrapper for better error handling
 */
export function withErrorBoundary<T extends {}>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function WrappedComponent(props: T) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Något gick fel
            </h2>
            <p className="text-neutral-600 mb-6">
              Ett oväntat fel uppstod. Försök att ladda om sidan.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
              Ladda om sidan
            </button>
          </div>
        </div>
      </div>
    );
  };
}