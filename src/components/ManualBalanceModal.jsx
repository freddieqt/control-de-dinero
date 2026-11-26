import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Wallet, X, Check, RotateCcw } from 'lucide-react';

export default function ManualBalanceModal({ isOpen, onClose }) {
  const { totalBalance, setManualBaseBalance, clearAllRecordsToZero, settings } = useVault();
  const [amount, setAmount] = useState('0');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(Math.max(0, totalBalance || 0).toString());
      setErrorMsg('');
    }
  }, [isOpen, totalBalance]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      setErrorMsg("Ingresa un número válido mayor o igual a 0.");
      return;
    }

    setSaving(true);
    try {
      await setManualBaseBalance(val);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Error al actualizar saldo");
    } finally {
      setSaving(false);
    }
  };

  const handleResetAllToZero = async () => {
    setSaving(true);
    try {
      await clearAllRecordsToZero();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Error al reiniciar datos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Poner Dinero a Mano</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ajuste de tu dinero general actual</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-500/40 rounded-xl text-sm text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Escribe la cantidad exacta de dinero que tienes ahora:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                {settings.currency || 'S/.'}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-14 pr-4 py-3.5 text-3xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Tu dinero general nunca bajará de 0.00 (no saldrán números negativos).
            </p>
          </div>

          <div className="pt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-950/20"
            >
              {saving ? 'Guardando...' : (
                <>
                  <Check className="w-5 h-5" /> Guardar Saldo
                </>
              )}
            </button>
          </div>

          {/* Botón directo para limpiar pruebas y dejar la BD en S/. 0.00 */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetAllToZero}
              disabled={saving}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpiar registros de prueba y dejar todo en S/. 0.00</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
