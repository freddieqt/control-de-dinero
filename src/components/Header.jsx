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
  ShieldAlert
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
    lockVault,
    integrityStatus,
    trashTransactions
  } = useVault();

  return (
    <header className="sticky top-0 z-30 bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo y estado de integridad */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">BÓVEDA</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AES-256
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              {integrityStatus.valid ? (
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  Integridad SHA-256 OK
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  Alerta de Integridad
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón Ocultar / Mostrar Dinero (Modo Privacidad) */}
          <button
            onClick={togglePrivacyMode}
            title={privacyMode ? "Mostrar montos" : "Ocultar montos por privacidad"}
            className={`p-2.5 rounded-xl border transition-all ${
              privacyMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
            }`}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Botón Papelera Protegida */}
          <button
            onClick={onOpenTrash}
            title="Papelera protegida"
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 relative transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {trashTransactions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {trashTransactions.length}
              </span>
            )}
          </button>

          {/* Botón Auditoría Inmutable */}
          <button
            onClick={onOpenAudit}
            title="Auditoría e Integridad SHA-256"
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Botón Ajustes & Respaldos */}
          <button
            onClick={onOpenSettings}
            title="Ajustes y Respaldos Cifrados"
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Botón Bloquear Inmediatamente */}
          <button
            onClick={() => lockVault("Bloqueo manual")}
            title="Bloquear bóveda y borrar memoria"
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
