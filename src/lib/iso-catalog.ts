import { ISO_27001_DATA } from '@/lib/iso-data';
import { ISODomain } from '@/types/audit';
import type { InArgs } from '@libsql/core/api';

interface CatalogDatabase {
  run(sql: string, params?: InArgs): Promise<void>;
  all<T = unknown>(sql: string, params?: InArgs): Promise<T[]>;
}

interface DomainRow {
  id: string;
  number: number;
  title: string;
  description: string;
}

interface ControlRow {
  id: string;
  domainId: string;
  title: string;
  sortOrder: number;
}

interface QuestionRow {
  id: string;
  controlId: string;
  text: string;
  description: string | null;
  sortOrder: number;
}

export async function seedIsoCatalog(db: CatalogDatabase): Promise<void> {
  for (const domain of ISO_27001_DATA) {
    await db.run(
      'INSERT OR IGNORE INTO iso_domains (id, number, title, description) VALUES (?, ?, ?, ?)',
      [domain.id, domain.number, domain.title, domain.description]
    );

    for (const [controlIndex, control] of domain.controls.entries()) {
      await db.run(
        'INSERT OR IGNORE INTO iso_controls (id, domainId, title, sortOrder) VALUES (?, ?, ?, ?)',
        [control.id, domain.id, control.title, controlIndex]
      );

      for (const [questionIndex, question] of control.questions.entries()) {
        await db.run(
          'INSERT OR IGNORE INTO iso_questions (id, controlId, text, description, sortOrder) VALUES (?, ?, ?, ?, ?)',
          [question.id, control.id, question.text, question.description || null, questionIndex]
        );
      }
    }
  }
}

export async function loadIsoCatalog(db: CatalogDatabase): Promise<ISODomain[]> {
  const domains = await db.all<DomainRow>(
    'SELECT id, number, title, description FROM iso_domains ORDER BY number ASC'
  );
  const controls = await db.all<ControlRow>(
    'SELECT id, domainId, title, sortOrder FROM iso_controls ORDER BY domainId ASC, sortOrder ASC'
  );
  const questions = await db.all<QuestionRow>(
    'SELECT id, controlId, text, description, sortOrder FROM iso_questions ORDER BY controlId ASC, sortOrder ASC'
  );

  return domains.map((domain) => {
    const domainControls = controls
      .filter((control) => control.domainId === domain.id)
      .map((control) => ({
        id: control.id,
        title: control.title,
        questions: questions
          .filter((question) => question.controlId === control.id)
          .map((question) => ({
            id: question.id,
            text: question.text,
            description: question.description || undefined,
          })),
      }));

    return {
      id: domain.id,
      number: domain.number,
      title: domain.title,
      description: domain.description,
      controls: domainControls,
    };
  });
}
