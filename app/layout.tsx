import type { Metadata } from 'next';
import './globals.css';
import { SyncUser } from '@/components/sync-user';
import { MainLayout } from '@/components/MainLayout';
import { ClerkProvider } from '@clerk/nextjs';

import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Vetra - Unified AI API',
  description: 'A unified API gateway for AI chat, image, and video generation',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <Suspense fallback={null}>
            <SyncUser />
          </Suspense>
          <MainLayout>{children}</MainLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
