import { ISODomain, QuestionResponse, ComplianceStatus } from "@/types/audit";

/**
 * Calcula el porcentaje de cumplimiento para una sección (dominio) específica.
 * Fórmula: (Conformes * 1 + Parciales * 0.5) / (Total Preguntas - No Aplica) * 100
 */
export const calculateSectionCompliance = (
  domain: ISODomain,
  responses: Record<string, QuestionResponse>
): number => {
  const domainQuestions = domain.controls.flatMap((c) => c.questions);
  let score = 0;
  let applicableCount = 0;

  domainQuestions.forEach((q) => {
    const response = responses[q.id];
    if (!response || !response.status || response.status === "no-aplica") {
      return;
    }

    applicableCount++;
    if (response.status === "conforme") {
      score += 1;
    } else if (response.status === "parcial") {
      score += 0.5;
    }
  });

  if (applicableCount === 0) return 0;
  return (score / applicableCount) * 100;
};

/**
 * Cuenta el número total de no conformidades detectadas en toda la auditoría.
 */
export const countNonConformities = (
  responses: Record<string, QuestionResponse>
): number => {
  return Object.values(responses).filter(
    (r) => r.status === "no-conforme"
  ).length;
};

/**
 * Calcula el índice global de cumplimiento de la auditoría.
 * Basado en el promedio ponderado de todas las preguntas aplicables respondidas.
 */
export const calculateGlobalIndex = (
  isoData: ISODomain[],
  responses: Record<string, QuestionResponse>
): number => {
  let totalScore = 0;
  let totalApplicable = 0;

  const allQuestions = isoData.flatMap((d) =>
    d.controls.flatMap((c) => c.questions)
  );

  allQuestions.forEach((q) => {
    const response = responses[q.id];
    if (!response || !response.status || response.status === "no-aplica") {
      return;
    }

    totalApplicable++;
    if (response.status === "conforme") {
      totalScore += 1;
    } else if (response.status === "parcial") {
      totalScore += 0.5;
    }
  });

  if (totalApplicable === 0) return 0;
  return (totalScore / totalApplicable) * 100;
};

/**
 * Clasifica el índice global en un nivel de madurez o cumplimiento.
 */
export const getComplianceLevel = (index: number): { label: string; color: string } => {
  if (index >= 90) return { label: "Excelente", color: "text-green-700" };
  if (index >= 75) return { label: "Bueno", color: "text-green-600" };
  if (index >= 50) return { label: "Regular", color: "text-yellow-600" };
  if (index >= 25) return { label: "Deficiente", color: "text-orange-600" };
  return { label: "Crítico", color: "text-red-600" };
};
