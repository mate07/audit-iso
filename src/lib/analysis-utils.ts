import { ISODomain, QuestionResponse } from "@/types/audit";
import { calculateSectionCompliance } from "./audit-utils";

export interface Recommendation {
  domainId: string;
  domainTitle: string;
  priority: 'alta' | 'media' | 'baja';
  recommendation: string;
  finding: string;
}

const RECOMMENDATION_RULES: Record<string, string> = {
  "A.5": "Fortalecer el marco normativo mediante la creación de un Comité de Seguridad que apruebe y difunda las políticas de forma anual.",
  "A.6": "Implementar un programa de gestión de dispositivos móviles (MDM) y formalizar los acuerdos de teletrabajo para mitigar riesgos remotos.",
  "A.7": "Establecer procesos de debida diligencia más estrictos en la contratación y programas de concientización continua para todo el personal.",
  "A.9": "Implementar un sistema robusto de Gestión de Identidades y Accesos (IAM) con autenticación multifactor (MFA).",
  "A.10": "Desarrollar y aplicar una política integral de gestión de llaves criptográficas y cifrado de datos en reposo.",
  "A.12": "Mejorar la gestión de cambios y la protección contra malware mediante herramientas de detección y respuesta en endpoints (EDR).",
  "A.17": "Desarrollar y probar regularmente un Plan de Continuidad del Negocio (BCP) y un Plan de Recuperación ante Desastres (DRP).",
  "A.18": "Realizar auditorías legales periódicas para asegurar el cumplimiento con las leyes de protección de datos y requisitos contractuales.",
};

/**
 * Analiza las respuestas de la auditoría y genera recomendaciones automáticas
 * basadas en los hallazgos (No conformidades o bajo cumplimiento).
 */
export const generateRecommendations = (
  isoData: ISODomain[],
  responses: Record<string, QuestionResponse>
): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  isoData.forEach((domain) => {
    const compliance = calculateSectionCompliance(domain, responses);
    const domainQuestions = domain.controls.flatMap((c) => c.questions);
    
    // Buscar si hay alguna no conformidad explícita
    const hasNonConformity = domainQuestions.some(
      (q) => responses[q.id]?.status === "no-conforme"
    );

    // Si el cumplimiento es bajo (< 80%) o hay no conformidades
    if (compliance < 80 || hasNonConformity) {
      const rule = RECOMMENDATION_RULES[domain.id];
      
      if (rule) {
        recommendations.push({
          domainId: domain.id,
          domainTitle: domain.title,
          priority: hasNonConformity || compliance < 40 ? 'alta' : 'media',
          finding: hasNonConformity 
            ? "Se detectaron incumplimientos críticos de la norma." 
            : `El nivel de cumplimiento es del ${compliance.toFixed(0)}%, por debajo del umbral recomendado.`,
          recommendation: rule
        });
      }
    }
  });

  return recommendations;
};
