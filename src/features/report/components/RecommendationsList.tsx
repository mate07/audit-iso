'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Recommendation } from '@/lib/analysis-utils';
import { Lightbulb, AlertCircle, Shield, ChevronRight } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  isCompleted: boolean;
}

export function RecommendationsList({ recommendations, isCompleted }: RecommendationsListProps) {
  if (!isCompleted) {
    return (
      <Card 
        title="Plan de Mejora Sugerido" 
        description="Las recomendaciones se generarán una vez finalizada la auditoría."
        className="border-dashed border-2 opacity-70"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#1a365d]">Análisis en Proceso</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              El plan de mejora personalizado estará disponible cuando el progreso de la auditoría alcance el 100%.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card title="Plan de Mejora Sugerido" description="No se han generado recomendaciones automáticas.">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <CheckIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1a365d]">¡Excelente desempeño!</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Todos los dominios evaluados cumplen con los estándares mínimos recomendados.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Plan de Mejora Sugerido" 
      description="Recomendaciones automáticas generadas en base a los hallazgos y brechas identificadas."
    >
      <div className="space-y-4 mt-6">
        {recommendations.map((rec, index) => (
          <div 
            key={`${rec.domainId}-${index}`}
            className={`p-5 rounded-lg border-l-4 flex gap-4 transition-all hover:shadow-md ${
              rec.priority === 'alta' 
                ? 'bg-red-50/50 border-l-red-600 border-y border-r border-y-red-100 border-r-red-100' 
                : 'bg-amber-50/50 border-l-amber-500 border-y border-r border-y-amber-100 border-r-amber-100'
            }`}
          >
            <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
              rec.priority === 'alta' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {rec.priority === 'alta' ? <AlertCircle className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[#1a365d] flex items-center gap-2">
                  Dominio {rec.domainId}
                  <ChevronRight className="h-3 w-3 opacity-30" />
                  <span className="text-sm font-bold opacity-80">{rec.domainTitle}</span>
                </h4>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  rec.priority === 'alta' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  Prioridad {rec.priority}
                </span>
              </div>
              
              <p className="text-sm font-medium text-slate-700 italic">
                &quot;{rec.finding}&quot;
              </p>
              
              <div className="pt-2">
                <p className="text-sm text-slate-900 font-bold leading-relaxed bg-white/60 p-3 rounded border border-white/80">
                  <span className="text-primary mr-1">💡 Sugerencia:</span> {rec.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
