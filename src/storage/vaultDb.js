import { openDB } from 'idb';

const DB_NAME = 'BovedaFinancieraDB';
const DB_VERSION = 2; // Actualizado a versión 2 para préstamos

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Almacén para credenciales y configuración del sistema de seguridad
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth');
      }

      // Almacén para movimientos cifrados
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by_timestamp', 'timestamp');
        txStore.createIndex('by_deleted', 'isDeleted');
      }

      // Almacén para préstamos y deudas cifrados
      if (!db.objectStoreNames.contains('loans')) {
        const loanStore = db.createObjectStore('loans', { keyPath: 'id' });
        loanStore.createIndex('by_timestamp', 'timestamp');
      }

      // Almacén para auditoría inmutable
      if (!db.objectStoreNames.contains('audit_log')) {
        const auditStore = db.createObjectStore('audit_log', { keyPath: 'id' });
        auditStore.createIndex('by_timestamp', 'timestamp');
      }

      // Almacén para frases aprendidas y autocompletado
      if (!db.objectStoreNames.contains('phrases')) {
        const phraseStore = db.createObjectStore('phrases', { keyPath: 'id' });
        phraseStore.createIndex('by_type', 'type');
      }
    }
  });

  return dbInstance;
}

// ==========================================
// OPERACIONES DE AUTENTICACIÓN Y SEGURIDAD
// ==========================================

export async function getAuthData() {
  const db = await getDb();
  const salt = await db.get('auth', 'salt');
  const authCheck = await db.get('auth', 'authCheck');
  const totp = await db.get('auth', 'totp');
  const bruteForce = await db.get('auth', 'bruteForce');
  const settings = await db.get('auth', 'settings');
  const devices = await db.get('auth', 'devices');

  if (!salt) return null;

  return {
    salt,
    authCheck,
    totp: totp || { enabled: false, secretEncrypted: null },
    bruteForce: bruteForce || { failedAttempts: 0, lockUntil: 0, lastAttemptTime: 0 },
    settings: settings || { autoLockMinutes: 2, currency: "S/.", manualBaseBalance: 0, privacyMode: false },
    devices: devices || []
  };
}

export async function saveAuthData(key, value) {
  const db = await getDb();
  await db.put('auth', value, key);
}

// ==========================================
// OPERACIONES DE TRANSACCIONES CIFRADAS
// ==========================================

export async function getAllStoredTransactions() {
  const db = await getDb();
  return await db.getAll('transactions');
}

export async function putStoredTransaction(record) {
  const db = await getDb();
  await db.put('transactions', record);
}

export async function deleteStoredTransaction(id) {
  const db = await getDb();
  await db.delete('transactions', id);
}

// ==========================================
// OPERACIONES DE PRÉSTAMOS CIFRADOS
// ==========================================

export async function getAllStoredLoans() {
  const db = await getDb();
  if (!db.objectStoreNames.contains('loans')) return [];
  return await db.getAll('loans');
}

export async function putStoredLoan(record) {
  const db = await getDb();
  if (!db.objectStoreNames.contains('loans')) return;
  await db.put('loans', record);
}

export async function deleteStoredLoan(id) {
  const db = await getDb();
  if (!db.objectStoreNames.contains('loans')) return;
  await db.delete('loans', id);
}

// ==========================================
// REGISTRO DE AUDITORÍA INMUTABLE
// ==========================================

export async function getAllAuditLogs() {
  const db = await getDb();
  const logs = await db.getAll('audit_log');
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

export async function appendAuditLog(entry) {
  const db = await getDb();
  await db.put('audit_log', {
    ...entry,
    savedAt: Date.now()
  });
}

// ==========================================
// APRENDIZAJE DE FRASES PREDICTIVAS
// ==========================================

export async function getStoredPhrases() {
  const db = await getDb();
  return await db.getAll('phrases');
}

export async function saveLearnedPhrase(phraseText, type) {
  if (!phraseText || phraseText.trim().length < 2) return;
  const clean = phraseText.trim();
  const db = await getDb();
  
  const id = `${type}_${clean.toLowerCase().replace(/\s+/g, '_')}`;
  const existing = await db.get('phrases', id);

  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.lastUsed = Date.now();
    await db.put('phrases', existing);
  } else {
    await db.put('phrases', {
      id,
      text: clean,
      type,
      count: 1,
      lastUsed: Date.now()
    });
  }
}

// ==========================================
// REINICIO TOTAL DE EMERGENCIA
// ==========================================

export async function wipeEntireDatabase() {
  const db = await getDb();
  await db.clear('auth');
  await db.clear('transactions');
  if (db.objectStoreNames.contains('loans')) {
    await db.clear('loans');
  }
  await db.clear('audit_log');
  await db.clear('phrases');
  localStorage.removeItem('__vault_device_salt');
}
