import React from 'react';
import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocFlow — Collaborative Rich Text Editor',
  description: 'DocFlow is a lightweight collaborative rich text document editor built for speed, safety, and visual elegance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-white text-gray-900 font-sans min-h-screen flex flex-col overflow-hidden">
        <Providers>
          <div className="flex-1 flex overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
