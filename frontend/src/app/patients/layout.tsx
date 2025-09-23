import { ReactNode } from 'react';

interface PatientsLayoutProps {
  children: ReactNode;
}

export default function PatientsLayout({ children }: PatientsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}