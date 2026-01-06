import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CloudGPT - Unified AI API',
  description: 'A unified API gateway for AI chat, image, and video generation',
};

function Header() {
  return (
    <header style={{ 
      padding: '16px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #eee'
    }}>
      <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
        ☁️ CloudGPT
      </a>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/dashboard">Dashboard</a>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
