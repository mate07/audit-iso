import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({ 
  value, 
  size = 'md', 
  showLabel = false, 
  label,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));
  
  const height = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>{label}</span>
          {showLabel && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height[size]} border border-slate-200/50 shadow-inner`}>
        <div 
          className="h-full bg-linear-to-r from-primary to-blue-400 transition-all duration-700 ease-in-out relative" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
           {percentage > 0 && (
             <div className="absolute inset-0 bg-white/20 animate-pulse" />
           )}
        </div>
      </div>
    </div>
  );
}
