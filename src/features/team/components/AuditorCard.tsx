'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Auditor, AuditorError } from '@/types/audit';

interface AuditorCardProps {
  member: Auditor;
  index: number;
  errors?: AuditorError;
  onUpdate: (id: string, field: keyof Auditor, value: string) => void;
  onRemove?: (id: string) => void;
  showRemove: boolean;
}

export function AuditorCard({ 
  member, 
  index, 
  errors, 
  onUpdate, 
  onRemove, 
  showRemove 
}: AuditorCardProps) {
  return (
    <Card 
      title={`Integrante #${index + 1}`}
      className="relative animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {showRemove && onRemove && (
        <button 
          onClick={() => onRemove(member.id)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors p-2 cursor-pointer"
          title="Eliminar integrante"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input 
          label="Nombre" 
          value={member.nombre}
          onChange={(e) => onUpdate(member.id, 'nombre', e.target.value)}
          placeholder="Ej. Juan"
          error={errors?.nombre}
          required
        />
        <Input 
          label="Apellido" 
          value={member.apellido}
          onChange={(e) => onUpdate(member.id, 'apellido', e.target.value)}
          placeholder="Ej. Pérez"
          error={errors?.apellido}
          required
        />
        <Input 
          label="Carnet" 
          value={member.carnet}
          onChange={(e) => onUpdate(member.id, 'carnet', e.target.value)}
          placeholder="Ej. AB12345"
          error={errors?.carnet}
          required
        />
      </div>
    </Card>
  );
}
