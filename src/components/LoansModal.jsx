import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { PAYMENT_METHODS } from '../utils/presetPhrases';
import {
  HandCoins,
  PlusCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  User,
  Trash2,
  DollarSign
} from 'lucide-react';

const QUICK_RELATIONS = ['Papá', 'Mamá', 'Tío', 'Tía', 'Hermano/a', 'Primo/a', 'Amigo'];

export default function LoansModal({ isOpen, onClose }) {
  const {
    loans,
    totalMeDeben,
    totalYoDebo,
    addLoan,
    addLoanAbono,
    addLoanExtra,
    deleteLoan,
    settings,
    privacyMode
  } = useVault();

  const [activeTab, setActiveTab] = useState('yo_preste'); // 'yo_preste' (me deben) | 'me_prestaron' (yo debo)
  const [showNewLoanForm, setShowNewLoanForm] = useState(false);

  // Estados de nuevo préstamo
  const [person, setPerson] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Yape');
  const [note, setNote] = useState('');

  // Estados de abono parcial
  const [abonoLoanId, setAbonoLoanId] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoMethod, setAbonoMethod] = useState('Yape');
  const [abonoNote, setAbonoNote] = useState('');

  // Estados de préstamo adicional
  const [extraLoanId, setExtraLoanId] = useState(null);
  const [extraAmount, setExtraAmount] = useState('');
  const [extraMethod, setExtraMethod] = useState('Yape');
  const [extraNote, setExtraNote] = useState('');

  // Ver historial expandido
  const [expandedLoanId, setExpandedLoanId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!person.trim() || !initialAmount || parseFloat(initialAmount) <= 0) {
      setErrorMsg('Ingresa la persona y un monto válido.');
      return;
    }

    setLoading(true);
    try {
      await addLoan({
        type: activeTab,
        person: person.trim(),
        initialAmount: parseFloat(initialAmount),
        paymentMethod,
        note
      });

      setPerson('');
      setInitialAmount('');
      setNote('');
      setShowNewLoanForm(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al crear préstamo');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAbono = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!abonoAmount || parseFloat(abonoAmount) <= 0) {
      setErrorMsg('Ingresa un monto de abono válido.');
      return;
    }

    setLoading(true);
    try {
      await addLoanAbono(abonoLoanId, {
        amount: parseFloat(abonoAmount),
        paymentMethod: abonoMethod,
        note: abonoNote
      });

      setAbonoLoanId(null);
      setAbonoAmount('');
      setAbonoNote('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar abono');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExtra = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!extraAmount || parseFloat(extraAmount) <= 0) {
      setErrorMsg('Ingresa un monto válido.');
      return;
    }

    setLoading(true);
    try {
      await addLoanExtra(extraLoanId, {
        amount: parseFloat(extraAmount),
        paymentMethod: extraMethod,
        note: extraNote
      });

      setExtraLoanId(null);
      setExtraAmount('');
      setExtraNote('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al agregar dinero');
    } finally {
      setLoading(false);
    }
  };

  const currentLoans = loans.filter(l => l.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl relative">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Control de Préstamos</h3>
              <p className="text-xs text-slate-400 font-medium">Control de deudas y abonos por partes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dos Pestañas Principales: Yo presté (Me deben) vs Me prestaron (Yo debo) */}
        <div className="p-3 bg-slate-950 border-b border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab('yo_preste');
                setShowNewLoanForm(false);
                setAbonoLoanId(null);
                setExtraLoanId(null);
              }}
              className={`p-2.5 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                activeTab === 'yo_preste'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>Yo presté (Me deben)</span>
              <span className="text-[11px] opacity-90 font-mono">
                Total: {formatAmount(totalMeDeben)}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('me_prestaron');
                setShowNewLoanForm(false);
                setAbonoLoanId(null);
                setExtraLoanId(null);
              }}
              className={`p-2.5 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${
                activeTab === 'me_prestaron'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <span>Me prestaron (Yo debo)</span>
              <span className="text-[11px] opacity-90 font-mono">
                Total: {formatAmount(totalYoDebo)}
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs sm:text-sm text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Botón para abrir formulario de nuevo préstamo */}
          {!showNewLoanForm && !abonoLoanId && !extraLoanId && (
            <button
              onClick={() => setShowNewLoanForm(true)}
              className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-indigo-500/40 hover:border-indigo-400 rounded-xl text-indigo-300 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>
                {activeTab === 'yo_preste' ? '+ Registrar Dinero que Presté' : '+ Registrar Dinero que me Prestaron'}
              </span>
            </button>
          )}

          {/* Formulario de Nuevo Préstamo */}
          {showNewLoanForm && (
            <form onSubmit={handleCreateLoan} className="bg-slate-950 border border-slate-700 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  {activeTab === 'yo_preste' ? '¿A quién le prestaste dinero?' : '¿Quién te prestó dinero?'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowNewLoanForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              {/* Botones rápidos de familiares */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_RELATIONS.map(rel => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setPerson(rel)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      person === rel
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>

              {/* Campo Nombre o Familiar */}
              <input
                type="text"
                placeholder="Escribe el nombre o familiar (ej: Papá, Tío Juan)..."
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />

              {/* Fila Monto y Cuenta */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monto ({settings.currency || 'S/.'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cuenta / Medio
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Motivo Opcional */}
              <input
                type="text"
                placeholder="Motivo o detalle opcional..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewLoanForm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  {loading ? 'Guardando...' : 'Guardar Préstamo'}
                </button>
              </div>
            </form>
          )}

          {/* Subformulario de Registro de Abono / Pago Parcial */}
          {abonoLoanId && (
            <form onSubmit={handleRegisterAbono} className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-300">
                  {activeTab === 'yo_preste' ? 'Registrar Abono que te pagaron' : 'Registrar Pago que hiciste'}
                </h4>
                <button
                  type="button"
                  onClick={() => setAbonoLoanId(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    ¿Cuánto te pagó?
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={abonoAmount}
                    onChange={(e) => setAbonoAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-emerald-400"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Cuenta de pago
                  </label>
                  <select
                    value={abonoMethod}
                    onChange={(e) => setAbonoMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2.5 text-sm font-bold text-white"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                type="text"
                placeholder="Detalle o nota del abono (opcional)..."
                value={abonoNote}
                onChange={(e) => setAbonoNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAbonoLoanId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  {loading ? 'Registrando...' : 'Confirmar Abono'}
                </button>
              </div>
            </form>
          )}

          {/* Subformulario de Préstamo Adicional (Prestar más dinero) */}
          {extraLoanId && (
            <form onSubmit={handleRegisterExtra} className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-300">
                  {activeTab === 'yo_preste' ? 'Prestar dinero adicional a la misma persona' : 'Recibir dinero adicional prestado'}
                </h4>
                <button
                  type="button"
                  onClick={() => setExtraLoanId(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Monto adicional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-indigo-400"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Cuenta
                  </label>
                  <select
                    value={extraMethod}
                    onChange={(e) => setExtraMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2.5 text-sm font-bold text-white"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExtraLoanId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  {loading ? 'Registrando...' : 'Agregar al Préstamo'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Préstamos Activos */}
          {currentLoans.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-300">
                {activeTab === 'yo_preste' ? 'No tienes préstamos otorgados.' : 'No tienes préstamos recibidos.'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Toca el botón de arriba para registrar uno.
              </p>
            </div>
          ) : (
            currentLoans.map(loan => {
              const isPaid = loan.status === 'pagado' || loan.remainingAmount === 0;
              const totalPaid = (loan.initialAmount - loan.remainingAmount);
              const progressPct = loan.initialAmount > 0 ? Math.min(100, Math.round((totalPaid / loan.initialAmount) * 100)) : 100;
              const isExpanded = expandedLoanId === loan.id;

              return (
                <div
                  key={loan.id}
                  className={`bg-slate-950 border rounded-2xl p-4 transition-all shadow-md ${
                    isPaid ? 'border-emerald-500/40' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* Persona / Familiar */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {loan.person}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isPaid ? '¡PAGADO TOTALMENTE!' : 'PENDIENTE'}
                        </span>
                      </div>

                      {/* Monto Prestado Total y Cuenta inicial */}
                      <p className="text-xs text-slate-400 mt-1">
                        Préstamo total: <strong className="text-slate-200">{formatAmount(loan.initialAmount)}</strong> • {loan.paymentMethod}
                      </p>
                    </div>

                    {/* Monto que aún debe / falta */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-slate-400">
                        {activeTab === 'yo_preste' ? 'Aún te debe:' : 'Aún le debes:'}
                      </div>
                      <div className={`text-lg sm:text-xl font-black ${isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatAmount(loan.remainingAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de pago */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                      <span>Pagado: {formatAmount(totalPaid)}</span>
                      <span>{progressPct}% saldado</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <>
                          <button
                            onClick={() => {
                              setAbonoLoanId(loan.id);
                              setExtraLoanId(null);
                              setShowNewLoanForm(false);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>+ Registrar Abono</span>
                          </button>

                          <button
                            onClick={() => {
                              setExtraLoanId(loan.id);
                              setAbonoLoanId(null);
                              setShowNewLoanForm(false);
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold"
                          >
                            + Prestar Más
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botón ver historial */}
                      <button
                        onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <span>Historial ({loan.payments?.length || 0})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar este préstamo de ${loan.person}?`)) {
                            deleteLoan(loan.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                        title="Eliminar registro de préstamo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Historial desplegable de abonos y ampliaciones */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 animate-fadeIn text-xs">
                      <div className="font-bold text-slate-300">Detalle de movimientos de este préstamo:</div>
                      {loan.history && loan.history.map((h, i) => (
                        <div key={i} className="p-2.5 bg-slate-900/90 rounded-xl flex items-center justify-between border border-slate-800/60">
                          <div>
                            <span className={`font-bold ${h.type === 'abono' ? 'text-emerald-400' : 'text-indigo-300'}`}>
                              {h.type === 'abono' ? 'Abono recibido' : (h.type === 'inicial' ? 'Préstamo inicial' : 'Préstamo adicional')}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {h.date} • {h.time} • {h.paymentMethod} {h.note ? `• "${h.note}"` : ''}
                            </div>
                          </div>
                          <div className="font-bold text-sm text-white">
                            {formatAmount(h.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pie de modal */}
        <div className="p-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
