import { mkdir, readFile } from 'node:fs/promises';

const SCHEMA_FILE = new URL('../../database/initialBd.sql', import.meta.url);

/**
 * Подключение к PostgreSQL. С DATABASE_URL — обычный сервер (например, из Docker),
 * без него — PGlite: тот же PostgreSQL, но внутри процесса Node, ставить ничего не нужно.
 * Наружу отдаём одинаковый интерфейс: query(sql, params) → { rows }, exec(sql), close().
 */
export async function createDb({ databaseUrl, dataDir } = {}) {
  if (databaseUrl) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: databaseUrl });
    return {
      query: (sql, params) => pool.query(sql, params),
      exec: (sql) => pool.query(sql),
      close: () => pool.end(),
    };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  // PGlite не создаёт родительские папки сам; без dataDir база живёт в памяти (тесты).
  if (dataDir) await mkdir(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  await db.waitReady;
  return {
    query: (sql, params) => db.query(sql, params),
    exec: (sql) => db.exec(sql),
    close: () => db.close(),
  };
}

/** Создаёт таблицы из database/initialBd.sql, если базы ещё нет. */
export async function migrate(db) {
  const { rows } = await db.query("SELECT to_regclass('public.users') AS name");
  if (rows[0].name) return false;
  await db.exec(await readFile(SCHEMA_FILE, 'utf8'));
  return true;
}
