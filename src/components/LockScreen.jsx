import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

export default function LockScreen() {
  const {
    isSetupDone,
    setupVault,
    unlockVault,
    failedAttempts,
    lockoutRemaining,
    totpConfig,
    theme,
    toggleTheme
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
        // Modo inicial: Crear contraseña por primera vez
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden. Escríbelas iguales.");
        }
        await setupVault(password);
      } else {
        // Modo desbloqueo
        await unlockVault(password, totpCode);
      }
    } catch (err) {
      if (err.message === "TOTP_REQUIRED") {
        setShowTotpField(true);
        setErrorMsg("Ingresa tu código de 6 dígitos de tu app de autenticación (2FA).");
      } else {
        setErrorMsg(err.message || "Error al ingresar. Revisa tu contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Botón superior de Tema Claro / Oscuro */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro (Blanco)' : 'Cambiar a modo oscuro (Negro)'}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 shadow-md hover:scale-105 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>

      {/* Resplandor decorativo de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        {/* Cabecera limpia y clara */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl mb-3 text-emerald-500 dark:text-emerald-400">
            {isSetupDone ? <Lock className="w-8 h-8 text-emerald-500 dark:text-emerald-400" /> : <KeyRound className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            BÓVEDA FINANCIERA
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {isSetupDone ? 'Ingresa tu contraseña para entrar' : 'Crea tu contraseña para empezar'}
          </p>
        </div>

        {/* Tarjeta de Acceso */}
        <div className="vault-card rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          {/* Bloqueo temporal por intentos fallidos */}
          {lockoutRemaining > 0 && (
            <div className="mb-5 bg-rose-500/15 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-200">Acceso bloqueado por seguridad</h4>
                <p className="text-xs text-rose-600 dark:text-rose-300/90 mt-0.5">
                  Espera <strong className="text-rose-800 dark:text-white font-mono">{lockoutRemaining} segundos</strong> para volver a intentar.
                </p>
              </div>
            </div>
          )}

          {/* Mensaje de error amigable */}
          {errorMsg && lockoutRemaining === 0 && (
            <div className="mb-4 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/30 rounded-xl p-3 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isSetupDone ? 'Tu Contraseña' : 'Crear tu Contraseña'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSetupDone ? 'Escribe tu contraseña...' : 'Mínimo 6 letras o números'}
                  disabled={lockoutRemaining > 0 || loading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-3 pr-11 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isSetupDone && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmar tu Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Vuelve a escribir la misma contraseña"
                  disabled={loading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-all"
                  required
                />
              </div>
            )}

            {/* Código 2FA TOTP si está activado */}
            {(showTotpField || (totpConfig && totpConfig.enabled)) && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                  Código de 6 dígitos (2FA)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  disabled={lockoutRemaining > 0 || loading}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest font-mono text-emerald-600 dark:text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutRemaining > 0 || loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSetupDone ? (
                <>
                  <Lock className="w-4 h-4" /> Entrar a mi Bóveda
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Crear y Entrar a mi Bóveda
                </>
              )}
            </button>
          </form>

          {/* Mensaje de tranquilidad simple */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>100% Privado: Tus datos solo se guardan en este dispositivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
