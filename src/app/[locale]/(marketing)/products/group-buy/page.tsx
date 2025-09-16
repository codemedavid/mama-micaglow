import type { Metadata } from 'next';
import GroupBuyClient from './GroupBuyClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Group Buy - Mama_MicaGlow',
    description: 'Join group buy batches to purchase individual vials at better prices. Real-time tracking and community-driven purchases.',
  };
}

export default function GroupBuyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <GroupBuyClient />
      </div>
    </div>
  );
}
