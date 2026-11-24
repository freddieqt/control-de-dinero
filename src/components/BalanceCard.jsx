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
      {/* Alerta de integridad */}
      {!integrityStatus.valid && (
        <div className="bg-rose-950/70 border border-rose-500/60 rounded-2xl p-4 flex items-start gap-3 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-rose-300">¡Advertencia de Seguridad!</h4>
            <p className="text-xs text-rose-300/90 mt-1">
              {integrityStatus.error || "Se detectaron modificaciones no autorizadas en los registros de la base de datos."}
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta Principal de Dinero General */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-sm font-bold text-slate-200">
              Mi Dinero General Total
            </span>
          </div>

          {/* Botón para poner el dinero a mano */}
          <button
            onClick={onOpenManualBalance}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 px-3.5 py-2 rounded-xl transition-all shadow"
          >
            <Edit3 className="w-4 h-4" />
            <span>Poner a mano</span>
          </button>
        </div>

        {/* Saldo Numérico Principal - Letras grandes y bien legibles */}
        <div className="mt-2">
          <div className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {formatAmount(totalBalance)}
          </div>
          <div className="text-xs sm:text-sm text-slate-300 mt-2 flex items-center gap-2 flex-wrap font-medium">
            <span>Base a mano: <strong className="text-white">{formatAmount(manualBaseBalance)}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">+{formatAmount(totalIngresos)}</span>
            <span>•</span>
            <span className="text-rose-400 font-bold">-{formatAmount(totalSalidas)}</span>
          </div>
        </div>

        {/* Resumen de Entradas y Salidas en dos columnas claras */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
          {/* Ingresos */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs text-slate-400 font-medium">Total Ingresos</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400 truncate">
                +{formatAmount(totalIngresos)}
              </div>
            </div>
          </div>

          {/* Salidas (Gastos) */}
          <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs text-slate-400 font-medium">Total Salidas</div>
              <div className="text-base sm:text-lg font-bold text-rose-400 truncate">
                -{formatAmount(totalSalidas)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
