import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { SyncUser } from '@/components/sync-user';
import { MainLayout } from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'CloudGPT - Unified AI API',
  description: 'A unified API gateway for AI chat, image, and video generation',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
            <p className="max-w-md text-slate-500 mb-6">
              Please add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to your <code>.env.local</code> file to continue.
            </p>
            <a 
              href="https://dashboard.clerk.com/last-active?path=api-keys" 
              target="_blank" 
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20"
            >
              Get your keys from Clerk
            </a>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <SyncUser />
          <MainLayout>{children}</MainLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
