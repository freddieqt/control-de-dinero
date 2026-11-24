import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  deriveKeyFromPassword,
  encryptData,
  decryptData,
  computeTransactionHash,
  verifyLedgerIntegrity,
  getDeviceFingerprint,
  generateRandomBytes,
  bytesToHex,
  calculateBruteForceLockout,
  generateTotpSecret,
  generateQrCodeDataUrl,
  verifyTotpCode
} from '../crypto/cryptoService';
import {
  getAuthData,
  saveAuthData,
  getAllStoredTransactions,
  putStoredTransaction,
  deleteStoredTransaction,
  getAllAuditLogs,
  appendAuditLog,
  getStoredPhrases,
  saveLearnedPhrase,
  wipeEntireDatabase
} from '../storage/vaultDb';
import { PRESET_PHRASES } from '../utils/presetPhrases';

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  // Estados principales
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Clave criptográfica en memoria (nunca persistida en texto plano)
  const [cryptoKey, setCryptoKey] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);

  // Datos descifrados (solo viven en RAM mientras esté desbloqueado)
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [learnedPhrases, setLearnedPhrases] = useState([]);
  const [settings, setSettings] = useState({
    autoLockMinutes: 2,
    currency: 'S/.',
    manualBaseBalance: 0,
    hasManualBase: false
  });
  const [totpConfig, setTotpConfig] = useState({ enabled: false, secretEncrypted: null });

  // Seguridad y Bloqueos
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [integrityStatus, setIntegrityStatus] = useState({ valid: true, error: null, lastChecked: null });

  // Referencias para temporizadores
  const autoLockTimerRef = useRef(null);
  const lockoutIntervalRef = useRef(null);

  // 1. Inicialización al cargar la aplicación
  useEffect(() => {
    async function initVault() {
      try {
        const device = await getDeviceFingerprint();
        setCurrentDevice(device);

        const auth = await getAuthData();
        if (auth && auth.salt && auth.authCheck) {
          setIsSetupDone(true);
          setTotpConfig(auth.totp);
          if (auth.settings) {
            setSettings(auth.settings);
            if (auth.settings.privacyMode !== undefined) {
              setPrivacyMode(auth.settings.privacyMode);
            }
          }

          // Verificar si hay penalización activa por fuerza bruta
          const now = Date.now();
          if (auth.bruteForce && auth.bruteForce.lockUntil > now) {
            const remainingSec = Math.ceil((auth.bruteForce.lockUntil - now) / 1000);
            setLockoutRemaining(remainingSec);
            setFailedAttempts(auth.bruteForce.failedAttempts);
          } else if (auth.bruteForce) {
            setFailedAttempts(auth.bruteForce.failedAttempts || 0);
          }
        } else {
          setIsSetupDone(false);
        }
      } catch (err) {
        console.error("Error al iniciar la bóveda:", err);
      } finally {
        setIsInitialized(true);
      }
    }

    initVault();
  }, []);

  // Manejo de la cuenta regresiva del bloqueo por fuerza bruta
  useEffect(() => {
    if (lockoutRemaining > 0) {
      lockoutIntervalRef.current = setInterval(() => {
        setLockoutRemaining(prev => {
          if (prev <= 1) {
            clearInterval(lockoutIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, [lockoutRemaining]);

  // 2. Temporizador de inactividad de 2 minutos para autobloqueo
  const resetInactivityTimer = useCallback(() => {
    if (isLocked) return;

    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }

    const timeoutMs = (settings.autoLockMinutes || 2) * 60 * 1000;
    autoLockTimerRef.current = setTimeout(() => {
      lockVault("Inactividad de " + (settings.autoLockMinutes || 2) + " minutos");
    }, timeoutMs);
  }, [isLocked, settings.autoLockMinutes]);

  // Escuchar actividad del usuario para reiniciar el temporizador
  useEffect(() => {
    if (isLocked) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));
    resetInactivityTimer();

    // Bloqueo inmediato opcional si la pestaña se oculta (cambio de app en celular)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // En móviles, cuando cambias de app, resguardar datos inmediatamente
        // Si no quieres que bloquee inmediatamente al salir 1 seg, podemos dejar el timer normal
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    };
  }, [isLocked, resetInactivityTimer]);

  // 3. Bloquear Bóveda (Purga claves y datos de la memoria RAM)
  const lockVault = (reason = "Manual") => {
    setCryptoKey(null);
    setTransactions([]);
    setAuditLogs([]);
    setIsLocked(true);
    if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
  };

  // 4. Configurar Bóveda por primera vez (Creación de contraseña maestra)
  const setupVault = async (masterPassword) => {
    if (!masterPassword || masterPassword.length < 6) {
      throw new Error("La contraseña maestra debe tener al menos 6 caracteres.");
    }

    const saltHex = bytesToHex(generateRandomBytes(16));
    const { aesKey } = await deriveKeyFromPassword(masterPassword, saltHex);

    // Token cifrado de verificación
    const checkPayload = { check: "BOVEDA_AUTH_TOKEN_V1", createdAt: Date.now() };
    const authCheckEncrypted = await encryptData(aesKey, checkPayload);

    const device = currentDevice || (await getDeviceFingerprint());

    await saveAuthData('salt', saltHex);
    await saveAuthData('authCheck', authCheckEncrypted);
    await saveAuthData('bruteForce', { failedAttempts: 0, lockUntil: 0, lastAttemptTime: Date.now() });
    await saveAuthData('devices', [{
      id: device.id,
      label: device.label,
      authorizedAt: Date.now(),
      lastActive: Date.now()
    }]);

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'SISTEMA_CONFIGURADO',
      timestamp: Date.now(),
      deviceId: device.id,
      details: 'Bóveda inicializada con cifrado Argon2id + AES-256-GCM',
      status: 'OK'
    });

    setCryptoKey(aesKey);
    setIsSetupDone(true);
    setIsLocked(false);
    setTransactions([]);
    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();
  };

  // 5. Desbloquear Bóveda con Contraseña Maestra y 2FA TOTP
  const unlockVault = async (password, totpCode = '') => {
    if (lockoutRemaining > 0) {
      throw new Error(`Acceso bloqueado por protección contra fuerza bruta. Espera ${lockoutRemaining} segundos.`);
    }

    const auth = await getAuthData();
    if (!auth || !auth.salt || !auth.authCheck) {
      throw new Error("La bóveda no está configurada.");
    }

    const device = currentDevice || (await getDeviceFingerprint());

    try {
      // 1. Derivar clave candidata
      const { aesKey } = await deriveKeyFromPassword(password, auth.salt);

      // 2. Intentar descifrar el token de comprobación
      const decryptedCheck = await decryptData(aesKey, auth.authCheck.ciphertext, auth.authCheck.iv);
      if (!decryptedCheck || decryptedCheck.check !== "BOVEDA_AUTH_TOKEN_V1") {
        throw new Error("Firma de verificación inválida");
      }

      // 3. Si 2FA TOTP está activado, verificar token
      if (auth.totp && auth.totp.enabled && auth.totp.secretEncrypted) {
        if (!totpCode || totpCode.trim().length !== 6) {
          throw new Error("TOTP_REQUIRED"); // Indicador para pedir código TOTP
        }
        const totpSecret = await decryptData(aesKey, auth.totp.secretEncrypted.ciphertext, auth.totp.secretEncrypted.iv);
        const isTotpValid = verifyTotpCode(totpSecret.secretBase32, totpCode);
        if (!isTotpValid) {
          throw new Error("Código 2FA incorrecto o expirado.");
        }
      }

      // Éxito de autenticación: restablecer contador de fallos
      await saveAuthData('bruteForce', { failedAttempts: 0, lockUntil: 0, lastAttemptTime: Date.now() });
      setFailedAttempts(0);
      setLockoutRemaining(0);

      // Registrar auditoría de acceso exitoso
      await appendAuditLog({
        id: 'audit_' + Date.now(),
        action: 'ACCESO_EXITOSO',
        timestamp: Date.now(),
        deviceId: device.id,
        details: 'Bóveda desbloqueada con éxito.',
        status: 'OK'
      });

      // 4. Descifrar transacciones almacenadas
      const rawStored = await getAllStoredTransactions();
      const decryptedList = [];

      for (const item of rawStored) {
        try {
          const payload = await decryptData(aesKey, item.cipherPayload, item.iv);
          decryptedList.push({
            ...payload,
            id: item.id,
            hash: item.hash,
            prevHash: item.prevHash,
            isDeleted: item.isDeleted || false,
            deletedAt: item.deletedAt || null,
            timestamp: item.timestamp
          });
        } catch (decryptErr) {
          console.error("Error descifrando transacción " + item.id, decryptErr);
        }
      }

      // 5. Verificación de Integridad SHA-256 (Detección de manipulaciones)
      const integrityCheck = await verifyLedgerIntegrity(decryptedList);
      setIntegrityStatus({
        valid: integrityCheck.valid,
        error: integrityCheck.valid ? null : integrityCheck.reason,
        lastChecked: Date.now()
      });

      // 6. Cargar frases aprendidas
      const phrases = await getStoredPhrases();
      setLearnedPhrases(phrases || []);

      // 7. Cargar auditoría
      const logs = await getAllAuditLogs();
      setAuditLogs(logs);

      // Actualizar estado activo
      setCryptoKey(aesKey);
      setTransactions(decryptedList);
      setIsLocked(false);
      resetInactivityTimer();

      return true;
    } catch (err) {
      if (err.message === "TOTP_REQUIRED") {
        throw err;
      }

      // Manejo de fallo: incrementar intentos fallidos y aplicar bloqueo progresivo
      const newFailed = (auth.bruteForce?.failedAttempts || 0) + 1;
      const penaltySeconds = calculateBruteForceLockout(newFailed);
      const lockUntil = penaltySeconds > 0 ? Date.now() + (penaltySeconds * 1000) : 0;

      await saveAuthData('bruteForce', {
        failedAttempts: newFailed,
        lockUntil: lockUntil,
        lastAttemptTime: Date.now()
      });

      setFailedAttempts(newFailed);
      if (penaltySeconds > 0) {
        setLockoutRemaining(penaltySeconds);
      }

      await appendAuditLog({
        id: 'audit_' + Date.now(),
        action: 'INTENTO_FALLIDO',
        timestamp: Date.now(),
        deviceId: device.id,
        details: `Intento de acceso fallido #${newFailed}. Penalización: ${penaltySeconds}s`,
        status: 'ALERTA'
      });

      if (penaltySeconds > 0) {
        throw new Error(`Demasiados intentos fallidos. Bóveda bloqueada temporalmente por ${penaltySeconds} segundos.`);
      } else {
        const remainingUntilLock = 5 - newFailed;
        throw new Error(`Contraseña incorrecta. Te quedan ${remainingUntilLock} intentos antes del bloqueo temporal.`);
      }
    }
  };

  // 6. Agregar Movimiento (Gasto o Ingreso)
  const addTransaction = async ({ type, amount, category, paymentMethod = 'Yape', description, date, notes = '' }) => {
    if (!cryptoKey || isLocked) throw new Error("La bóveda está bloqueada");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("El monto debe ser un número positivo.");
    }

    if (!description || description.trim().length === 0) {
      throw new Error("Debes escribir el motivo del movimiento.");
    }

    const device = currentDevice || { id: 'master_device' };
    const now = Date.now();
    const id = 'tx_' + now + '_' + Math.random().toString(36).substring(2, 7);

    // Obtener el último hash de la cadena para integridad inmutable
    const nonDeleted = transactions.filter(t => !t.isDeleted).sort((a, b) => a.timestamp - b.timestamp);
    const prevHash = nonDeleted.length > 0 ? nonDeleted[nonDeleted.length - 1].hash : "GENESIS_ROOT_VAULT";

    const recordPlain = {
      id,
      type, // 'gasto' o 'ingreso'
      amount: numAmount,
      category: category || (type === 'gasto' ? 'Algo para picar' : 'Trabajo'),
      paymentMethod: paymentMethod || 'Yape',
      description: description.trim(),
      date: date || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      timestamp: now,
      author: device.id
    };

    // Calcular Hash SHA-256 encadenado
    const hash = await computeTransactionHash(prevHash, recordPlain);

    // Cifrar el registro completo con AES-256-GCM
    const encrypted = await encryptData(cryptoKey, recordPlain);

    const storedRecord = {
      id,
      cipherPayload: encrypted.ciphertext,
      iv: encrypted.iv,
      hash,
      prevHash,
      isDeleted: false,
      deletedAt: null,
      timestamp: now
    };

    // Guardar en IndexedDB
    await putStoredTransaction(storedRecord);

    // Guardar frase en el sistema predictivo
    await saveLearnedPhrase(description.trim(), type);
    const updatedPhrases = await getStoredPhrases();
    setLearnedPhrases(updatedPhrases);

    // Registrar en auditoría inmutable
    await appendAuditLog({
      id: 'audit_' + now,
      action: type === 'gasto' ? 'SALIDA_REGISTRADA' : 'INGRESO_REGISTRADO',
      timestamp: now,
      deviceId: device.id,
      details: `${type === 'gasto' ? 'Gasto' : 'Ingreso'}: ${settings.currency} ${numAmount.toFixed(2)} - ${description.trim().substring(0, 30)}`,
      hash: hash,
      status: 'OK'
    });

    const newTxList = [...transactions, { ...recordPlain, hash, prevHash, isDeleted: false, deletedAt: null }];
    setTransactions(newTxList);
    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();

    return recordPlain;
  };

  // 7. Modificar Movimiento
  const editTransaction = async (id, updatedFields) => {
    if (!cryptoKey || isLocked) throw new Error("La bóveda está bloqueada");

    const existingIndex = transactions.findIndex(t => t.id === id);
    if (existingIndex === -1) throw new Error("Registro no encontrado");

    const current = transactions[existingIndex];
    const updatedPlain = {
      ...current,
      ...updatedFields,
      amount: parseFloat(updatedFields.amount !== undefined ? updatedFields.amount : current.amount),
      description: updatedFields.description ? updatedFields.description.trim() : current.description,
      editedAt: Date.now()
    };

    // Recalcular hash con los nuevos datos
    const newHash = await computeTransactionHash(current.prevHash, updatedPlain);
    const encrypted = await encryptData(cryptoKey, updatedPlain);

    const storedRecord = {
      id,
      cipherPayload: encrypted.ciphertext,
      iv: encrypted.iv,
      hash: newHash,
      prevHash: current.prevHash,
      isDeleted: current.isDeleted || false,
      deletedAt: current.deletedAt || null,
      timestamp: current.timestamp
    };

    await putStoredTransaction(storedRecord);

    // Auditoría
    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'REGISTRO_MODIFICADO',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: `Modificación de ${current.description} -> ${updatedPlain.description}`,
      hash: newHash,
      status: 'OK'
    });

    const updatedList = [...transactions];
    updatedList[existingIndex] = { ...updatedPlain, hash: newHash };
    setTransactions(updatedList);
    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();
  };

  // 8. Enviar a Papelera Protegida (Soft Delete)
  const softDeleteTransaction = async (id) => {
    if (!cryptoKey || isLocked) throw new Error("La bóveda está bloqueada");

    const item = transactions.find(t => t.id === id);
    if (!item) return;

    const updatedPlain = { ...item, isDeleted: true, deletedAt: Date.now() };
    const encrypted = await encryptData(cryptoKey, updatedPlain);

    await putStoredTransaction({
      id,
      cipherPayload: encrypted.ciphertext,
      iv: encrypted.iv,
      hash: item.hash,
      prevHash: item.prevHash,
      isDeleted: true,
      deletedAt: Date.now(),
      timestamp: item.timestamp
    });

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'MOVIDO_A_PAPELERA',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: `Movimiento "${item.description}" (${settings.currency} ${item.amount}) enviado a papelera protegida.`,
      status: 'ADVERTENCIA'
    });

    setTransactions(transactions.map(t => t.id === id ? { ...t, isDeleted: true, deletedAt: Date.now() } : t));
    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();
  };

  // 9. Restaurar de Papelera
  const restoreTransaction = async (id) => {
    if (!cryptoKey || isLocked) throw new Error("La bóveda está bloqueada");

    const item = transactions.find(t => t.id === id);
    if (!item) return;

    const updatedPlain = { ...item, isDeleted: false, deletedAt: null };
    const encrypted = await encryptData(cryptoKey, updatedPlain);

    await putStoredTransaction({
      id,
      cipherPayload: encrypted.ciphertext,
      iv: encrypted.iv,
      hash: item.hash,
      prevHash: item.prevHash,
      isDeleted: false,
      deletedAt: null,
      timestamp: item.timestamp
    });

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'RESTAURADO_DE_PAPELERA',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: `Movimiento "${item.description}" restaurado a la lista activa.`,
      status: 'OK'
    });

    setTransactions(transactions.map(t => t.id === id ? { ...t, isDeleted: false, deletedAt: null } : t));
    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();
  };

  // 10. Eliminación Permanente (Requiere Contraseña Maestra de Confirmación)
  const permanentDeleteTransaction = async (id, passwordConfirmation) => {
    if (!cryptoKey || isLocked) throw new Error("La bóveda está bloqueada");

    // Verificar contraseña maestra antes de permitir la eliminación física
    const auth = await getAuthData();
    const { aesKey } = await deriveKeyFromPassword(passwordConfirmation, auth.salt);
    const testCheck = await decryptData(aesKey, auth.authCheck.ciphertext, auth.authCheck.iv);
    if (!testCheck || testCheck.check !== "BOVEDA_AUTH_TOKEN_V1") {
      throw new Error("Contraseña incorrecta. Se canceló la eliminación permanente por seguridad.");
    }

    const item = transactions.find(t => t.id === id);
    await deleteStoredTransaction(id);

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'ELIMINACION_PERMANENTE',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: `Eliminación física definitiva de "${item ? item.description : id}" autorizada por contraseña maestra.`,
      status: 'PELIGRO'
    });

    setTransactions(transactions.filter(t => t.id !== id));
    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();
  };

  // 11. Ajustar Dinero General (Saldo Base Manual)
  const setManualBaseBalance = async (newBaseAmount) => {
    const val = parseFloat(newBaseAmount);
    if (isNaN(val)) throw new Error("El saldo general debe ser un número válido.");

    const newSettings = {
      ...settings,
      manualBaseBalance: val,
      hasManualBase: true
    };

    await saveAuthData('settings', newSettings);
    setSettings(newSettings);

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'SALDO_GENERAL_AJUSTADO',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: `Saldo total fijado manualmente en ${settings.currency} ${val.toFixed(2)}`,
      status: 'OK'
    });

    setAuditLogs(await getAllAuditLogs());
    resetInactivityTimer();
  };

  // 12. Alternar Modo Privacidad
  const togglePrivacyMode = async () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    const updatedSettings = { ...settings, privacyMode: newMode };
    await saveAuthData('settings', updatedSettings);
    setSettings(updatedSettings);
  };

  // 13. Configuración de 2FA TOTP
  const startTotpSetup = async () => {
    if (!cryptoKey || isLocked) throw new Error("La bóveda está bloqueada");
    const { secretBase32, uri } = generateTotpSecret();
    const qrDataUrl = await generateQrCodeDataUrl(uri);
    return { secretBase32, uri, qrDataUrl };
  };

  const confirmAndEnableTotp = async (secretBase32, testCode) => {
    const isValid = verifyTotpCode(secretBase32, testCode);
    if (!isValid) throw new Error("El código de 6 dígitos introducido es incorrecto.");

    const encryptedSecret = await encryptData(cryptoKey, { secretBase32 });
    const newTotpConfig = { enabled: true, secretEncrypted: encryptedSecret };
    await saveAuthData('totp', newTotpConfig);
    setTotpConfig(newTotpConfig);

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: '2FA_TOTP_ACTIVADO',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: 'Autenticación en dos factores (TOTP) configurada y activada.',
      status: 'OK'
    });

    setAuditLogs(await getAllAuditLogs());
    return true;
  };

  const disableTotp = async (passwordConfirmation) => {
    const auth = await getAuthData();
    const { aesKey } = await deriveKeyFromPassword(passwordConfirmation, auth.salt);
    const testCheck = await decryptData(aesKey, auth.authCheck.ciphertext, auth.authCheck.iv);
    if (!testCheck || testCheck.check !== "BOVEDA_AUTH_TOKEN_V1") {
      throw new Error("Contraseña incorrecta. No se puede desactivar 2FA.");
    }

    const disabledConfig = { enabled: false, secretEncrypted: null };
    await saveAuthData('totp', disabledConfig);
    setTotpConfig(disabledConfig);

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: '2FA_TOTP_DESACTIVADO',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: 'Autenticación en dos factores desactivada.',
      status: 'ADVERTENCIA'
    });

    setAuditLogs(await getAllAuditLogs());
    return true;
  };

  // 14. Exportar e Importar Respaldos Cifrados (.vault)
  const exportEncryptedBackup = async (backupPassword) => {
    if (!transactions) throw new Error("Sin datos para respaldar");

    const saltHex = bytesToHex(generateRandomBytes(16));
    const { aesKey } = await deriveKeyFromPassword(backupPassword, saltHex);

    const fullPackage = {
      version: 1,
      createdAt: new Date().toISOString(),
      generator: 'BovedaFinanciera_UltraSecure',
      settings,
      transactions: transactions.filter(t => !t.isDeleted),
      auditLogs: auditLogs.slice(0, 100),
      learnedPhrases
    };

    const encrypted = await encryptData(aesKey, fullPackage);
    const backupContainer = {
      magic: 'BOVEDA_ENCRYPTED_BACKUP',
      format: 'AES-256-GCM',
      salt: saltHex,
      iv: encrypted.iv,
      payload: encrypted.ciphertext,
      timestamp: Date.now()
    };

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'RESPALDO_EXPORTADO',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: 'Copia de seguridad cifrada exportada con éxito.',
      status: 'OK'
    });

    return JSON.stringify(backupContainer, null, 2);
  };

  const importEncryptedBackup = async (backupJsonString, backupPassword) => {
    let backupContainer;
    try {
      backupContainer = JSON.parse(backupJsonString);
    } catch {
      throw new Error("El archivo no tiene un formato JSON válido.");
    }

    if (backupContainer.magic !== 'BOVEDA_ENCRYPTED_BACKUP') {
      throw new Error("Este archivo no es un respaldo válido de Bóveda Financiera.");
    }

    const { aesKey } = await deriveKeyFromPassword(backupPassword, backupContainer.salt);
    let decryptedPackage;
    try {
      decryptedPackage = await decryptData(aesKey, backupContainer.payload, backupContainer.iv);
    } catch {
      throw new Error("Contraseña de respaldo incorrecta o archivo dañado.");
    }

    // Restaurar transacciones re-cifrándolas con la clave actual de la bóveda
    for (const tx of decryptedPackage.transactions) {
      const encrypted = await encryptData(cryptoKey, tx);
      await putStoredTransaction({
        id: tx.id,
        cipherPayload: encrypted.ciphertext,
        iv: encrypted.iv,
        hash: tx.hash,
        prevHash: tx.prevHash,
        isDeleted: false,
        deletedAt: null,
        timestamp: tx.timestamp
      });
    }

    if (decryptedPackage.settings) {
      await saveAuthData('settings', decryptedPackage.settings);
      setSettings(decryptedPackage.settings);
    }

    await appendAuditLog({
      id: 'audit_' + Date.now(),
      action: 'RESPALDO_RESTAURADO',
      timestamp: Date.now(),
      deviceId: currentDevice?.id || 'unknown',
      details: `Respaldo importado: ${decryptedPackage.transactions.length} movimientos recuperados.`,
      status: 'OK'
    });

    // Recargar transacciones en memoria
    const rawStored = await getAllStoredTransactions();
    const reloaded = [];
    for (const item of rawStored) {
      try {
        const payload = await decryptData(cryptoKey, item.cipherPayload, item.iv);
        reloaded.push({ ...payload, ...item });
      } catch (err) {}
    }
    setTransactions(reloaded);
    setAuditLogs(await getAllAuditLogs());
    return true;
  };

  // 15. Verificación manual de Integridad SHA-256
  const checkIntegrity = async () => {
    const result = await verifyLedgerIntegrity(transactions);
    setIntegrityStatus({
      valid: result.valid,
      error: result.valid ? null : result.reason,
      lastChecked: Date.now()
    });
    return result;
  };

  // 16. Cálculos de Saldo Total
  const activeTransactions = transactions.filter(t => !t.isDeleted);
  const totalIngresos = activeTransactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalSalidas = activeTransactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Dinero General Total = Saldo Base Manual Inicial + Ingresos - Salidas
  const baseBalance = settings.manualBaseBalance || 0;
  const totalCalculado = baseBalance + totalIngresos - totalSalidas;

  return (
    <VaultContext.Provider
      value={{
        isInitialized,
        isSetupDone,
        isLocked,
        privacyMode,
        settings,
        currentDevice,
        transactions: activeTransactions,
        trashTransactions: transactions.filter(t => t.isDeleted),
        allTransactions: transactions,
        auditLogs,
        learnedPhrases,
        totpConfig,
        failedAttempts,
        lockoutRemaining,
        integrityStatus,
        totalBalance: totalCalculado,
        totalIngresos,
        totalSalidas,
        manualBaseBalance: baseBalance,

        // Acciones
        setupVault,
        unlockVault,
        lockVault,
        addTransaction,
        editTransaction,
        softDeleteTransaction,
        restoreTransaction,
        permanentDeleteTransaction,
        setManualBaseBalance,
        togglePrivacyMode,
        startTotpSetup,
        confirmAndEnableTotp,
        disableTotp,
        exportEncryptedBackup,
        importEncryptedBackup,
        checkIntegrity,
        resetInactivityTimer
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault debe ser usado dentro de un VaultProvider");
  }
  return context;
}
