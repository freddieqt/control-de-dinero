import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, ShieldAlert, Cpu, Smartphone, AlertTriangle } from 'lucide-react';

export default function LockScreen() {
  const {
    isSetupDone,
    setupVault,
    unlockVault,
    failedAttempts,
    lockoutRemaining,
    totpConfig,
    currentDevice
  } = useVault();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showTotpField, setShowTotpField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!isSetupDone) {
        // Modo inicial: Crear contraseña maestra
        if (password.length < 6) {
          throw new Error("La contraseña maestra debe tener al menos 6 caracteres.");
        }
        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden.");
        }
        await setupVault(password);
      } else {
        // Modo desbloqueo
        await unlockVault(password, totpCode);
      }
    } catch (err) {
      if (err.message === "TOTP_REQUIRED") {
        setShowTotpField(true);
        setErrorMsg("Ingresa tu código de 6 dígitos de Google Authenticator / 2FA.");
      } else {
        setErrorMsg(err.message || "Error al autenticar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Luces y efectos de fondo sutiles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Cabecera del escudo de seguridad */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 shadow-2xl mb-4 text-emerald-400">
            {isSetupDone ? <Lock className="w-10 h-10 text-emerald-400" /> : <KeyRound className="w-10 h-10 text-indigo-400" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            BÓVEDA FINANCIERA
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
            {isSetupDone ? 'Cifrado de Grado Militar Activo' : 'Inicialización de Bóveda Privada'}
          </p>
        </div>

        {/* Tarjeta de Seguridad */}
        <div className="vault-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Alerta de bloqueo progresivo por fuerza bruta */}
          {lockoutRemaining > 0 && (
            <div className="mb-6 bg-rose-500/15 border border-rose-500/40 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-200">Protección Anti Fuerza Bruta Activa</h4>
                <p className="text-xs text-rose-300 mt-1">
                  Se ha bloqueado el acceso temporalmente tras múltiples intentos.
                </p>
                <div className="mt-2 text-lg font-mono font-bold text-rose-400">
                  {lockoutRemaining} segundos restantes
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error / advertencia */}
          {errorMsg && lockoutRemaining === 0 && (
            <div className="mb-5 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2 font-mono">
                {isSetupDone ? 'Contraseña Maestra' : 'Crear Contraseña Maestra'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSetupDone ? '••••••••••••' : 'Mínimo 6 caracteres seguros'}
                  disabled={lockoutRemaining > 0 || loading}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base font-sans transition-all disabled:opacity-50"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSetupDone && (
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Confirmar Contraseña Maestra
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña exactamente"
                  disabled={loading}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base font-sans transition-all"
                  required
                />
              </div>
            )}

            {/* Campo 2FA TOTP si está configurado */}
            {(showTotpField || (totpConfig && totpConfig.enabled)) && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Código 2FA TOTP (6 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 123456"
                  disabled={lockoutRemaining > 0 || loading}
                  className="w-full bg-slate-950/80 border border-emerald-500/50 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutRemaining > 0 || loading}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSetupDone ? (
                <>
                  <Lock className="w-4 h-4" /> Desbloquear Bóveda Cifrada
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Inicializar Bóveda Cifrada
                </>
              )}
            </button>
          </form>

          {/* Información de seguridad garantizada */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Cifrado Local
              </span>
              <span className="font-mono text-emerald-400 font-medium">AES-256-GCM + Argon2id</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> Dispositivo
              </span>
              <span className="font-mono text-slate-300">
                {currentDevice ? `${currentDevice.label} (#${currentDevice.id})` : 'Dispositivo Seguro'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Modo Huella
              </span>
              <span className="text-slate-400">Desactivada (Apto para micas)</span>
            </div>
          </div>
        </div>

        {/* Garantía de privacidad estricta: ningún dato se filtra */}
        <p className="text-center text-[11px] text-slate-500 mt-5 px-4 leading-relaxed">
          Protección de saldo estricta: Ningún saldo ni movimiento se muestra en pantalla de bloqueo. Todos los datos permanecen 100% cifrados en tu dispositivo sin servidores externos.
        </p>
      </div>
    </div>
  );
}
