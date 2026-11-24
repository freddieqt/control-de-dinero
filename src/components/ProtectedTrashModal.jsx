import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { Trash2, RotateCcw, AlertTriangle, X, ShieldAlert, KeyRound, Check } from 'lucide-react';

export default function ProtectedTrashModal({ isOpen, onClose }) {
  const {
    trashTransactions,
    restoreTransaction,
    permanentDeleteTransaction,
    settings
  } = useVault();

  const [confirmPasswordId, setConfirmPasswordId] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePermanentDelete = async (id) => {
    setErrorMsg('');
    if (!password) {
      setErrorMsg("Debes ingresar la contraseña maestra para autorizar el borrado permanente.");
      return;
    }

    setLoading(true);
    try {
      await permanentDeleteTransaction(id, password);
      setConfirmPasswordId(null);
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative max-h-[90vh] flex flex-col text-slate-900 dark:text-white">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Papelera Protegida</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {trashTransactions.length} {trashTransactions.length === 1 ? 'movimiento' : 'movimientos'} protegidos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aviso de seguridad */}
        <div className="my-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <span>
            Ningún movimiento se elimina sin autorización criptográfica. Puedes restaurar tus datos en cualquier momento.
          </span>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Lista de eliminados */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {trashTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-mono text-xs">
              La papelera protegida está vacía.
            </div>
          ) : (
            trashTransactions.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{item.description}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className={item.type === 'gasto' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                      {settings.currency} {item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => restoreTransaction(item.id)}
                    className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-1 font-mono transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>

                  <button
                    onClick={() => {
                      setConfirmPasswordId(confirmPasswordId === item.id ? null : item.id);
                      setPassword('');
                      setErrorMsg('');
                    }}
                    className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-center gap-1 font-mono transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Físico</span>
                  </button>
                </div>

                {/* Sub-formulario de confirmación con contraseña maestra */}
                {confirmPasswordId === item.id && (
                  <div className="w-full mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                    <div className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold mb-2 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                      Autorización requerida: Ingresa tu Contraseña Maestra
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Contraseña maestra..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handlePermanentDelete(item.id)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Verificando...' : 'Confirmar Borrado'}
                      </button>
                      <button
                        onClick={() => setConfirmPasswordId(null)}
                        className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pie de modal */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-xl transition-colors"
          >
            Cerrar Papelera
          </button>
        </div>
      </div>
    </div>
  );
}
