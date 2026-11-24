import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { Wallet, X, Check, ShieldAlert } from 'lucide-react';

export default function ManualBalanceModal({ isOpen, onClose }) {
  const { manualBaseBalance, setManualBaseBalance, settings, totalBalance } = useVault();
  const [amount, setAmount] = useState(manualBaseBalance.toString());
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const val = parseFloat(amount);
    if (isNaN(val)) {
      setErrorMsg("Ingresa un número válido para tu dinero total.");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="vault-card rounded-2xl w-full max-w-md p-6 border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Poner Dinero Total a Mano</h3>
            <p className="text-xs text-slate-400 font-mono">Ajuste de Saldo Base General</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
              Ingresa la cantidad exacta de dinero que tienes actualmente:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono font-bold text-slate-400">
                {settings.currency || 'S/.'}
              </span>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-2xl font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Este valor se guardará de forma cifrada como tu saldo base principal. A partir de aquí, cada salida se restará y cada ingreso se sumará automáticamente.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-950/50"
            >
              {saving ? 'Guardando...' : (
                <>
                  <Check className="w-4 h-4" /> Guardar Saldo Total
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
