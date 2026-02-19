import { createClient, Client } from '@libsql/client';

// Interfaz básica para emular la promesa de 'sqlite' usando '@libsql/client'
export interface Database {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: any[]): Promise<void>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
}

let clientInstance: Client | null = null;

// Wrapper adaptador para mantener compatibilidad con el código existente
class LibSQLWrapper implements Database {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async exec(sql: string): Promise<void> {
    await this.client.executeMultiple(sql);
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    await this.client.execute({ sql, args: params });
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const result = await this.client.execute({ sql, args: params });
    return result.rows[0] as unknown as T;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.client.execute({ sql, args: params });
    return result.rows as unknown as T[];
  }
}

export async function getDb(): Promise<Database> {
  if (!clientInstance) {
    const url = process.env.TURSO_URL || "file:audit.db";
    const authToken = process.env.TURSO_TOKEN;

    clientInstance = createClient({
      url: url,
      authToken: authToken,
    });
  }

  const db = new LibSQLWrapper(clientInstance);

  // Inicializar tablas
  // Usamos executeMultiple para el seed inicial
  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nombre TEXT,
      apellido TEXT,
      email TEXT UNIQUE,
      roleId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (roleId) REFERENCES roles (id)
    );

    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      empresa TEXT,
      direccion TEXT,
      responsable TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      currentStepIndex INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS auditors (
      id TEXT PRIMARY KEY,
      nombre TEXT,
      apellido TEXT,
      carnet TEXT,
      auditId TEXT,
      FOREIGN KEY (auditId) REFERENCES audits (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      questionId TEXT,
      status TEXT,
      notes TEXT,
      auditId TEXT,
      FOREIGN KEY (auditId) REFERENCES audits (id) ON DELETE CASCADE,
      UNIQUE(auditId, questionId)
    );

    -- Seed roles if empty
    INSERT OR IGNORE INTO roles (id, name) VALUES ('r-admin', 'Administrador');
    INSERT OR IGNORE INTO roles (id, name) VALUES ('r-auditor', 'Auditor');
  `);

  // Intentar agregar columnas si no existen (migraciones manuales)
  // Nota: Turso/LibSQL maneja esto de forma similar a SQLite
  try { await db.run('ALTER TABLE audits ADD COLUMN empresa TEXT;'); } catch(e) {}
  try { await db.run('ALTER TABLE audits ADD COLUMN direccion TEXT;'); } catch(e) {}
  try { await db.run('ALTER TABLE audits ADD COLUMN responsable TEXT;'); } catch(e) {}

  return db;
}
