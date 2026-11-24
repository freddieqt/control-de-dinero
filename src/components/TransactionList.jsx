import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Trash2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function TransactionList() {
  const { transactions, softDeleteTransaction, privacyMode, settings } = useVault();

  const [filterType, setFilterType] = useState('all'); // 'all', 'gasto', 'ingreso'
  const [searchQuery, setSearchQuery] = useState('');

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtrar transacciones activas
  const filtered = transactions
    .filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q)) ||
          (t.date && t.date.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-3 pt-2">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Pestañas de filtro */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('gasto')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'gasto'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Salidas
          </button>
          <button
            onClick={() => setFilterType('ingreso')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'ingreso'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ingresos
          </button>
        </div>

        {/* Buscador de movimientos */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por categoría, motivo, Yape, BCP..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Lista de Registros */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm sm:text-base font-semibold text-slate-300">No hay movimientos registrados.</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Usa el formulario de arriba para agregar tu primera salida o ingreso.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              {/* Información izquierda: CATEGORÍA PRINCIPAL + MOTIVO SECUNDARIO */}
              <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === 'gasto'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.type === 'gasto' ? (
                    <ArrowDownCircle className="w-6 h-6" />
                  ) : (
                    <ArrowUpCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* CATEGORÍA EN EL LUGAR PRINCIPAL (GRANDE Y VISIBLE) + MEDIO DE PAGO */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-normal uppercase">
                      {item.category || (item.type === 'gasto' ? 'Gasto' : 'Ingreso')}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'gasto'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.type === 'gasto' ? 'SALIDA' : 'INGRESO'}
                    </span>

                    {/* MEDIO DE PAGO / CUENTA (Yape, BCP, SIP, PLIN, LEMON, BBVA) */}
                    {item.paymentMethod && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.paymentMethod}
                      </span>
                    )}
                  </div>

                  {/* MOTIVO JUSTO DEBAJO */}
                  <p className="text-sm text-slate-200 mt-0.5 font-normal break-words">
                    {item.description}
                  </p>

                  {/* DETALLE EXACTO DE FECHA, HORA Y SEGURIDAD */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.date || new Date(item.timestamp).toLocaleString('es-PE')}
                    </span>
                    <span>•</span>
                    <span className="text-teal-400 flex items-center gap-1 font-medium text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Inmutable y Cifrado
                    </span>
                  </div>
                </div>
              </div>

              {/* Monto y Botón de Papelera a la derecha */}
              <div className="flex items-center justify-between sm:justify-end gap-3.5 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full sm:w-auto">
                <div className="text-right">
                  <div
                    className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                      item.type === 'gasto' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {item.type === 'gasto' ? '-' : '+'}
                    {formatAmount(item.amount)}
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => softDeleteTransaction(item.id)}
                    title="Mover a papelera protegida"
                    className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
