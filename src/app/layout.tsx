import type { Metadata } from 'next';
import { Saira_Condensed, Figtree } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';

const saira = Saira_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-saira',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://triplefins.vercel.app'),
  title: 'Triple Fins Swim Program — Swim Strong. Play Hard. Build Champions.',
  description: 'Official Triple Fins Swim Program website. Technique, Endurance, Discipline. Learn to swim, competitive training, and youth camps in Yallahs, St. Thomas, Jamaica.',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Triple Fins Swim Program',
    description: 'Swim Strong. Play Hard. Build Champions. Premier swimming program in St. Thomas, Jamaica.',
    images: ['/brand-assets/TF_Wordmark_A.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${saira.variable} ${figtree.variable}`}>
      <body className="antialiased font-body bg-paper text-ink selection:bg-aqua selection:text-deep">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
