import { setRequestLocale } from 'next-intl/server';
import { DashboardNav } from '@/components/layout/DashboardNav';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:pl-64">
        <main className="min-h-screen">
          {props.children}
        </main>
      </div>
    </div>
  );
}
