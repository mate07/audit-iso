'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuditQuestion, QuestionResponse, ISODomain, Auditor } from '@/types/audit';
import { calculateGlobalIndex, countNonConformities } from '@/lib/audit-utils';
import { generateRecommendations, Recommendation } from '@/lib/analysis-utils';
import { useAuth } from './AuthContext';

interface AuditContextType {
  team: Auditor[];
  setTeam: (members: Auditor[]) => void;

  empresa: string;
  setEmpresa: (val: string) => void;
  direccion: string;
  setDireccion: (val: string) => void;
  responsable: string;
  setResponsable: (val: string) => void;

  currentStepIndex: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;

  responses: Record<string, QuestionResponse>;
  setResponse: (questionId: string, response: QuestionResponse) => void;

  isoData: ISODomain[];
  isCatalogLoading: boolean;
  isAuditLoading: boolean;

  progress: number;
  currentSection: ISODomain | undefined;
  totalAnswered: number;
  totalQuestionsCount: number;
  globalIndex: number;
  nonConformitiesCount: number;
  recommendations: Recommendation[];
  lastSaved: Date | null;
  isSaving: boolean;
  resetAudit: () => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

function createEmptyAuditState() {
  return {
    team: [] as Auditor[],
    empresa: '',
    direccion: '',
    responsable: '',
    currentStepIndex: 0,
    responses: {} as Record<string, QuestionResponse>,
    auditId: null as string | null,
    lastSaved: null as Date | null,
  };
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [team, setTeamState] = useState<Auditor[]>([]);
  const [empresa, setEmpresa] = useState('');
  const [direccion, setDireccion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [isoData, setIsoData] = useState<ISODomain[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isAuditLoading, setIsAuditLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const clearAuditState = () => {
    const emptyState = createEmptyAuditState();
    setTeamState(emptyState.team);
    setEmpresa(emptyState.empresa);
    setDireccion(emptyState.direccion);
    setResponsable(emptyState.responsable);
    setCurrentStepIndex(emptyState.currentStepIndex);
    setResponses(emptyState.responses);
    setLastSaved(emptyState.lastSaved);
    setAuditId(emptyState.auditId);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setIsCatalogLoading(true);
      try {
        const response = await fetch('/api/iso', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Unable to load ISO catalog');
        }

        const catalog = await response.json();
        if (!cancelled) {
          setIsoData(Array.isArray(catalog) ? catalog : []);
        }
      } catch (error) {
        console.error('Failed to load ISO catalog', error);
        if (!cancelled) {
          setIsoData([]);
        }
      } finally {
        if (!cancelled) {
          setIsCatalogLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isCatalogLoading) {
      return;
    }

    if (!user) {
      clearAuditState();
      setIsAuditLoading(false);
      setIsHydrated(false);
      return;
    }

    let cancelled = false;
    setIsAuditLoading(true);
    setIsHydrated(false);

    const initData = async () => {
      try {
        const response = await fetch('/api/audit', { credentials: 'include' });

        if (response.status === 401) {
          clearAuditState();
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load audit');
        }

        const data = await response.json();

        if (!cancelled && data && data.responses) {
          setAuditId(data.id);
          setTeamState(data.team || []);
          setEmpresa(data.empresa || '');
          setDireccion(data.direccion || '');
          setResponsable(data.responsable || '');
          setResponses(data.responses);
          setCurrentStepIndex(data.currentStepIndex || 0);
          setLastSaved(new Date());
        } else if (!cancelled) {
          clearAuditState();
        }
      } catch (error) {
        console.error('Failed to load audit data', error);
        if (!cancelled) {
          clearAuditState();
        }
      } finally {
        if (!cancelled) {
          setIsAuditLoading(false);
          setIsHydrated(true);
        }
      }
    };

    initData();

    return () => {
      cancelled = true;
    };
  }, [user, isCatalogLoading]);

  useEffect(() => {
    if (!user || isCatalogLoading || !isHydrated) {
      return;
    }

    const syncWithDB = async (forceNewAudit = false) => {
      setIsSaving(true);
      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: forceNewAudit ? null : auditId,
            team,
            empresa,
            direccion,
            responsable,
            responses,
            currentStepIndex,
          }),
        });

        if (!res.ok) {
          const errorBody = await res.text();
          if (res.status === 404 && auditId && !forceNewAudit) {
            setAuditId(null);
            return syncWithDB(true);
          }
          throw new Error(`Failed to sync audit (${res.status}): ${errorBody}`);
        }

        const data = await res.json();
        if (data.id && data.id !== auditId) {
          setAuditId(data.id);
        }
        setLastSaved(new Date());
      } catch (error) {
        console.error('Sync error:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const timeout = setTimeout(syncWithDB, 2000);
    return () => clearTimeout(timeout);
  }, [user, isCatalogLoading, isHydrated, auditId, team, responses, currentStepIndex, empresa, direccion, responsable]);

  const resetAudit = async () => {
    if (!user) return;

    try {
      const resp = await fetch('/api/audit', { method: 'DELETE', credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        clearAuditState();
        setAuditId(data.auditId || null);
        setLastSaved(null);
        setIsHydrated(true);
      }
    } catch (error) {
      console.error('Failed to start new audit in DB', error);
    }
  };

  const setTeam = (members: Auditor[]) => {
    setTeamState(members);
  };

  const setResponse = (questionId: string, response: QuestionResponse) => {
    setResponses((prev) => ({ ...prev, [questionId]: response }));
  };

  const nextStep = () => {
    if (currentStepIndex < isoData.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < isoData.length) {
      setCurrentStepIndex(index);
    }
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = isoData.length > 0 && currentStepIndex === isoData.length - 1;
  const currentSection = isoData[currentStepIndex];

  const allQuestions: AuditQuestion[] = isoData.flatMap((domain) =>
    domain.controls.flatMap((control) => control.questions)
  );

  const questionIds = new Set(allQuestions.map((question) => question.id));

  const totalQuestionsCount = allQuestions.length;
  const totalAnswered = Object.entries(responses).filter(([id, response]) =>
    questionIds.has(id) && !!response.status
  ).length;

  const progress = totalQuestionsCount > 0 ? Math.min((totalAnswered / totalQuestionsCount) * 100, 100) : 0;
  const globalIndex = calculateGlobalIndex(isoData, responses);
  const nonConformitiesCount = countNonConformities(responses);
  const recommendations = generateRecommendations(isoData, responses);

  return (
    <AuditContext.Provider
      value={{
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
        isoData,
        isCatalogLoading,
        isAuditLoading,
        progress,
        currentSection,
        totalAnswered,
        totalQuestionsCount,
        globalIndex,
        nonConformitiesCount,
        recommendations,
        lastSaved,
        isSaving,
        resetAudit,
      }}
    >
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
