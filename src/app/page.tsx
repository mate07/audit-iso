'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAudit } from '@/context/AuditContext';
import { Shield, FileText, Plus, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Home() {
  const { progress, totalAnswered, totalQuestionsCount, team, resetAudit } = useAudit();
  
  const hasStarted = progress > 0 || team.length > 0;
  const isCompleted = progress === 100 && totalQuestionsCount > 0;

  const handleNewAudit = async () => {
    const result = await Swal.fire({
      title: '¿Iniciar nueva auditoría?',
      text: "La auditoría actual se guardará en el historial y se iniciará una nueva sesión en blanco.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#1a365d',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, iniciar nueva',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      await resetAudit();
      window.location.href = '/audit/team';
    }
  };

  const stats = [
    { name: 'Auditorías Activas', value: hasStarted ? '1' : '0' },
    { name: 'Progreso Actual', value: `${progress.toFixed(0)}%` },
    { name: 'Controles Evaluados', value: `${totalAnswered}/${totalQuestionsCount}` },
    { name: 'Completadas', value: isCompleted ? '1' : '0' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#1a365d]">Portal de Gestión</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1a365d]">Dashboard de Auditoría</h1>
        <p className="text-muted-foreground text-lg">Bienvenido al sistema de cumplimiento normativo ISO 27001.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="flex flex-col items-center justify-center py-8 border-t-4 border-t-primary">
            <dt className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.name}</dt>
            <dd className="text-4xl font-black tracking-tight text-[#1a365d] mt-2">{stat.value}</dd>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card 
          title="Acciones Rápidas" 
          description="Gestione su proceso de auditoría desde aquí."
          className="h-full"
        >
          <div className="flex flex-col gap-4 mt-4">
            {hasStarted && (
              <Button 
                variant="outline"
                className="w-full justify-between px-6 py-6 h-auto group text-lg font-bold border-primary text-primary hover:bg-primary/5" 
                size="lg"
                onClick={handleNewAudit}
              >
                <div className="flex items-center">
                  <Plus className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform" />
                  Iniciar Nueva Auditoría
                </div>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </Button>
            )}

            <Link href="/audit/team">
              <Button className="w-full justify-between px-6 py-6 h-auto group text-lg font-bold shadow-md" size="lg">
                <div className="flex items-center">
                  {hasStarted ? (
                    <>
                      <ArrowRight className="mr-3 h-6 w-6" />
                      Continuar Auditoría Actual
                    </>
                  ) : (
                    <>
                      <Plus className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform" />
                      Iniciar Primera Auditoría
                    </>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
            
            <Link href="/audit/report">
              <Button variant="outline" className="w-full justify-between px-6 py-6 h-auto group text-lg font-bold" size="lg" disabled={!hasStarted}>
                <div className="flex items-center">
                  <FileText className="mr-3 h-6 w-6" />
                  Ver Reporte de Auditoría
                </div>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card 
          title="Estado de la Auditoría" 
          description="Resumen de la actividad en tiempo real."
          className="h-full"
        >
          <div className="space-y-6 mt-4">
            {hasStarted ? (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-1">
                  <p className="font-black text-[#1a365d]">Evaluación ISO 27001</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {isCompleted ? 'Finalizada' : 'En Ejecución'}
                    </p>
                  </div>
                </div>
                <Link href="/audit/wizard">
                  <Button variant="ghost" size="sm" className="font-bold text-primary gap-1">
                    Gestionar <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Shield className="h-6 w-6 opacity-20" />
                </div>
                <p className="text-muted-foreground font-medium italic">No hay auditorías activas en este momento.</p>
                <Link href="/audit/team">
                  <Button variant="ghost" className="text-primary font-bold hover:bg-transparent hover:underline p-0 h-auto">Comenzar registro de equipo</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
