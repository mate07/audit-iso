'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Auditor } from '@/types/audit';

interface MetricsCardsProps {
  globalIndex: number;
  complianceInfo: { label: string; color: string };
  nonConformitiesCount: number;
  conformeCount: number;
  totalAnswered: number;
  totalQuestionsCount: number;
  team: Auditor[];
}

export function MetricsCards({ 
  globalIndex, 
  complianceInfo, 
  nonConformitiesCount, 
  conformeCount, 
  totalAnswered, 
  totalQuestionsCount,
  team 
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="flex flex-col items-center justify-center py-6 border-l-4 border-l-primary">
        <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Índice Global</span>
        <span className={`text-4xl font-black ${complianceInfo.color}`}>
          {globalIndex.toFixed(1)}%
        </span>
        <span className="text-xs font-medium mt-1 bg-muted px-2 py-0.5 rounded italic">
          Nivel: {complianceInfo.label}
        </span>
      </Card>

      <Card className="flex flex-col items-center justify-center py-6 border-l-4 border-l-red-600">
        <span className="text-xs font-bold text-muted-foreground uppercase mb-1">No Conformidades</span>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <span className="text-4xl font-black text-red-600">{nonConformitiesCount}</span>
        </div>
        <span className="text-xs font-medium mt-1">Hallazgos críticos</span>
      </Card>

      <Card className="flex flex-col items-center justify-center py-6 border-l-4 border-l-green-600">
        <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Conformes</span>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="text-4xl font-black text-green-600">{conformeCount}</span>
        </div>
        <span className="text-xs font-medium mt-1">{totalAnswered}/{totalQuestionsCount} evaluados</span>
      </Card>

      <Card className="flex flex-col items-center justify-center py-6 border-l-4 border-l-slate-400">
        <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Equipo</span>
        <div className="flex -space-x-2 mb-1">
          {team.map((m, i) => (
            <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              {m.nombre.charAt(0)}{m.apellido.charAt(0)}
            </div>
          ))}
          {team.length === 0 && <span className="text-xs text-muted-foreground italic">No registrado</span>}
        </div>
        <span className="text-xs font-medium mt-1">{team.length} Integrantes</span>
      </Card>
    </div>
  );
}
