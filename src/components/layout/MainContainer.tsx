import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainContainer({ children, className = '' }: MainContainerProps) {
  return (
    <main className={`container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl min-h-[calc(100vh-4rem)] ${className}`}>
      {children}
    </main>
  );
}
