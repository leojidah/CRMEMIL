import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vattenmiljö CRM",
  description: "Sales Workflow System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}