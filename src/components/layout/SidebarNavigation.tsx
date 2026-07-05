'use client';

import { useAudit } from '@/context/AuditContext';

export function SidebarNavigation() {
  const { currentStepIndex, goToStep, responses, isoData, isCatalogLoading } = useAudit();

  if (isCatalogLoading || isoData.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block w-72 shrink-0 space-y-4">
      <div className="sticky top-24">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2 mb-4">
          Dominios ISO 27001
        </h2>
        <nav className="space-y-1">
          {isoData.map((section, index) => {
            const isCurrent = index === currentStepIndex;
            const domainQuestions = section.controls.flatMap((control) => control.questions);
            const isCompleted =
              domainQuestions.length > 0 &&
              domainQuestions.every((question) => !!responses[question.id]?.status);

            return (
              <button
                key={section.id}
                onClick={() => goToStep(index)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group
                  ${
                    isCurrent
                      ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1'
                      : isCompleted
                        ? 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-100'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5'
                  }
                `}
              >
                <div
                  className={`
                  flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black border transition-colors
                  ${
                    isCurrent
                      ? 'bg-white/20 border-white/30 text-white'
                      : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-border text-muted-foreground group-hover:border-primary/30'
                  }
                `}
                >
                  {isCompleted && !isCurrent ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    section.id
                  )}
                </div>
                <span className="truncate flex-1 text-left">{section.title}</span>
                {isCompleted && !isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
