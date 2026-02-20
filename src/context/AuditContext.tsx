'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuditQuestion, QuestionResponse, ISODomain, Auditor } from '@/types/audit';
import { ISO_27001_DATA } from '@/lib/iso-data';
import { calculateGlobalIndex, countNonConformities } from '@/lib/audit-utils';
import { generateRecommendations, Recommendation } from '@/lib/analysis-utils';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'iso_audit_data';

interface AuditContextType {
  // Team / Students
  team: Auditor[];
  setTeam: (members: Auditor[]) => void;
  
  // Company Info
  empresa: string;
  setEmpresa: (val: string) => void;
  direccion: string;
  setDireccion: (val: string) => void;
  responsable: string;
  setResponsable: (val: string) => void;
  
  // Navigation
  currentStepIndex: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  
  // Audit Responses
  responses: Record<string, QuestionResponse>;
  setResponse: (questionId: string, response: QuestionResponse) => void;
  
  // Derived State & UX
  progress: number;
  currentSection: ISODomain;
  totalAnswered: number;
  totalQuestionsCount: number;
  globalIndex: number;
  nonConformitiesCount: number;
  recommendations: Recommendation[];
  lastSaved: Date | null;
  isSaving: boolean;
  resetAudit: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [team, setTeamState] = useState<Auditor[]>([]);
  const [empresa, setEmpresa] = useState('');
  const [direccion, setDireccion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);

  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setTeamState([]);
      setEmpresa('');
      setDireccion('');
      setResponsable('');
      setResponses({});
      setCurrentStepIndex(0);
      setLastSaved(null);
      setAuditId(null);
    }
  }, [user]);

  // Load from API (SQLite) then LocalStorage on mount
  useEffect(() => {
    if (!user) return;

    const initData = async () => {
      try {
        const response = await fetch(`/api/audit?userId=${user.id}`);
        const dbData = await response.json();
        
        if (dbData && dbData.responses) {
          setAuditId(dbData.id);
          setTeamState(dbData.team || []);
          setEmpresa(dbData.empresa || '');
          setDireccion(dbData.direccion || '');
          setResponsable(dbData.responsable || '');
          setResponses(dbData.responses);
          setCurrentStepIndex(dbData.currentStepIndex || 0);
          setLastSaved(new Date());
          return;
        }
      } catch (e) {
        console.error("Failed to load from DB, trying localStorage", e);
      }

      // Fallback to localStorage (prefixed by userId)
      const userStorageKey = `${STORAGE_KEY}_${user.id}`;
      const savedData = localStorage.getItem(userStorageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.team) setTeamState(parsed.team);
          if (parsed.responses) setResponses(parsed.responses);
          if (parsed.empresa) setEmpresa(parsed.empresa);
          if (parsed.direccion) setDireccion(parsed.direccion);
          if (parsed.responsable) setResponsable(parsed.responsable);
          if (parsed.currentStepIndex !== undefined) setCurrentStepIndex(parsed.currentStepIndex);
          setLastSaved(new Date());
        } catch (e) {
          console.error("Error loading saved audit data", e);
        }
      }
    };

    initData();
  }, [user]);

  // Sync with SQLite (API) on changes
  useEffect(() => {
    if (!user) return;
    
    const syncWithDB = async () => {
      setIsSaving(true);
      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: auditId,
            userId: user.id,
            team,
            empresa,
            direccion,
            responsable,
            responses,
            currentStepIndex
          })
        });
        
        const data = await res.json();
        if (data.id && !auditId) {
          setAuditId(data.id);
        }

        // Also update localStorage as backup
        const userStorageKey = `${STORAGE_KEY}_${user.id}`;
        localStorage.setItem(userStorageKey, JSON.stringify({
          team,
          empresa,
          direccion,
          responsable,
          responses,
          currentStepIndex
        }));

        setLastSaved(new Date());
      } catch (e) {
        console.error("Sync error:", e);
      } finally {
        setIsSaving(false);
      }
    };

    const timeout = setTimeout(syncWithDB, 2000); // 2s debounce for DB sync
    return () => clearTimeout(timeout);
  }, [user, auditId, team, responses, currentStepIndex, empresa, direccion, responsable]);

  const resetAudit = async () => {
    if (!user) return;
    
    try {
      const resp = await fetch(`/api/audit?userId=${user.id}`, { method: 'DELETE' });
      if (resp.ok) {
        const data = await resp.json();
        // Limpiar estado local
        setTeamState([]);
        setEmpresa('');
        setDireccion('');
        setResponsable('');
        setResponses({});
        setCurrentStepIndex(0);
        setLastSaved(null);
        setAuditId(data.auditId); // Usar el nuevo ID generado por el servidor
        
        const userStorageKey = `${STORAGE_KEY}_${user.id}`;
        localStorage.removeItem(userStorageKey);
      }
    } catch (e) {
      console.error("Failed to start new audit in DB", e);
    }
  };

  // Actions
  const setTeam = (members: Auditor[]) => {
    setTeamState(members);
  };

  const setResponse = (questionId: string, response: QuestionResponse) => {
    setResponses(prev => ({ ...prev, [questionId]: response }));
  };

  const nextStep = () => {
    if (currentStepIndex < ISO_27001_DATA.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < ISO_27001_DATA.length) {
      setCurrentStepIndex(index);
    }
  };
// ... existing code ...
  // Derived Properties
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ISO_27001_DATA.length - 1;
  const currentSection = ISO_27001_DATA[currentStepIndex];

  const allQuestions: AuditQuestion[] = ISO_27001_DATA.flatMap(domain => 
    domain.controls.flatMap(control => control.questions)
  );
  
  const questionIds = new Set(allQuestions.map(q => q.id));
  
  const totalQuestionsCount = allQuestions.length;
  const totalAnswered = Object.entries(responses).filter(([id, r]) => 
    questionIds.has(id) && !!r.status
  ).length;
  
  const progress = totalQuestionsCount > 0 ? Math.min((totalAnswered / totalQuestionsCount) * 100, 100) : 0;
  
  const globalIndex = calculateGlobalIndex(ISO_27001_DATA, responses);
  const nonConformitiesCount = countNonConformities(responses);
  const recommendations = generateRecommendations(ISO_27001_DATA, responses);

  return (
    <AuditContext.Provider value={{
      team,
      setTeam,
      empresa,
      setEmpresa,
      direccion,
      setDireccion,
      responsable,
      setResponsable,
      currentStepIndex,
      nextStep,
      prevStep,
      goToStep,
      isFirstStep,
      isLastStep,
      responses,
      setResponse,
      progress,
      currentSection,
      totalAnswered,
      totalQuestionsCount,
      globalIndex,
      nonConformitiesCount,
      recommendations,
      lastSaved,
      isSaving,
      resetAudit
    }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
