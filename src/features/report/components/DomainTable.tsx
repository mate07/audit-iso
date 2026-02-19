'use client';

import React from 'react';
import { ISO_27001_DATA } from '@/lib/iso-data';
import { calculateSectionCompliance } from '@/lib/audit-utils';
import { QuestionResponse } from '@/types/audit';
import { Card } from '@/components/ui/Card';

interface DomainTableProps {
  responses: Record<string, QuestionResponse>;
}

export function DomainTable({ responses }: DomainTableProps) {
  return (
    <Card title="Resumen de Dominios" description="Desglose numérico del cumplimiento por cada sección ISO.">
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-border border rounded-md overflow-hidden">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Dominio</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Preguntas</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Cumplimiento</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {ISO_27001_DATA.map((domain) => {
              const compliance = calculateSectionCompliance(domain, responses);
              const domainQuestions = domain.controls.flatMap(c => c.questions);
              const answered = domainQuestions.filter(q => !!responses[q.id]?.status).length;
              
              return (
                <tr key={domain.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                    {domain.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {domain.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono">
                    {answered}/{domainQuestions.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-primary" style={{ width: `${compliance}%` }} />
                      </div>
                      <span className="text-sm font-black text-[#1a365d] w-12 text-right">
                        {compliance.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
