'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAudit } from '@/context/AuditContext';
import { ISO_27001_DATA } from '@/lib/iso-data';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SidebarNavigation } from '@/components/layout/SidebarNavigation';
import { AuditChecklist } from '@/features/audit/components/AuditChecklist';
import { WizardHeader } from '@/features/wizard/components/WizardHeader';

export default function WizardPage() {
  const { 
    currentStepIndex, 
    progress, 
    currentSection, 
    nextStep, 
    prevStep, 
    isFirstStep, 
    isLastStep,
    responses,
    setResponse,
    isSaving,
    lastSaved,
    resetAudit
  } = useAudit();

  // Desplazar al inicio al cambiar de sección
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIndex]);

  const handleReset = () => {
    if (confirm('¿Está seguro de que desea reiniciar la auditoría? Se borrarán todos los datos guardados.')) {
      resetAudit();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-24">
      <SidebarNavigation />
      
      <div className="flex-1 space-y-10 min-w-0">
        <WizardHeader section={currentSection} currentIndex={currentStepIndex} />

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <ProgressBar value={progress} showLabel label="Estado Global de la Auditoría" />
        </div>

        <div className="space-y-12">
          {currentSection.controls.map((control) => (
            <div key={control.id} className="space-y-6">
              <div className="flex items-baseline gap-3 border-b-2 border-primary/10 pb-2">
                <span className="text-xl font-black text-primary/40">{control.id}</span>
                <h2 className="text-2xl font-bold text-[#1a365d] tracking-tight">
                  {control.title}
                </h2>
              </div>
              
              <AuditChecklist 
                questions={control.questions}
                responses={responses}
                onResponseChange={setResponse}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-border p-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={isFirstStep}
              className="w-32"
            >
              Anterior
            </Button>
            
            <button 
              onClick={handleReset}
              className="hidden sm:block text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-destructive underline underline-offset-4 transition-colors p-2"
            >
              Reiniciar Auditoría
            </button>
          </div>

          <div className="hidden md:flex flex-col items-center">
             <div className="flex items-center gap-2 mb-0.5">
                {isSaving ? (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                ) : (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isSaving ? 'Guardando...' : 'Cambios Guardados'}
                </span>
             </div>
             {lastSaved && !isSaving && (
               <span className="text-[10px] text-muted-foreground opacity-60 font-mono">
                 {lastSaved.toLocaleTimeString()}
               </span>
             )}
          </div>

          {isLastStep ? (
            <Link href="/audit/report">
              <Button className="w-32 bg-green-700 hover:bg-green-800">
                Finalizar
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={nextStep} 
              className="w-32 bg-[#1a365d] hover:bg-[#2c5282]"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
