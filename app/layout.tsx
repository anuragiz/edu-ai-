import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles
import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'EduAI - AI-Powered Learning Platform',
  description: 'AI-Powered Learning Management System with instant doubt assistance.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col font-sans" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col relative">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
