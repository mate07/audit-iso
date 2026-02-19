import sqlite3 from 'sqlite3';
import path from 'path';

// Interfaz básica para emular la promesa de 'sqlite' usando 'sqlite3' directamente
export interface Database {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: any[]): Promise<void>;
  get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: any[]): Promise<T[]>;
}

let dbInstance: sqlite3.Database | null = null;

// Wrapper promisificado
class DBWrapper implements Database {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }
}

export async function getDb(): Promise<Database> {
  const dbPath = path.join(process.cwd(), 'audit.db');
  
  if (!dbInstance) {
    await new Promise<void>((resolve, reject) => {
      dbInstance = new sqlite3.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  if (!dbInstance) {
    throw new Error('Database initialization failed');
  }

  const db = new DBWrapper(dbInstance);

  // Inicializar tablas
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

    -- Migraciones manuales para columnas faltantes (si el archivo ya existía)
    -- SQLite no soporta ADD COLUMN IF NOT EXISTS directamente de forma sencilla en una sola línea, 
    -- pero podemos intentar agregarlas ignorando el error si ya existen.
  `);

  try { await db.exec('ALTER TABLE audits ADD COLUMN empresa TEXT;'); } catch(e) {}
  try { await db.exec('ALTER TABLE audits ADD COLUMN direccion TEXT;'); } catch(e) {}
  try { await db.exec('ALTER TABLE audits ADD COLUMN responsable TEXT;'); } catch(e) {}

  return db;
}
