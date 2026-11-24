import React from 'react';
import { useVault } from '../context/VaultContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({
  onOpenTrash,
  onOpenAudit,
  onOpenSettings,
  onOpenManualBalance,
  onOpenDeadpool
}) {
  const {
    privacyMode,
    togglePrivacyMode,
    theme,
    toggleTheme,
    lockVault,
    integrityStatus,
    trashTransactions
  } = useVault();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-4 py-2.5 sm:py-3 transition-colors duration-200">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Logo oficial de Deadpool y título compacto adaptable a cualquier celular */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenDeadpool}
            title="Ver billete de Deadpool"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-rose-600/80 shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-transform flex-shrink-0 bg-black"
          >
            <img
              src="./deadpool-logo.jpg"
              alt="Deadpool Logo"
              className="w-full h-full object-cover scale-105"
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                BÓVEDA
              </h1>
              {/* Punto verde compacto en celular / Etiqueta completa en pantallas medianas */}
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse sm:hidden flex-shrink-0" />
              <span className="hidden sm:flex text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-bold items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Segura
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium truncate">
              {integrityStatus.valid ? (
                <span className="text-slate-500 dark:text-slate-400 truncate">Protección activa</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  Alerta
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 6 Botones de acción rápida optimizados para que entren todos en la pantalla del celular */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* 1. Botón Cambiar Tema (Amarillo Solar Vivo / Violeta Neón) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? "Cambiar a modo claro (Blanco)" : "Cambiar a modo oscuro (Negro)"}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${
              theme === 'dark'
                ? "bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30 shadow-amber-500/10"
                : "bg-violet-500/15 border-violet-500/40 text-violet-700 hover:bg-violet-500/25 shadow-violet-500/10"
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            ) : (
              <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-violet-600 stroke-[2.4]" />
            )}
          </button>

          {/* 2. Botón Ocultar / Mostrar Dinero (Cian Brillante / Fucsia Neón) */}
          <button
            onClick={togglePrivacyMode}
            title={privacyMode ? "Mostrar montos" : "Ocultar montos por privacidad"}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${
              privacyMode
                ? "bg-fuchsia-500/25 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-400/60 hover:bg-fuchsia-500/35 shadow-fuchsia-500/15"
                : "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-400/50 hover:bg-cyan-500/30 shadow-cyan-500/10"
            }`}
          >
            {privacyMode ? (
              <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-fuchsia-600 dark:text-fuchsia-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(232,121,249,0.5)]" />
            ) : (
              <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-cyan-600 dark:text-cyan-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
            )}
          </button>

          {/* 3. Botón Papelera Protegida (Naranja Fuego Vivo) */}
          <button
            onClick={onOpenTrash}
            title="Papelera protegida"
            className="p-2 sm:p-2.5 rounded-xl bg-orange-500/20 border border-orange-400/50 text-orange-600 dark:text-orange-300 hover:bg-orange-500/30 relative transition-all hover:scale-105 active:scale-95 shadow-sm shadow-orange-500/10"
          >
            <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-orange-600 dark:text-orange-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]" />
            {trashTransactions.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-md border border-white dark:border-slate-900">
                {trashTransactions.length}
              </span>
            )}
          </button>

          {/* 4. Botón Auditoría & Verificación SHA-256 (Verde Esmeralda Vivo) */}
          <button
            onClick={onOpenAudit}
            title="Seguridad y Verificación SHA-256"
            className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-emerald-500/10"
          >
            <ShieldCheck className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-600 dark:text-emerald-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          </button>

          {/* 5. Botón Ajustes & Respaldos (Azul / Índigo Eléctrico Vivo) */}
          <button
            onClick={onOpenSettings}
            title="Ajustes, 2FA y Respaldos"
            className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-indigo-500/10"
          >
            <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-indigo-600 dark:text-indigo-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]" />
          </button>

          {/* 6. Botón Bloquear Inmediatamente (Rojo Carmesí Vivo) */}
          <button
            onClick={() => lockVault("Bloqueo manual")}
            title="Bloquear bóveda ahora"
            className="p-2 sm:p-2.5 rounded-xl bg-rose-500/25 border border-rose-400/60 text-rose-600 dark:text-rose-300 hover:bg-rose-500/35 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-rose-500/15"
          >
            <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-rose-600 dark:text-rose-300 stroke-[2.4] drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]" />
          </button>
        </div>
      </div>
    </header>
  );
}
