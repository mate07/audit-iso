'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useAudit } from '@/context/AuditContext';
import { calculateSectionCompliance, getComplianceLevel } from '@/lib/audit-utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Shield, Download, FileText } from 'lucide-react';
import Link from 'next/link';

import { MetricsCards } from '@/features/report/components/MetricsCards';
import { DomainTable } from '@/features/report/components/DomainTable';
import { RecommendationsList } from '@/features/report/components/RecommendationsList';
import { downloadAuditReportPdf } from '@/lib/pdf-report';

export default function ReportPage() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const {
    team,
    responses,
    globalIndex,
    nonConformitiesCount,
    totalAnswered,
    totalQuestionsCount,
    recommendations,
    progress,
    isoData,
    isCatalogLoading,
    isAuditLoading,
  } = useAudit();

  const complianceInfo = getComplianceLevel(globalIndex);

  const radarData = useMemo(() => {
    return isoData.map((domain) => ({
      subject: domain.id,
      A: calculateSectionCompliance(domain, responses),
      fullMark: 100,
    }));
  }, [isoData, responses]);

  const statusData = useMemo(() => {
    const counts = { conforme: 0, parcial: 0, 'no-conforme': 0, 'no-aplica': 0 };
    Object.values(responses).forEach((response) => {
      if (response.status) {
        counts[response.status as keyof typeof counts]++;
      }
    });

    return [
      { name: 'Conforme', value: counts.conforme, color: '#15803d' },
      { name: 'Parcial', value: counts.parcial, color: '#ca8a04' },
      { name: 'No Conforme', value: counts['no-conforme'], color: '#b91c1c' },
      { name: 'No Aplica', value: counts['no-aplica'], color: '#4b5563' },
    ];
  }, [responses]);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      if (!reportRef.current) {
        throw new Error('No se encontró el reporte para exportar.');
      }
      await downloadAuditReportPdf({
        generatedAt: new Date(),
        team,
        responses,
        globalIndex,
        nonConformitiesCount,
        totalAnswered,
        totalQuestionsCount,
        isoData,
        recommendations,
        radarData,
        statusData,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isCatalogLoading || isAuditLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Cargando reporte...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Informe Ejecutivo Final</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1a365d]">
            Resultado de Auditoría ISO 27001
          </h1>
          <p className="text-muted-foreground">Analisis detallado del estado de cumplimiento y brechas de seguridad.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownloadPdf} className="gap-2 bg-primary print:hidden" disabled={isGeneratingPdf}>
            <Download className="h-4 w-4" />
            {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8">
        <MetricsCards
          globalIndex={globalIndex}
          complianceInfo={complianceInfo}
          nonConformitiesCount={nonConformitiesCount}
          conformeCount={statusData.find((domain) => domain.name === 'Conforme')?.value || 0}
          totalAnswered={totalAnswered}
          totalQuestionsCount={totalQuestionsCount}
          team={team}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Cumplimiento por Dominio" description="Visualización radial de la madurez en cada sección de la norma.">
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar
                    name="Cumplimiento %"
                    dataKey="A"
                    stroke="#2c5282"
                    fill="#2c5282"
                    fillOpacity={0.6}
                  />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Distribución de Hallazgos" description="Recuento total de estados asignados en la auditoría.">
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <RecommendationsList recommendations={recommendations} isCompleted={progress === 100} />

        <DomainTable domains={isoData} responses={responses} />

        <div className="flex items-center justify-between border-t border-border pt-8">
          <Link href="/audit/wizard">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" /> Volver al Wizard
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Generado automáticamente por el Sistema de Gestión Académico ISO 27001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
