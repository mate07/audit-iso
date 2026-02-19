import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-[#23416b] shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-[#e2e8f0] border border-border/50",
    outline: "border border-border bg-background hover:bg-secondary text-foreground",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
    destructive: "bg-destructive text-destructive-foreground hover:bg-[#a62828] shadow-sm"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
