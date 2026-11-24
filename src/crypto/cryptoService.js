import { argon2id, sha256 } from 'hash-wasm';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

// ==========================================
// 1. GENERACIÓN DE SALTS Y CLAVES CRIPTOGRÁFICAS
// ==========================================

export function generateRandomBytes(length = 16) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

export function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function bytesToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToBytes(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Deriva una clave de 256 bits usando Argon2id (o PBKDF2 WebCrypto fallback si es necesario)
 * Configurado con parámetros robustos de seguridad
 */
export async function deriveKeyFromPassword(password, saltHex) {
  let rawHashHex;
  try {
    // Argon2id: 64MB memoria, 3 iteraciones, paralelismo 1, salida 32 bytes (256 bits)
    rawHashHex = await argon2id({
      password,
      salt: hexToBytes(saltHex),
      parallelism: 1,
      iterations: 3,
      memorySize: 65536, // 64 MB
      hashLength: 32,
      outputType: 'hex'
    });
  } catch (err) {
    console.warn("Argon2id fallback to PBKDF2 WebCrypto:", err);
    // Fallback a PBKDF2 600,000 iteraciones SHA-256
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    const derivedKey = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: hexToBytes(saltHex),
        iterations: 600000,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );
    rawHashHex = bytesToHex(new Uint8Array(derivedKey));
  }

  const rawBytes = hexToBytes(rawHashHex);

  // Importar como CryptoKey para AES-GCM
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    rawBytes,
    { name: "AES-GCM", length: 256 },
    false, // Clave no exportable para proteger de inspección en memoria
    ["encrypt", "decrypt"]
  );

  return { aesKey, rawHashHex };
}

// ==========================================
// 2. CIFRADO Y DESCIFRADO AES-256-GCM
// ==========================================

export async function encryptData(aesKey, dataObj) {
  const iv = generateRandomBytes(12); // IV de 96 bits recomendado para AES-GCM
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(dataObj));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    aesKey,
    encodedData
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
    iv: bytesToHex(iv)
  };
}

export async function decryptData(aesKey, ciphertextBase64, ivHex) {
  try {
    const iv = hexToBytes(ivHex);
    const cipherBytes = base64ToBytes(ciphertextBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      aesKey,
      cipherBytes
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer));
  } catch (err) {
    throw new Error("Fallo de descifrado o datos manipulados.");
  }
}

// ==========================================
// 3. INTEGRIDAD SHA-256 Y CADENA INMUTABLE (LEDGER)
// ==========================================

/**
 * Calcula el hash SHA-256 de un movimiento encadenado al hash anterior
 */
export async function computeTransactionHash(prevHash, record) {
  const canonicalString = [
    prevHash || "GENESIS_ROOT_VAULT",
    record.id,
    record.type,
    record.amount,
    record.category,
    record.description.trim(),
    record.date,
    record.timestamp,
    record.author || "master_device"
  ].join("|");

  return await sha256(canonicalString);
}

/**
 * Valida la integridad completa de la cadena de registros.
 * Detecta si algún registro fue modificado, insertado o eliminado por fuera de la app.
 */
export async function verifyLedgerIntegrity(records) {
  if (!records || records.length === 0) return { valid: true, errorIndex: -1, count: 0 };

  // Ordenar cronológicamente por timestamp de creación
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);

  let expectedPrevHash = "GENESIS_ROOT_VAULT";

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    
    // Si no coincide el hash anterior
    if (item.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        errorIndex: i,
        recordId: item.id,
        reason: `Discrepancia en enlace de bloque anterior en registro #${i + 1}`
      };
    }

    // Recalcular el hash del registro
    const computedHash = await computeTransactionHash(expectedPrevHash, item);
    if (computedHash !== item.hash) {
      return {
        valid: false,
        errorIndex: i,
        recordId: item.id,
        reason: `Manipulación detectada: El hash SHA-256 del registro #${i + 1} (${item.description}) no coincide con su contenido.`
      };
    }

    expectedPrevHash = item.hash;
  }

  return { valid: true, errorIndex: -1, count: sorted.length };
}

// ==========================================
// 4. AUTENTICACIÓN 2FA TOTP (RFC 6238)
// ==========================================

export function generateTotpSecret() {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: "BovedaFinanciera",
    label: "Usuario",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret
  });

  return {
    secretBase32: secret.base32,
    uri: totp.toString()
  };
}

export async function generateQrCodeDataUrl(totpUri) {
  return await QRCode.toDataURL(totpUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 250,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
}

export function verifyTotpCode(secretBase32, userToken) {
  const totp = new OTPAuth.TOTP({
    issuer: "BovedaFinanciera",
    label: "Usuario",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32)
  });

  // Ventana de tolerancia +- 1 intervalo (30s) para mitigar pequeños desfases de reloj
  const delta = totp.validate({ token: userToken.trim(), window: 1 });
  return delta !== null;
}

// ==========================================
// 5. HUELLA CRIPTOGRÁFICA DE DISPOSITIVO (Device Fingerprint)
// ==========================================

export async function getDeviceFingerprint() {
  let storedDeviceKey = localStorage.getItem('__vault_device_salt');
  if (!storedDeviceKey) {
    storedDeviceKey = bytesToHex(generateRandomBytes(32));
    localStorage.setItem('__vault_device_salt', storedDeviceKey);
  }

  const rawSignals = [
    storedDeviceKey,
    navigator.userAgent || 'unknown_ua',
    navigator.language || 'es',
    screen.width + 'x' + screen.height,
    screen.colorDepth || '24',
    navigator.hardwareConcurrency || '4',
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  ].join(':::');

  const fpHash = await sha256(rawSignals);
  return {
    id: fpHash.substring(0, 16),
    fullHash: fpHash,
    label: detectDeviceName()
  };
}

function detectDeviceName() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Dispositivo Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "Dispositivo Apple iOS";
  if (/Windows/i.test(ua)) return "PC Windows";
  if (/Macintosh/i.test(ua)) return "Mac macOS";
  if (/Linux/i.test(ua)) return "Dispositivo Linux";
  return "Dispositivo Móvil / Web";
}

// ==========================================
// 6. PROTECCIÓN CONTRA FUERZA BRUTA
// ==========================================

/**
 * Calcula el tiempo de penalización progresivo según intentos fallidos
 */
export function calculateBruteForceLockout(failedAttempts) {
  if (failedAttempts < 5) return 0; // Hasta 4 intentos no hay bloqueo obligatorio
  if (failedAttempts === 5) return 30; // 30 segundos
  if (failedAttempts === 6) return 60; // 1 minuto
  if (failedAttempts === 7) return 300; // 5 minutos
  if (failedAttempts === 8) return 900; // 15 minutos
  return 3600; // 1 hora de bloqueo
}
