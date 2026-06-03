import type { ReactNode } from 'react';

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen min-h-screen bg-background">
      {children}
    </div>
  );
}
