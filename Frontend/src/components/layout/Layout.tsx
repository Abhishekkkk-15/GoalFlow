import React from 'react';
import { Navigation } from './Navigation';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
};