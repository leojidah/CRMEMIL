import type { Metadata } from "next";
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";

// Optimized font loading
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins', 
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Vattenmiljö CRM - Modern Sales Workflow",
  description: "Effektiv kundhantering och säljworkflow för Vattenmiljö. Modern CRM-system med intuitiv design.",
  keywords: ["CRM", "Kundhantering", "Säljworkflow", "Vattenmiljö", "Modern", "Effektiv"],
  authors: [{ name: "Vattenmiljö Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
  robots: "index, follow",
  openGraph: {
    title: "Vattenmiljö CRM - Modern Sales Workflow",
    description: "Effektiv kundhantering och säljworkflow för Vattenmiljö",
    type: "website",
    locale: "sv_SE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Preload critical fonts for better performance */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap" 
          as="style" 
        />
        {/* Optimize loading */}
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={`${inter.className} antialiased bg-neutral-50 text-neutral-900`}>
        {/* Modern smooth scrolling container */}
        <div className="relative min-h-screen">
          {children}
        </div>
        
        {/* Subtle background pattern for visual interest */}
        <div className="fixed inset-0 -z-10 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #2563eb 2px, transparent 0), 
                             radial-gradient(circle at 75px 75px, #10b981 2px, transparent 0)`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>
      </body>
    </html>
  );
}