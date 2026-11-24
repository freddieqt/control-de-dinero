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
    <header className="sticky top-0 z-30 bg-[#030712]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo y estado de seguridad */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">BÓVEDA</h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Segura
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              {integrityStatus.valid ? (
                <span className="text-slate-300">Protección activa y cifrada</span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alerta de Seguridad
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex items-center gap-2">
          {/* Botón Ocultar / Mostrar Dinero (Modo Privacidad) */}
          <button
            onClick={togglePrivacyMode}
            title={privacyMode ? "Mostrar montos" : "Ocultar montos por privacidad"}
            className={`p-2.5 rounded-xl border transition-all ${
              privacyMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
            }`}
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Botón Papelera Protegida */}
          <button
            onClick={onOpenTrash}
            title="Papelera protegida"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 relative transition-all"
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
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Botón Ajustes & Respaldos */}
          <button
            onClick={onOpenSettings}
            title="Ajustes y Respaldos"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Botón Bloquear Inmediatamente */}
          <button
            onClick={() => lockVault("Bloqueo manual")}
            title="Bloquear bóveda"
            className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
