'use client';

import { jsPDF } from 'jspdf';
import type { Auditor, ISODomain, QuestionResponse } from '@/types/audit';
import { calculateSectionCompliance, getComplianceLevel } from '@/lib/audit-utils';
import type { Recommendation } from '@/lib/analysis-utils';

export interface AuditReportPdfInput {
  generatedAt: Date;
  team: Auditor[];
  responses: Record<string, QuestionResponse>;
  globalIndex: number;
  nonConformitiesCount: number;
  totalAnswered: number;
  totalQuestionsCount: number;
  isoData: ISODomain[];
  recommendations: Recommendation[];
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
  statusData: Array<{ name: string; value: number; color: string }>;
}

type PdfDoc = jsPDF;

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 14;
const TOP_Y = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const PRIMARY = '#2c5282';
const PRIMARY_DARK = '#1a365d';
const TEXT = '#1f2937';
const MUTED = '#64748b';
const BORDER = '#dbe3ef';
const BG = '#ffffff';
const RED = '#dc2626';
const GREEN = '#16a34a';
const AMBER = '#d97706';
const SLATE = '#64748b';

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(date: Date): string {
  return date.toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStatusCounts(responses: Record<string, QuestionResponse>) {
  const counts = { conforme: 0, parcial: 0, 'no-conforme': 0, 'no-aplica': 0 };
  Object.values(responses).forEach((response) => {
    if (response.status) {
      counts[response.status as keyof typeof counts] += 1;
    }
  });
  return counts;
}

function normalizePriority(priority: Recommendation['priority']) {
  if (priority === 'alta') return RED;
  if (priority === 'media') return AMBER;
  return GREEN;
}

function addPageHeader(doc: PdfDoc, generatedAt: Date, pageTitle: string) {
  doc.setFillColor(PRIMARY_DARK);
  doc.rect(0, 0, PAGE_WIDTH, 11, 'F');

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SGA ISO 27001', MARGIN_X, TOP_Y + 3);

  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sistema de Gestión Académico', MARGIN_X, TOP_Y + 7.2);

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(pageTitle, PAGE_WIDTH - MARGIN_X, TOP_Y + 3, { align: 'right' });

  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Generado: ${formatDate(generatedAt)}`, PAGE_WIDTH - MARGIN_X, TOP_Y + 7.2, { align: 'right' });
}

function addFooter(doc: PdfDoc, pageNumber: number, totalPages: number) {
  doc.setDrawColor(BORDER);
  doc.line(MARGIN_X, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 14);
  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Página ${pageNumber} de ${totalPages}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 8, {
    align: 'right',
  });
}

function sectionTitle(doc: PdfDoc, title: string, subtitle?: string, y = 0) {
  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, MARGIN_X, y);
  if (subtitle) {
    doc.setTextColor(MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(subtitle, MARGIN_X, y + 5);
  }
}

function metricCard(doc: PdfDoc, x: number, y: number, w: number, h: number, title: string, value: string, accent: string, subtitle?: string) {
  doc.setDrawColor(BORDER);
  doc.setFillColor(BG);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  doc.setFillColor(accent);
  doc.rect(x, y, 2.2, h, 'F');

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(title, x + 7, y + 8);

  doc.setTextColor(accent);
  doc.setFontSize(18);
  doc.text(value, x + 7, y + 18);

  if (subtitle) {
    doc.setTextColor(TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(subtitle, w - 10);
    doc.text(lines, x + 7, y + 28);
  }
}

function barChartRow(doc: PdfDoc, x: number, y: number, label: string, value: number, max: number, color: string) {
  const labelWidth = 38;
  const barWidth = 105;
  const pctWidth = 16;
  const barX = x + labelWidth + 2;
  const pct = max === 0 ? 0 : (value / max) * 100;

  doc.setTextColor(TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(label, x, y + 4.5);

  doc.setDrawColor(BORDER);
  doc.setFillColor('#edf2f7');
  doc.roundedRect(barX, y + 1, barWidth, 4, 1.5, 1.5, 'F');
  doc.setFillColor(color);
  doc.roundedRect(barX, y + 1, Math.max(3, (barWidth * value) / max), 4, 1.5, 1.5, 'F');

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(`${value}`, barX + barWidth + 3, y + 4.5);
  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  doc.text(`${pct.toFixed(0)}%`, barX + barWidth + pctWidth, y + 4.5);
}

function drawRadarChart(
  doc: PdfDoc,
  data: Array<{ subject: string; A: number }>,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const centerX = x + w / 2;
  const centerY = y + h / 2 + 2;
  const radius = Math.min(w, h) / 2 - 10;
  const levels = 4;
  const count = Math.max(1, data.length);
  const angleStep = (Math.PI * 2) / count;

  const pointAt = (value: number, index: number) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const distance = radius * (Math.max(0, Math.min(value, 100)) / 100);
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      angle,
    };
  };

  doc.setDrawColor('#dbe3ef');
  doc.setLineWidth(0.2);

  for (let level = 1; level <= levels; level += 1) {
    const ringRadius = (radius * level) / levels;
    const ringPoints = data.map((_, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      return {
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius,
      };
    });

    for (let i = 0; i < ringPoints.length; i += 1) {
      const current = ringPoints[i];
      const next = ringPoints[(i + 1) % ringPoints.length];
      doc.line(current.x, current.y, next.x, next.y);
    }
  }

  data.forEach((item, index) => {
    const axis = pointAt(100, index);
    doc.line(centerX, centerY, axis.x, axis.y);
  });

  const polygonPoints = data.map((item, index) => pointAt(item.A, index));
  doc.setFillColor('#dbeafe');
  doc.setDrawColor(PRIMARY);
  doc.setLineWidth(0.5);
  for (let i = 0; i < polygonPoints.length; i += 1) {
    const current = polygonPoints[i];
    const next = polygonPoints[(i + 1) % polygonPoints.length];
    doc.line(current.x, current.y, next.x, next.y);
  }

  polygonPoints.forEach((point) => {
    doc.setFillColor(PRIMARY);
    doc.circle(point.x, point.y, 0.8, 'F');
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(PRIMARY_DARK);
  data.forEach((item, index) => {
    const axis = pointAt(100, index);
    const labelOffsetX = axis.x < centerX ? -4 : 4;
    const labelOffsetY = axis.y < centerY ? -2 : 4;
    doc.text(item.subject, axis.x + labelOffsetX, axis.y + labelOffsetY, {
      align: axis.x < centerX ? 'right' : 'left',
    });
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text('Índice por dominio', x + 4, y + h - 2);
}

function drawTeam(doc: PdfDoc, team: Auditor[], y: number) {
  doc.setDrawColor(BORDER);
  doc.setFillColor(BG);
  doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, 28, 2, 2, 'FD');

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Equipo auditor', MARGIN_X + 6, y + 8);

  doc.setTextColor(TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const names = team.length > 0
    ? team.map((member) => `${member.nombre} ${member.apellido} <${member.email}>`).join(' | ')
    : 'No registrado';
  const lines = doc.splitTextToSize(names, CONTENT_WIDTH - 12);
  doc.text(lines, MARGIN_X + 6, y + 15);
}

function drawSummaryTable(
  doc: PdfDoc,
  isoData: ISODomain[],
  responses: Record<string, QuestionResponse>,
  generatedAt: Date,
  y: number
) {
  let cursorY = y;
  sectionTitle(doc, 'Resumen por dominio', 'Cumplimiento y avance de la auditoría', cursorY);
  cursorY += 9;

  const domainColX = MARGIN_X + 4;
  const descriptionColX = MARGIN_X + 28;
  const questionsColX = MARGIN_X + 123;
  const complianceBarX = PAGE_WIDTH - MARGIN_X - 42;
  const compliancePercentX = PAGE_WIDTH - MARGIN_X - 4;
  const complianceBarWidth = 24;

  doc.setFillColor('#f8fafc');
  doc.setDrawColor(BORDER);
  doc.rect(MARGIN_X, cursorY, CONTENT_WIDTH, 10, 'FD');

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Dominio', domainColX, cursorY + 6.5);
  doc.text('Descripción', descriptionColX, cursorY + 6.5);
  doc.text('Preguntas', questionsColX, cursorY + 6.5, { align: 'center' });
  doc.text('Cumplimiento', compliancePercentX, cursorY + 6.5, { align: 'right' });

  cursorY += 10;

  isoData.forEach((domain) => {
    const compliance = calculateSectionCompliance(domain, responses);
    const domainQuestions = domain.controls.flatMap((control) => control.questions);
    const answered = domainQuestions.filter((question) => !!responses[question.id]?.status).length;

    if (cursorY > PAGE_HEIGHT - 45) {
      doc.addPage();
      addPageHeader(doc, generatedAt, 'Resultado de Auditoría ISO 27001');
      cursorY = 22;
    }

    doc.setDrawColor(BORDER);
    doc.rect(MARGIN_X, cursorY, CONTENT_WIDTH, 12, 'S');

    doc.setTextColor(PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    doc.text(domain.id, domainColX, cursorY + 7);

    doc.setTextColor(TEXT);
    doc.setFont('helvetica', 'normal');
    const desc = doc.splitTextToSize(domain.title, 82);
    doc.text(desc.slice(0, 2), descriptionColX, cursorY + 5);

    doc.setTextColor(TEXT);
    doc.text(`${answered}/${domainQuestions.length}`, questionsColX, cursorY + 7, { align: 'center' });

    doc.setTextColor(PRIMARY_DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPercent(compliance), compliancePercentX, cursorY + 7, { align: 'right' });

    doc.setFillColor('#e2e8f0');
    doc.roundedRect(complianceBarX, cursorY + 4.5, complianceBarWidth, 3, 1, 1, 'F');
    doc.setFillColor(compliance >= 80 ? GREEN : compliance >= 60 ? AMBER : RED);
    doc.roundedRect(complianceBarX, cursorY + 4.5, Math.max(2, complianceBarWidth * (compliance / 100)), 3, 1, 1, 'F');

    cursorY += 12;
  });

  return cursorY;
}

function drawRecommendations(doc: PdfDoc, recommendations: Recommendation[], generatedAt: Date, y: number) {
  let cursorY = y;
  const drawHeading = (headingY: number) => {
    sectionTitle(doc, 'Recomendaciones', 'Plan de mejora sugerido', headingY);
    return headingY + 10;
  };

  cursorY = drawHeading(cursorY);

  if (recommendations.length === 0) {
    doc.setDrawColor(BORDER);
    doc.setFillColor('#f8fafc');
    doc.roundedRect(MARGIN_X, cursorY, CONTENT_WIDTH, 18, 2, 2, 'FD');
    doc.setTextColor(TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('No se generaron recomendaciones automáticas.', MARGIN_X + 6, cursorY + 11);
    return cursorY + 20;
  }

  recommendations.forEach((recommendation) => {
    const badgeColor = normalizePriority(recommendation.priority);
    const boxHeight = recommendation.priority === 'alta' ? 40 : 36;
    if (cursorY > PAGE_HEIGHT - 55) {
      doc.addPage();
      addPageHeader(doc, generatedAt, 'Resultado de Auditoría ISO 27001');
      cursorY = drawHeading(34);
    }

    doc.setDrawColor(BORDER);
    doc.setFillColor('#ffffff');
    doc.roundedRect(MARGIN_X, cursorY, CONTENT_WIDTH, boxHeight, 2, 2, 'FD');
    doc.setFillColor(badgeColor);
    doc.rect(MARGIN_X, cursorY, 2.2, boxHeight, 'F');

    doc.setTextColor(PRIMARY_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Dominio ${recommendation.domainId} - ${recommendation.domainTitle}`, MARGIN_X + 6, cursorY + 8);

    doc.setFillColor(badgeColor);
    doc.roundedRect(PAGE_WIDTH - MARGIN_X - 28, cursorY + 4, 24, 6, 2, 2, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(7.5);
    doc.text(`Prioridad ${recommendation.priority}`, PAGE_WIDTH - MARGIN_X - 16, cursorY + 8.2, { align: 'center' });

    doc.setTextColor(TEXT);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const finding = doc.splitTextToSize(`"${recommendation.finding}"`, CONTENT_WIDTH - 12);
    doc.text(finding.slice(0, 2), MARGIN_X + 6, cursorY + 15);

    doc.setFont('helvetica', 'normal');
    const recLines = doc.splitTextToSize(recommendation.recommendation, CONTENT_WIDTH - 12);
    doc.text(recLines.slice(0, 2), MARGIN_X + 6, cursorY + 24);

    cursorY += boxHeight + 4;
  });

  return cursorY;
}

