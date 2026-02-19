'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Auditor, AuditorError } from '@/types/audit';
import { v4 as uuidv4 } from 'uuid';
import { useAudit } from '@/context/AuditContext';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AuditorCard } from '@/features/team/components/AuditorCard';

export default function TeamRegistrationPage() {
  const { 
    team: globalTeam, setTeam: setGlobalTeam,
    empresa, setEmpresa,
    direccion, setDireccion,
    responsable, setResponsable
  } = useAudit();
  
  const [team, setTeam] = useState<Auditor[]>(
    globalTeam.length > 0 
      ? globalTeam 
      : [{ id: uuidv4(), nombre: '', apellido: '', carnet: '' }]
  );
  const [errors, setErrors] = useState<Record<string, AuditorError>>({});
  const [companyErrors, setCompanyErrors] = useState({ empresa: '', direccion: '', responsable: '' });

  const addMember = () => {
    if (team.length < 3) {
      setTeam([...team, { id: uuidv4(), nombre: '', apellido: '', carnet: '' }]);
    }
  };

  const removeMember = (id: string) => {
    if (team.length > 1) {
      setTeam(team.filter(m => m.id !== id));
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updateMember = (id: string, field: keyof Auditor, value: string) => {
    const updatedTeam = team.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    setTeam(updatedTeam);
    validateMember(id, field, value, updatedTeam);
  };

  const validateMember = (id: string, field: keyof Auditor, value: string, currentTeam: Auditor[]) => {
    const memberErrors: AuditorError = { ...errors[id] };
    
    if (!value.trim()) {
      memberErrors[field as keyof AuditorError] = 'Este campo es requerido';
    } else {
      delete memberErrors[field as keyof AuditorError];
    }

    if (field === 'carnet' && value.trim()) {
      const isDuplicate = currentTeam.some(m => m.id !== id && m.carnet.trim().toLowerCase() === value.trim().toLowerCase());
      if (isDuplicate) {
        memberErrors.carnet = 'Este carnet ya ha sido ingresado en el equipo';
      }
    }

    setErrors({ ...errors, [id]: memberErrors });
  };
  const validateCompany = () => {
    const newErrors = {
      empresa: !empresa.trim() ? 'El nombre de la empresa es requerido' : '',
      direccion: !direccion.trim() ? 'La dirección es requerida' : '',
      responsable: !responsable.trim() ? 'La persona responsable es requerida' : ''
    };
    setCompanyErrors(newErrors);
    return !Object.values(newErrors).some(e => !!e);
  };

  const isFormValid = () => {
    const hasEmptyCompany = !empresa.trim() || !direccion.trim() || !responsable.trim();
    const hasEmptyFields = team.some(m => !m.nombre || !m.apellido || !m.carnet);
    const hasErrors = Object.values(errors).some(e => Object.keys(e).length > 0);
    return !hasEmptyCompany && !hasEmptyFields && !hasErrors;
  };

  const handleConfirm = () => {
    if (isFormValid()) {
      setGlobalTeam(team);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Fase de Registro
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a365d]">
          Información General
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete los datos de la organización y el equipo auditor.
        </p>
      </div>

      <Card title="Datos de la Empresa" className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input 
              label="Nombre de la Empresa" 
              placeholder="Ej. Corporación Tecnológica S.A."
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              error={companyErrors.empresa}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Input 
              label="Dirección" 
              placeholder="Calle Principal, Edificio X, Ciudad"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              error={companyErrors.direccion}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Input 
              label="Persona Responsable" 
              placeholder="Nombre de contacto en la empresa"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              error={companyErrors.responsable}
              required
            />
          </div>
        </div>
      </Card>

      <div className="pt-4">
        <h2 className="text-xl font-bold text-[#1a365d] mb-4">Equipo Auditor</h2>
        <div className="space-y-6">
          {team.map((member, index) => (
            <AuditorCard 
              key={member.id}
              member={member}
              index={index}
              errors={errors[member.id]}
              onUpdate={updateMember}
              onRemove={removeMember}
              showRemove={team.length > 1}
            />
          ))}

          {team.length < 3 && (
            <button 
              onClick={addMember}
              className="w-full py-4 border-2 border-dashed border-border rounded-md text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-semibold flex items-center justify-center gap-2 group"
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar otro integrante al equipo
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border">
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground">
            Volver al Escritorio
          </Button>
        </Link>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {
            setTeam([{ id: uuidv4(), nombre: '', apellido: '', carnet: '' }]);
            setEmpresa('');
            setDireccion('');
            setResponsable('');
          }}>
             Limpiar Todo
          </Button>
          <Link href="/audit/wizard">
            <Button disabled={!isFormValid()} onClick={handleConfirm}>
              Confirmar Datos y Continuar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
