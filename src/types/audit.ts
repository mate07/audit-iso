export type ComplianceStatus = 'conforme' | 'parcial' | 'no-conforme' | 'no-aplica';

export interface AuditQuestion {
  id: string;
  text: string;
  description?: string;
}

export interface ISOControl {
  id: string;
  title: string;
  questions: AuditQuestion[];
}

export interface ISODomain {
  id: string;
  number: number;
  title: string;
  description: string;
  controls: ISOControl[];
}

export interface QuestionResponse {
  status: ComplianceStatus | '';
  notes: string;
}

export interface Auditor {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface AuditorError {
  nombre?: string;
  apellido?: string;
  email?: string;
}