function buildStatusSection(doc: PdfDoc, counts: ReturnType<typeof getStatusCounts>, y: number) {
  let cursorY = y;
  sectionTitle(doc, 'Distribución de hallazgos', 'Estados registrados en la auditoría', cursorY);
  cursorY += 9;

  const max = Math.max(1, counts.conforme, counts.parcial, counts['no-conforme'], counts['no-aplica']);
  const rows = [
    ['Conforme', counts.conforme, GREEN],
    ['Parcial', counts.parcial, AMBER],
    ['No Conforme', counts['no-conforme'], RED],
    ['No Aplica', counts['no-aplica'], SLATE],
  ] as const;

  rows.forEach(([label, value, color]) => {
    barChartRow(doc, MARGIN_X, cursorY, label, value, max, color);
    cursorY += 8;
  });

  return cursorY + 2;
}

function drawStatusChart(
  doc: PdfDoc,
  statusData: Array<{ name: string; value: number; color: string }>,
  x: number,
  y: number,
  w: number
) {
  const maxValue = Math.max(1, ...statusData.map((item) => item.value));
  const rowHeight = 10;
  const startY = y + 12;

  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Estados de respuesta', x + 4, y + 6);

  statusData.forEach((item, index) => {
    const rowY = startY + index * rowHeight;
    const barX = x + 34;
    const barWidth = w - 52;
    const fillWidth = Math.max(2, (barWidth * item.value) / maxValue);

    doc.setTextColor(TEXT);
    doc.setFontSize(8.2);
    doc.text(item.name, x + 4, rowY + 3.5);

    doc.setFillColor('#edf2f7');
    doc.roundedRect(barX, rowY, barWidth, 4.5, 1.5, 1.5, 'F');
    doc.setFillColor(item.color);
    doc.roundedRect(barX, rowY, fillWidth, 4.5, 1.5, 1.5, 'F');

    doc.setTextColor(PRIMARY_DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.value}`, x + w - 2, rowY + 3.5, { align: 'right' });
  });
}

export function createAuditReportPdfBlob(input: AuditReportPdfInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const complianceInfo = getComplianceLevel(input.globalIndex);
  const counts = getStatusCounts(input.responses);

  addPageHeader(doc, input.generatedAt, 'Resultado de Auditoría ISO 27001');

  doc.setTextColor(PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('INFORME EJECUTIVO FINAL', MARGIN_X, 34);

  doc.setTextColor(PRIMARY_DARK);
  doc.setFontSize(20);
  doc.text('Resultado de Auditoría ISO 27001', MARGIN_X, 43);
  doc.setTextColor(TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text('Analisis detallado del estado de cumplimiento y brechas de seguridad.', MARGIN_X, 50);

  doc.setDrawColor(BORDER);
  doc.line(MARGIN_X, 54, PAGE_WIDTH - MARGIN_X, 54);

  metricCard(doc, MARGIN_X, 58, 88, 31, 'Índice Global', formatPercent(input.globalIndex), PRIMARY, `Nivel: ${complianceInfo.label}`);
  metricCard(doc, 102, 58, 46, 31, 'No Conformidades', `${input.nonConformitiesCount}`, RED, 'Hallazgos críticos');
  metricCard(doc, 151, 58, 45, 31, 'Conformes', `${counts.conforme}`, GREEN, `${input.totalAnswered}/${input.totalQuestionsCount} evaluados`);

  drawTeam(doc, input.team, 92);

  doc.setDrawColor(BORDER);
  doc.setFillColor(BG);
  doc.roundedRect(MARGIN_X, 124, 88, 74, 2, 2, 'FD');
  doc.roundedRect(106, 124, 90, 74, 2, 2, 'FD');

  doc.setTextColor(PRIMARY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Cumplimiento por dominio', MARGIN_X + 6, 132);
  doc.text('Distribución de hallazgos', 112, 132);

  drawRadarChart(doc, input.radarData, MARGIN_X + 5, 137, 78, 57);
  drawStatusChart(doc, input.statusData, 108, 137, 84);

  doc.addPage();
  addPageHeader(doc, input.generatedAt, 'Resultado de Auditoría ISO 27001');

  let cursorY = 34;
  cursorY = buildStatusSection(doc, counts, cursorY);

  doc.setDrawColor(BORDER);
  doc.line(MARGIN_X, cursorY + 4, PAGE_WIDTH - MARGIN_X, cursorY + 4);
  cursorY += 12;
  cursorY = drawSummaryTable(doc, input.isoData, input.responses, input.generatedAt, cursorY);

  doc.addPage();
  addPageHeader(doc, input.generatedAt, 'Resultado de Auditoría ISO 27001');
  cursorY = 34;
  cursorY = drawRecommendations(doc, input.recommendations, input.generatedAt, cursorY);

  const pageCount = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    addFooter(doc, pageNumber, pageCount);
  }

  return doc.output('blob');
}

export async function downloadAuditReportPdf(input: AuditReportPdfInput): Promise<void> {
  const blob = createAuditReportPdfBlob(input);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-auditoria-iso-27001-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
