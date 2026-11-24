import React from 'react';
import { useVault } from '../context/VaultContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  FileText,
  Settings,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';

export default function Header({
  onOpenTrash,
  onOpenAudit,
  onOpenSettings,
  onOpenManualBalance
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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors duration-200">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo y estado de seguridad */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">BÓVEDA</h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Segura
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              {integrityStatus.valid ? (
                <span className="text-slate-600 dark:text-slate-300">Protección activa y cifrada</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alerta de Seguridad
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón Cambiar Tema (Blanco / Negro) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? "Cambiar a modo blanco" : "Cambiar a modo negro"}
            className="p-2.5 rounded-xl border transition-all bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-indigo-600 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Botón Ocultar / Mostrar Dinero (Modo Privacidad) */}
          <button
            onClick={togglePrivacyMode}
            title={privacyMode ? "Mostrar montos" : "Ocultar montos por privacidad"}
            className={`p-2.5 rounded-xl border transition-all ${
              privacyMode
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Botón Papelera Protegida */}
          <button
            onClick={onOpenTrash}
            title="Papelera protegida"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white relative transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {trashTransactions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                {trashTransactions.length}
              </span>
            )}
          </button>

          {/* Botón Auditoría */}
          <button
            onClick={onOpenAudit}
            title="Historial de Auditoría"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Botón Ajustes & Respaldos */}
          <button
            onClick={onOpenSettings}
            title="Ajustes y Respaldos"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Botón Bloquear Inmediatamente */}
          <button
            onClick={() => lockVault("Bloqueo manual")}
            title="Bloquear bóveda"
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
