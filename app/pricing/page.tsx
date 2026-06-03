import { Suspense } from 'react';
import PricingPageContent from './pricing-content';

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-12 text-center text-muted-foreground">Cargando...</div>}>
      <PricingPageContent />
    </Suspense>
  );
}
