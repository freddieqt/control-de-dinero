import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Trash2,
  Calendar,
  Tag,
  ShieldCheck,
  Edit2,
  Check,
  X
} from 'lucide-react';

export default function TransactionList() {
  const { transactions, softDeleteTransaction, editTransaction, privacyMode, settings } = useVault();

  const [filterType, setFilterType] = useState('all'); // 'all', 'gasto', 'ingreso'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtrar transacciones activas (no eliminadas)
  const filtered = transactions
    .filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.date.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.timestamp - a.timestamp);

  const startEdit = (tx) => {
    setEditingId(tx.id);
    setEditAmount(tx.amount.toString());
    setEditDescription(tx.description);
  };

  const saveEdit = async (id) => {
    if (!editDescription.trim() || isNaN(parseFloat(editAmount))) return;
    try {
      await editTransaction(id, {
        amount: parseFloat(editAmount),
        description: editDescription.trim()
      });
      setEditingId(null);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  return (
    <div className="space-y-3">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        {/* Pestañas de filtro */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('gasto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              filterType === 'gasto' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Salidas
          </button>
          <button
            onClick={() => setFilterType('ingreso')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              filterType === 'ingreso' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ingresos
          </button>
        </div>

        {/* Buscador de movimientos */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por por qué, tienda, etc..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>
      </div>

      {/* Lista de Registros */}
      {filtered.length === 0 ? (
        <div className="vault-card rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-400 font-mono">No hay movimientos registrados con los filtros actuales.</p>
          <p className="text-xs text-slate-500 mt-1">Usa el formulario arriba para agregar tu primera salida o ingreso.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="vault-card rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Información izquierda */}
              <div className="flex items-start gap-3 flex-1 overflow-hidden">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === 'gasto'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.type === 'gasto' ? (
                    <ArrowDownCircle className="w-5 h-5" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-32 bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="px-2 py-1 bg-emerald-600 rounded text-[11px] text-white flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-slate-800 rounded text-[11px] text-slate-300 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white tracking-tight break-words">
                          {item.description}
                        </h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {item.date}
                        </span>
                        <span>•</span>
                        {/* Indicador de Integridad SHA-256 */}
                        <span
                          className="flex items-center gap-1 font-mono text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20"
                          title={`Hash SHA-256 inmutable: ${item.hash}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          SHA-256: {item.hash ? item.hash.substring(0, 8) : 'OK'}...
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Monto y Botones a la derecha */}
              {editingId !== item.id && (
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div
                      className={`text-base font-extrabold font-mono tracking-tight ${
                        item.type === 'gasto' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.type === 'gasto' ? '-' : '+'}
                      {formatAmount(item.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(item)}
                      title="Modificar movimiento"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => softDeleteTransaction(item.id)}
                      title="Enviar a papelera protegida"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
