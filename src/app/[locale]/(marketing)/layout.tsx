import type { Metadata } from 'next';
import { Footer } from '@/components/layout/Footer';
import { Navigation } from '@/components/layout/Navigation';
import { CartProvider } from '@/contexts/CartContext';

export const metadata: Metadata = {
  title: 'Mama_MicaGlow - Premium Peptide Retail Platform',
  description: 'Discover premium peptides with individual buying, group buy, and regional sub-group options. Philippine Peso pricing with secure transactions.',
  keywords: 'peptides, group buy, individual purchase, Philippines, Mama_MicaGlow',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
