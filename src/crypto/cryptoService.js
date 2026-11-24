import { argon2id, pbkdf2, sha256 } from 'hash-wasm';
import { gcm } from '@noble/ciphers/aes.js';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

// ==========================================
// 1. GENERACIÓN DE BYTES ALEATORIOS Y CONVERSIONES
// ==========================================

export function generateRandomBytes(length = 16) {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    window.crypto.getRandomValues(array);
  } else {
    // Respaldo de entropía en caso extremo de entorno sin getRandomValues
    for (let i = 0; i < length; i++) {
      array[i] = (Math.floor(Math.random() * 256) ^ (Date.now() & 0xff)) & 0xff;
    }
  }
  return array;
}

export function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex) {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
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

// ==========================================
// 2. DERIVACIÓN DE CLAVE MAESTRA (Argon2id + PBKDF2)
// ==========================================

/**
 * Deriva una clave de 256 bits (32 bytes) usando Argon2id
 * Compatible universalmente en cualquier navegador (localhost, IP local, HTTPS)
 */
export async function deriveKeyFromPassword(password, saltHex) {
  let rawHashHex;
  const saltBytes = hexToBytes(saltHex);

  try {
    // Argon2id de alta seguridad: 64MB memoria, 3 iteraciones, 1 hilo
    rawHashHex = await argon2id({
      password,
      salt: saltBytes,
      parallelism: 1,
      iterations: 3,
      memorySize: 65536, // 64 MB
      hashLength: 32,
      outputType: 'hex'
    });
  } catch (err) {
    console.warn("Argon2id no soportado, utilizando PBKDF2 de alta iteración:", err);
    // Fallback a PBKDF2 con 100,000 iteraciones vía hash-wasm (sin depender de window.crypto.subtle)
    rawHashHex = await pbkdf2({
      password,
      salt: saltBytes,
      iterations: 100000,
      hashLength: 32,
      hashFunction: 'sha256',
      outputType: 'hex'
    });
  }

  const keyBytes = hexToBytes(rawHashHex);

  return {
    aesKey: keyBytes, // Clave binaria de 32 bytes pura
    rawHashHex
  };
}

// ==========================================
// 3. CIFRADO Y DESCIFRADO AES-256-GCM
// ==========================================

export async function encryptData(aesKeyBytes, dataObj) {
  const iv = generateRandomBytes(12); // Nonce de 96 bits recomendado para AES-GCM
  const cipher = gcm(aesKeyBytes, iv);

  const encoder = new TextEncoder();
  const plainBytes = encoder.encode(JSON.stringify(dataObj));

  const cipherBytes = cipher.encrypt(plainBytes);

  return {
    ciphertext: bytesToBase64(cipherBytes),
    iv: bytesToHex(iv)
  };
}

export async function decryptData(aesKeyBytes, ciphertextBase64, ivHex) {
  try {
    const iv = hexToBytes(ivHex);
    const cipherBytes = base64ToBytes(ciphertextBase64);

    const cipher = gcm(aesKeyBytes, iv);
    const decryptedBytes = cipher.decrypt(cipherBytes);

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBytes));
  } catch (err) {
    throw new Error("Contraseña incorrecta o datos alterados.");
  }
}

// ==========================================
// 4. INTEGRIDAD SHA-256 Y CADENA INMUTABLE (LEDGER)
// ==========================================

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

export async function verifyLedgerIntegrity(records) {
  if (!records || records.length === 0) return { valid: true, errorIndex: -1, count: 0 };

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  let expectedPrevHash = "GENESIS_ROOT_VAULT";

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];

    if (item.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        errorIndex: i,
        recordId: item.id,
        reason: `Discrepancia en enlace de bloque anterior en registro #${i + 1}`
      };
    }

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
// 5. AUTENTICACIÓN 2FA TOTP (RFC 6238)
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

  const delta = totp.validate({ token: userToken.trim(), window: 1 });
  return delta !== null;
}

// ==========================================
// 6. HUELLA DE DISPOSITIVO (FINGERPRINT SEGURO)
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
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  ].join(':::');

  const fpHash = await sha256(rawSignals);
  return {
    id: fpHash.substring(0, 8),
    fullHash: fpHash,
    label: detectDeviceName()
  };
}

function detectDeviceName() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "Celular Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone / iPad";
  if (/Windows/i.test(ua)) return "Computadora Windows";
  if (/Macintosh/i.test(ua)) return "Computadora Mac";
  if (/Linux/i.test(ua)) return "Dispositivo Linux";
  return "Dispositivo Móvil";
}

// ==========================================
// 7. PROTECCIÓN CONTRA FUERZA BRUTA
// ==========================================

export function calculateBruteForceLockout(failedAttempts) {
  if (failedAttempts < 5) return 0;
  if (failedAttempts === 5) return 30; // 30 segundos
  if (failedAttempts === 6) return 60; // 1 minuto
  if (failedAttempts === 7) return 300; // 5 minutos
  if (failedAttempts === 8) return 900; // 15 minutos
  return 3600; // 1 hora
}
