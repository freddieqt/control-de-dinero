import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { DeadpoolLoginMiddleFinger } from './DeadpoolGreeting';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertTriangle,
  Sun,
  Moon,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function LockScreen() {
  const {
    isSetupDone,
    setupVault,
    unlockVault,
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
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden. Escríbelas iguales.");
        }
        await setupVault(password);
      } else {
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
    <div className="min-h-screen bg-slate-100 dark:bg-[#04060c] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Fondo ambiental con luces de estudio y malla sutil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-rose-600/20 via-red-500/15 to-amber-500/15 rounded-full blur-[90px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-rose-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Botón superior de Tema Claro / Oscuro */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro (Blanco)' : 'Cambiar a modo oscuro (Negro)'}
          className={`p-3 rounded-2xl border backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-amber-400/40 text-amber-300 shadow-amber-500/10'
              : 'bg-white/90 border-slate-200 text-violet-700 shadow-slate-300/50'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-300 stroke-[2.4] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          ) : (
            <Moon className="w-5 h-5 text-violet-600 stroke-[2.4]" />
          )}
        </button>
      </div>

      {/* Contenedor Principal Integrado (Deadpool emerge directamente desde la tarjeta sin cortes bruscos) */}
      <div className="w-full max-w-[390px] z-10 mt-6">
        {/* Figura de Deadpool integrada emergiendo detrás del borde superior de la tarjeta */}
        <div className="relative flex justify-center -mb-14 z-10 pointer-events-none">
          {/* Halo circular detrás de Deadpool */}
          <div className="absolute top-6 w-48 h-48 rounded-full bg-gradient-to-b from-rose-500/20 via-amber-500/10 to-transparent border border-rose-500/20 blur-[1px]" />
          <DeadpoolLoginMiddleFinger className="w-56 h-64 sm:w-60 sm:h-68" />
        </div>

        {/* Tarjeta Principal Premium con borde luminoso y cristal esmerilado */}
        <div className="relative z-20 rounded-3xl bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)] dark:shadow-[0_25px_80px_-15px_rgba(225,29,72,0.22)] overflow-hidden">
          {/* Línea superior brillante rojo-dorado que oculta el corte de la cintura de Deadpool */}
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-amber-400 to-rose-600" />

          <div className="p-6 sm:p-7">
            {/* Encabezado dentro de la tarjeta */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-[11px] font-bold tracking-wide mb-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>BÓVEDA PERSONAL</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Control de Dinero
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {isSetupDone
                  ? 'Ingresa tu contraseña para abrir tu bóveda'
                  : 'Crea una contraseña segura para empezar'}
              </p>
            </div>

            {/* Bloqueo temporal por intentos fallidos */}
            {lockoutRemaining > 0 && (
              <div className="mb-5 bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3.5 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-200">Acceso bloqueado temporalmente</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-300/90 mt-0.5">
                    Espera <strong className="text-rose-800 dark:text-white font-mono">{lockoutRemaining}s</strong> para volver a intentar.
                  </p>
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {errorMsg && lockoutRemaining === 0 && (
              <div className="mb-4 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/35 rounded-2xl p-3.5 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-medium animate-fadeIn">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative group">
                  {/* Icono de llave a la izquierda */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-rose-400 group-focus-within:bg-rose-500/20 group-focus-within:text-rose-500 transition-colors">
                    <KeyRound className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSetupDone ? 'Escribe tu contraseña...' : 'Crea tu contraseña (mín. 6)...'}
                    disabled={lockoutRemaining > 0 || loading}
                    className="w-full bg-slate-100/90 dark:bg-[#060911] border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-rose-500 dark:focus:border-rose-500 rounded-2xl pl-14 pr-12 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium transition-all shadow-inner"
                    autoFocus
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.2]" /> : <Eye className="w-4 h-4 stroke-[2.2]" />}
                  </button>
                </div>
              </div>

              {!isSetupDone && (
                <div>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-rose-400">
                      <Lock className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu misma contraseña..."
                      disabled={loading}
                      className="w-full bg-slate-100/90 dark:bg-[#060911] border-2 border-slate-200 dark:border-slate-800 focus:border-rose-500 dark:focus:border-rose-500 rounded-2xl pl-14 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Código 2FA TOTP si está activado */}
              {(showTotpField || (totpConfig && totpConfig.enabled)) && (
                <div className="pt-1">
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 text-center">
                    Código de verificación 2FA (6 dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    disabled={lockoutRemaining > 0 || loading}
                    className="w-full bg-slate-100 dark:bg-[#060911] border-2 border-emerald-500/50 focus:border-emerald-400 rounded-2xl px-4 py-3 text-center text-lg tracking-[0.4em] font-mono font-bold text-emerald-600 dark:text-emerald-300 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={lockoutRemaining > 0 || loading}
                className="w-full py-4 px-5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:via-red-500 hover:to-rose-500 text-white font-extrabold rounded-2xl shadow-[0_10px_25px_-5px_rgba(225,29,72,0.5)] border-t border-white/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm tracking-wide group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSetupDone ? (
                  <>
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>Entrar a mi Bóveda</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Crear y Entrar a mi Bóveda</span>
                  </>
                )}
              </button>
            </form>

            {/* Pie limpio y elegante */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 stroke-[2.3]" />
              <span>Tus datos están protegidos en este dispositivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
