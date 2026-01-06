import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { BookOpen, Cloud, LayoutDashboard, Rocket, Zap } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'CloudGPT - Unified AI API',
  description: 'A unified API gateway for AI chat, image, and video generation',
};

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <a href="/" className="text-xl font-bold tracking-tight hover:opacity-90">
            CloudGPT
          </a>
        </div>
        
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </a>
            <a href="/playground" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <Zap className="h-4 w-4" />
              Playground
            </a>
            <a href="/models" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <Rocket className="h-4 w-4" />
              Models
            </a>
            <a href="/docs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <BookOpen className="h-4 w-4" />
              Docs
            </a>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 border-2 border-primary/20"
                  }
                }}
              />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}

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
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <Header />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
