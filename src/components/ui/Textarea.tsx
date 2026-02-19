import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, description, className = '', ...props }, ref) => {
    const id = useId();
    
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label 
            htmlFor={id} 
            className="text-sm font-semibold text-[#2d3748] flex justify-between"
          >
            {label}
            {props.required && <span className="text-destructive text-xs">*</span>}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`
            flex min-h-[100px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm 
            transition-colors placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-destructive ring-destructive/20' : ''}
            ${className}
          `}
          {...props}
        />
        {description && !error && (
          <p className="text-[12px] text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-[12px] font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
