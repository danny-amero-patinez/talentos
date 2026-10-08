import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Asegurarse de que exista el directorio data
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'company.db');
const db = new Database(dbPath);

// Inicializar la tabla de empleados
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    vacation_days_balance INTEGER DEFAULT 0,
    department TEXT NOT NULL
  );
`);

// Insertar datos de prueba si la tabla está vacía
const count = db.prepare('SELECT COUNT(*) as c FROM employees').get() as { c: number };
if (count.c === 0) {
  const insert = db.prepare('INSERT INTO employees (name, email, vacation_days_balance, department) VALUES (?, ?, ?, ?)');
  insert.run('Juan Perez', 'juan@talentos.com', 12, 'Engineering');
  insert.run('Maria Garcia', 'maria@talentos.com', 5, 'Marketing');
  insert.run('Angel Romero', 'angel@talentos.com', 15, 'Leadership');
}

export function executeQuery(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    // Para consultas SELECT
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params);
    } else {
      // Para INSERT, UPDATE (ej. iniciar un trámite)
      const info = stmt.run(...params);
      return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
}
