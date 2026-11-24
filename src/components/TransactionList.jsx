import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Trash2,
  Clock,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function TransactionList() {
  const { transactions, softDeleteTransaction, privacyMode, settings } = useVault();

  const [filterType, setFilterType] = useState('all'); // 'all', 'gasto', 'ingreso'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [searchQuery, setSearchQuery] = useState('');

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const now = new Date();
  const todayStr = now.toDateString();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrar transacciones activas por tipo, tiempo y buscador
  const filtered = transactions
    .filter(t => {
      // 1. Tipo (Todos, Gasto, Ingreso)
      if (filterType !== 'all' && t.type !== filterType) return false;

      // 2. Tiempo (Hoy, Esta semana, Este mes)
      if (timeFilter === 'today') {
        const txDate = new Date(t.timestamp).toDateString();
        if (txDate !== todayStr) return false;
      } else if (timeFilter === 'week') {
        if (t.timestamp < oneWeekAgo) return false;
      } else if (timeFilter === 'month') {
        const d = new Date(t.timestamp);
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
      }

      // 3. Buscador por texto
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

  const filteredGastos = filtered
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredIngresos = filtered
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-3 pt-2">
      {/* 1. Barra de Filtro de Tiempo: [Todos] [Hoy] [Esta semana] [Este mes] */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold mr-1 flex-shrink-0">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          Tiempo:
        </span>
        <button
          onClick={() => setTimeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            timeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Todo el tiempo
        </button>
        <button
          onClick={() => setTimeFilter('today')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            timeFilter === 'today'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setTimeFilter('week')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            timeFilter === 'week'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Esta semana
        </button>
        <button
          onClick={() => setTimeFilter('month')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
            timeFilter === 'month'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Este mes
        </button>
      </div>

      {/* 2. Barra de Filtros por Tipo (Todos, Salidas, Ingresos) y Buscador */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Pestañas de tipo */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({filtered.length})
          </button>
          <button
            onClick={() => setFilterType('gasto')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'gasto'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Salidas
          </button>
          <button
            onClick={() => setFilterType('ingreso')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
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
            placeholder="Buscar por categoría, motivo, Yape..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Resumen dinámico del filtro de tiempo seleccionado */}
      <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
        <span className="font-medium text-slate-400">
          {timeFilter === 'today' ? '📅 Movimientos de Hoy:' : (timeFilter === 'week' ? '📅 Movimientos de Esta Semana:' : (timeFilter === 'month' ? '📅 Movimientos de Este Mes:' : '📅 Total en Pantalla:'))}
        </span>
        <div className="flex items-center gap-3 font-bold">
          <span className="text-rose-400">Salidas: -{formatAmount(filteredGastos)}</span>
          <span>•</span>
          <span className="text-emerald-400">Ingresos: +{formatAmount(filteredIngresos)}</span>
        </div>
      </div>

      {/* Lista de Registros */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm sm:text-base font-semibold text-slate-300">No hay movimientos en este período de tiempo.</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Prueba cambiando el filtro de tiempo a "Todo el tiempo".</p>
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

                    {/* MEDIO DE PAGO / CUENTA */}
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
