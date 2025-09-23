import { ReactNode } from 'react';

interface AppointmentsLayoutProps {
  children: ReactNode;
}

export default function AppointmentsLayout({ children }: AppointmentsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}