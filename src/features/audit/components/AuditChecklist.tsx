'use client';

import React from 'react';
import { ComplianceStatus, AuditQuestion, QuestionResponse } from '@/types/audit';
import { Textarea } from '@/components/ui/Textarea';

interface AuditChecklistProps {
  questions: AuditQuestion[];
  responses: Record<string, QuestionResponse>;
  onResponseChange: (id: string, response: QuestionResponse) => void;
}

export function AuditChecklist({ questions, responses, onResponseChange }: AuditChecklistProps) {
  const handleStatusChange = (id: string, status: ComplianceStatus) => {
    const currentResponse = responses[id] || { status: '', notes: '' };
    onResponseChange(id, { ...currentResponse, status });
  };

  const handleNotesChange = (id: string, notes: string) => {
    const currentResponse = responses[id] || { status: '', notes: '' };
    onResponseChange(id, { ...currentResponse, notes });
  };

  const statusOptions: { value: ComplianceStatus; label: string; color: string }[] = [
    { value: 'conforme', label: 'Conforme', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'parcial', label: 'Parcial', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'no-conforme', label: 'No conforme', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'no-aplica', label: 'N/A', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  return (
    <div className="overflow-x-auto border border-border rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-border bg-white">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-1/2">
              Requisito / Control
            </th>
            <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Estado de Cumplimiento
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {questions.map((question) => {
            const response = responses[question.id] || { status: '', notes: '' };
            const isNoteRequired = response.status === 'parcial' || response.status === 'no-conforme';
            const hasError = isNoteRequired && !response.notes.trim();

            return (
              <React.Fragment key={question.id}>
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-6 vertical-top min-w-[300px]">
                    <div className="flex gap-4">
                       <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                          {question.id.split('.').pop() || '•'}
                       </span>
                       <p className="text-sm font-medium text-foreground leading-relaxed">
                        {question.text}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap justify-center gap-2">
                      {statusOptions.map((option) => {
                        const isSelected = response.status === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleStatusChange(question.id, option.value)}
                            className={`
                              px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-tight border transition-all duration-200 cursor-pointer flex items-center gap-1.5
                              ${isSelected 
                                ? `${option.color} scale-105 shadow-md ring-2 ring-offset-1 ring-primary/30 z-10` 
                                : 'bg-white text-muted-foreground border-border hover:bg-muted/50 hover:border-muted-foreground/30'}
                            `}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td colSpan={2} className="px-6 pb-6 pt-0">
                    <div className="pl-10">
                      <Textarea
                        placeholder="Observaciones, hallazgos o evidencias encontradas..."
                        value={response.notes}
                        onChange={(e) => handleNotesChange(question.id, e.target.value)}
                        className={`min-h-[80px] text-sm ${hasError ? 'border-destructive ring-destructive/10' : ''}`}
                        label={isNoteRequired ? "Notas Requeridas" : "Observaciones opcionales"}
                        required={isNoteRequired}
                        error={hasError ? "Es obligatorio documentar los hallazgos para este estado." : undefined}
                      />
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
