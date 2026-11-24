import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Trash2,
  Clock,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

export default function TransactionList() {
  const { transactions, softDeleteTransaction, privacyMode, settings } = useVault();

  const [filterType, setFilterType] = useState('all'); // 'all', 'gasto', 'ingreso'
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', 'week', 'month', 'all'
  const [searchQuery, setSearchQuery] = useState('');

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Tiempos de corte
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Lunes como inicio de semana
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filtrar transacciones activas
  const filtered = transactions
    .filter(t => {
      // Filtro tipo (gasto/ingreso)
      if (filterType !== 'all' && t.type !== filterType) return false;

      // Filtro de tiempo
      if (timeFilter === 'today' && (t.timestamp || 0) < startOfToday) return false;
      if (timeFilter === 'week' && (t.timestamp || 0) < startOfWeek) return false;
      if (timeFilter === 'month' && (t.timestamp || 0) < startOfMonth) return false;

      // Buscador
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

  // Totales del período filtrado
  const periodExpenses = filtered
    .filter(t => t.type === 'gasto')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const periodIncome = filtered
    .filter(t => t.type === 'ingreso')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="space-y-3 pt-2">
      {/* 1. Barra de Filtro de Tiempo (Hoy, Esta Semana, Este Mes, Todos) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Filtrar por tiempo:
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              timeFilter === 'today'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('week')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              timeFilter === 'week'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Esta Semana
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('month')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              timeFilter === 'month'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Este Mes
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter('all')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              timeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Resumen del período seleccionado */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            {timeFilter === 'today' ? 'Hoy:' : timeFilter === 'week' ? 'En la semana:' : timeFilter === 'month' ? 'En el mes:' : 'Total filtrado:'}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-rose-600 dark:text-rose-400">Salidas: -{formatAmount(periodExpenses)}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">Ingresos: +{formatAmount(periodIncome)}</span>
          </div>
        </div>
      </div>

      {/* 2. Filtro Tipo (Salidas / Ingresos) y Buscador */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 self-start shadow-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('gasto')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'gasto'
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Salidas
          </button>
          <button
            onClick={() => setFilterType('ingreso')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              filterType === 'ingreso'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
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
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* 3. Lista de Registros */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">No hay movimientos en este período.</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Usa el formulario de arriba para registrar uno nuevo.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm dark:shadow-md"
            >
              {/* Información izquierda: CATEGORÍA PRINCIPAL + MOTIVO SECUNDARIO */}
              <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === 'gasto'
                      ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
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
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-normal uppercase">
                      {item.category || (item.type === 'gasto' ? 'Gasto' : 'Ingreso')}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'gasto'
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.type === 'gasto' ? 'SALIDA' : 'INGRESO'}
                    </span>

                    {/* MEDIO DE PAGO / CUENTA (Yape, BCP, SIP, PLIN, LEMON, BBVA) */}
                    {item.paymentMethod && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {item.paymentMethod}
                      </span>
                    )}
                  </div>

                  {/* MOTIVO JUSTO DEBAJO */}
                  <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5 font-normal break-words">
                    {item.description}
                  </p>

                  {/* DETALLE EXACTO DE FECHA, HORA Y SEGURIDAD */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.date || new Date(item.timestamp).toLocaleString('es-PE')}
                    </span>
                    <span>•</span>
                    <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Inmutable y Cifrado
                    </span>
                  </div>
                </div>
              </div>

              {/* Monto y Botón de Papelera a la derecha */}
              <div className="flex items-center justify-between sm:justify-end gap-3.5 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                <div className="text-right">
                  <div
                    className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                      item.type === 'gasto' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
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
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
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
