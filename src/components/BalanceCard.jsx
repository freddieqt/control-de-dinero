import React from 'react';
import { useVault } from '../context/VaultContext';
import { Wallet, TrendingUp, TrendingDown, Edit3, ShieldAlert } from 'lucide-react';

export default function BalanceCard({ onOpenManualBalance }) {
  const {
    privacyMode,
    totalBalance,
    totalIngresos,
    totalSalidas,
    manualBaseBalance,
    settings,
    integrityStatus
  } = useVault();

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-3">
      {/* Alerta si se detecta alteración o manipulación en la base de datos */}
      {!integrityStatus.valid && (
        <div className="bg-rose-950/60 border border-rose-500/60 rounded-2xl p-4 flex items-start gap-3 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-rose-300">¡Advertencia de Integridad Criptográfica!</h4>
            <p className="text-xs text-rose-300/90 mt-1">
              {integrityStatus.error || "Se detectaron modificaciones no autorizadas en los registros de la base de datos."}
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta Principal de Dinero General */}
      <div className="vault-card-highlight rounded-2xl p-5 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Mi Dinero General Total
            </span>
          </div>

          {/* Botón para poner el dinero a mano */}
          <button
            onClick={onOpenManualBalance}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 px-3 py-1.5 rounded-lg transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Poner a mano</span>
          </button>
        </div>

        {/* Saldo Numérico Principal */}
        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
            {formatAmount(totalBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap">
            <span>Base a mano: <strong className="text-slate-300 font-mono">{formatAmount(manualBaseBalance)}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">+{formatAmount(totalIngresos)}</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">-{formatAmount(totalSalidas)}</span>
          </div>
        </div>

        {/* Resumen de Entradas y Salidas en dos columnas */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/60">
          {/* Ingresos */}
          <div className="bg-slate-900/70 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Ingresos</div>
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 truncate">
                +{formatAmount(totalIngresos)}
              </div>
            </div>
          </div>

          {/* Salidas (Gastos) */}
          <div className="bg-slate-900/70 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Salidas</div>
              <div className="text-sm sm:text-base font-bold font-mono text-rose-400 truncate">
                -{formatAmount(totalSalidas)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
