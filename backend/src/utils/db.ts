import Database from 'better-sqlite3';

/**
 * Query helper to execute a SELECT query and return all results
 */
export const queryAll = <T = any>(
  db: Database.Database,
  sql: string,
  params: any[] = []
): T[] => {
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
};

/**
 * Query helper to execute a SELECT query and return a single result
 */
export const queryOne = <T = any>(
  db: Database.Database,
  sql: string,
  params: any[] = []
): T | undefined => {
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
};

/**
 * Execute an INSERT, UPDATE, or DELETE query
 */
export const execute = (
  db: Database.Database,
  sql: string,
  params: any[] = []
): Database.RunResult => {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

/**
 * Execute multiple queries in a transaction
 */
export const transaction = <T>(
  db: Database.Database,
  callback: () => T
): T => {
  return db.transaction(callback)();
};

/**
 * Convert SQLite row to camelCase object
 */
export const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
};

/**
 * Convert camelCase object to snake_case for SQLite
 */
export const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
};

/**
 * Parse JSON fields from database row
 */
export const parseJsonFields = <T extends Record<string, any>>(
  row: T,
  fields: (keyof T)[]
): T => {
  const result = { ...row };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field] as string) as any;
      } catch (error) {
        console.error(`Failed to parse JSON field ${String(field)}:`, error);
      }
    }
  }
  
  return result;
};

/**
 * Stringify JSON fields for database insertion
 */
export const stringifyJsonFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T => {
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] !== 'string') {
      result[field] = JSON.stringify(result[field]) as any;
    }
  }
  
  return result;
};
