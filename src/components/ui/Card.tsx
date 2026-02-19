import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export function Card({ children, className = '', title, description, footer }: CardProps) {
  return (
    <div className={`overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-sm ${className}`}>
      {(title || description) && (
        <div className="flex flex-col space-y-1 p-6 bg-muted/50 border-b border-border/50">
          {title && <h3 className="text-lg font-semibold tracking-tight text-[#1a365d]">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="flex items-center p-6 pt-0 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
}
