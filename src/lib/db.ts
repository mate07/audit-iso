import { createClient, Client } from '@libsql/client';
import type { InArgs } from '@libsql/core/api';
import { seedIsoCatalog } from '@/lib/iso-catalog';

export interface Database {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: InArgs): Promise<void>;
  get<T = unknown>(sql: string, params?: InArgs): Promise<T | undefined>;
  all<T = unknown>(sql: string, params?: InArgs): Promise<T[]>;
}

let clientInstance: Client | null = null;

class LibSQLWrapper implements Database {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async exec(sql: string): Promise<void> {
    await this.client.executeMultiple(sql);
  }

  async run(sql: string, params: InArgs = []): Promise<void> {
    await this.client.execute({ sql, args: params });
  }

  async get<T = unknown>(sql: string, params: InArgs = []): Promise<T | undefined> {
    const result = await this.client.execute({ sql, args: params });
    return result.rows[0] as unknown as T;
  }

  async all<T = unknown>(sql: string, params: InArgs = []): Promise<T[]> {
    const result = await this.client.execute({ sql, args: params });
    return result.rows as unknown as T[];
  }
}

async function migrateLegacyAuditData(db: Database) {
  const tables = await db.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'");
  const existingTables = new Set(tables.map((table) => table.name));

  const auditTeamColumns = existingTables.has('audit_team_members')
    ? await db.all<{ name: string }>("PRAGMA table_info('audit_team_members')")
    : [];
  const auditTeamColumnNames = new Set(auditTeamColumns.map((column) => column.name));

  if (existingTables.has('audit_team_members') && !auditTeamColumnNames.has('email')) {
    await db.run('ALTER TABLE audit_team_members ADD COLUMN email TEXT');
  }

  if (existingTables.has('audit_team_members') && auditTeamColumnNames.has('carnet')) {
    await db.run(`
      UPDATE audit_team_members
      SET email = COALESCE(email, carnet)
      WHERE email IS NULL OR email = ''
    `);
  }

  if (existingTables.has('auditors') && existingTables.has('audit_team_members')) {
    const legacyTeamCount = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM auditors');
    const normalizedTeamCount = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM audit_team_members');

    if ((normalizedTeamCount?.count ?? 0) === 0 && (legacyTeamCount?.count ?? 0) > 0) {
      await db.run(`
        INSERT OR IGNORE INTO audit_team_members (id, nombre, apellido, carnet, email, auditId, createdAt)
        SELECT id, nombre, apellido, carnet, carnet, auditId, CURRENT_TIMESTAMP
        FROM auditors
      `);
    }
  }

  if (existingTables.has('responses') && existingTables.has('audit_responses')) {
    const legacyResponseCount = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM responses');
    const normalizedResponseCount = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM audit_responses');

    if ((normalizedResponseCount?.count ?? 0) === 0 && (legacyResponseCount?.count ?? 0) > 0) {
      await db.run(`
        INSERT OR IGNORE INTO audit_responses (id, questionId, status, notes, auditId, createdAt, updatedAt)
        SELECT id, questionId, status, notes, auditId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM responses
      `);
    }
  }
}

export async function getDb(): Promise<Database> {
  if (!clientInstance) {
    const url = process.env.TURSO_URL || 'file:audit.db';
    const authToken = process.env.TURSO_TOKEN;

    clientInstance = createClient({
      url,
      authToken,
    });
  }

  const db = new LibSQLWrapper(clientInstance);

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      roleId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roleId) REFERENCES roles (id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      empresa TEXT NOT NULL DEFAULT '',
      direccion TEXT NOT NULL DEFAULT '',
      responsable TEXT NOT NULL DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      currentStepIndex INTEGER DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_team_members (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      carnet TEXT,
      email TEXT NOT NULL,
      auditId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auditId) REFERENCES audits (id) ON DELETE CASCADE,
      UNIQUE (auditId, email)
    );

    CREATE TABLE IF NOT EXISTS audit_responses (
      id TEXT PRIMARY KEY,
      questionId TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      auditId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auditId) REFERENCES audits (id) ON DELETE CASCADE,
      UNIQUE (auditId, questionId)
    );

    CREATE TABLE IF NOT EXISTS iso_domains (
      id TEXT PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS iso_controls (
      id TEXT PRIMARY KEY,
      domainId TEXT NOT NULL,
      title TEXT NOT NULL,
      sortOrder INTEGER NOT NULL,
      FOREIGN KEY (domainId) REFERENCES iso_domains (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS iso_questions (
      id TEXT PRIMARY KEY,
      controlId TEXT NOT NULL,
      text TEXT NOT NULL,
      description TEXT,
      sortOrder INTEGER NOT NULL,
      FOREIGN KEY (controlId) REFERENCES iso_controls (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions (userId);
    CREATE INDEX IF NOT EXISTS idx_audits_userId ON audits (userId);
    CREATE INDEX IF NOT EXISTS idx_audit_team_members_auditId ON audit_team_members (auditId);
    CREATE INDEX IF NOT EXISTS idx_audit_responses_auditId ON audit_responses (auditId);
    CREATE INDEX IF NOT EXISTS idx_audit_responses_questionId ON audit_responses (questionId);

    INSERT OR IGNORE INTO roles (id, name) VALUES ('r-admin', 'Administrador');
    INSERT OR IGNORE INTO roles (id, name) VALUES ('r-auditor', 'Auditor');
  `);

  await seedIsoCatalog(db);
  await migrateLegacyAuditData(db);

  return db;
}
