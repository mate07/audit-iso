'use client';

import React from 'react';
import { ISODomain } from '@/types/audit';
import { ISO_27001_DATA } from '@/lib/iso-data';

interface WizardHeaderProps {
  section: ISODomain;
  currentIndex: number;
}

export function WizardHeader({ section, currentIndex }: WizardHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
          Dominio {section.id}
        </span>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Fase {currentIndex + 1} de {ISO_27001_DATA.length}
        </span>
      </div>
      <h1 className="text-4xl font-black tracking-tight text-[#1a365d]">
        {section.title}
      </h1>
      <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl">
        {section.description}
      </p>
    </div>
  );
}
