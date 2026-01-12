import type { Metadata } from 'next';
import './globals.css';
import { SyncUser } from '@/components/sync-user';
import { MainLayout } from '@/components/MainLayout';
import { LogtoClientProvider } from '@/components/logto-provider';
import { ClerkProvider } from '@clerk/nextjs';

import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'CloudGPT - Unified AI API',
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
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <LogtoClientProvider>
            <Suspense fallback={null}>
              <SyncUser />
            </Suspense>
            <MainLayout>{children}</MainLayout>
          </LogtoClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
