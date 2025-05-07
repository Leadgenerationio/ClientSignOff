import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Leadgen Approvals',
  description: 'Ad creative approval platform for agencies and clients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = null as any;
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
} 