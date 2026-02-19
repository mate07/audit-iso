import React from 'react';

interface Step {
  id: number;
  name: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="py-4">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li key={step.id} className={`${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
              {step.id < currentStep ? (
                <div className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="ml-4 text-sm font-medium text-foreground">{step.name}</span>
                </div>
              ) : step.id === currentStep ? (
                <div className="flex items-center" aria-current="step">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-primary">
                    <span className="text-sm font-bold">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-bold text-primary">{step.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-muted-foreground">
                    <span className="text-sm font-bold">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-muted-foreground">{step.name}</span>
                </div>
              )}
              
              {index !== steps.length - 1 && (
                <div className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full bg-border" style={{ marginLeft: '2rem' }} />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
