import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        <Card className="p-6 md:p-8">
          <header className="mb-8 pb-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-500">Última actualización: {lastUpdated}</p>
          </header>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}
