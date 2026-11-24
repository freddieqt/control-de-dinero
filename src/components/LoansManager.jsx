import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { PAYMENT_METHODS } from '../utils/presetPhrases';
import { evaluateMathExpression } from '../utils/calcHelper';
import {
  Users,
  HandCoins,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  AlertCircle,
  Calculator
} from 'lucide-react';

const COMMON_RELATIONS = ['Papá', 'Mamá', 'Tío', 'Tía', 'Hermano', 'Prima', 'Primo', 'Amigo', 'Compañero'];

export default function LoansManager() {
  const {
    loans,
    totalMeDeben,
    totalYoDebo,
    createLoan,
    addLoanPayment,
    addLoanExtraAmount,
    deleteLoan,
    privacyMode,
    settings
  } = useVault();

  const [activeTab, setActiveTab] = useState('me_deben'); // 'me_deben' (yo presté) | 'yo_debo' (me prestaron)
  const [filterStatus, setFilterStatus] = useState('pendiente'); // 'pendiente' | 'pagado' | 'todos'

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { type: 'abono' | 'extra', loan: object }

  // Estados del formulario crear
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Yape');
  const [note, setNote] = useState('');
  const [syncTransaction, setSyncTransaction] = useState(true);

  // Estados modal abono / extra
  const [actionAmount, setActionAmount] = useState('');
  const [actionMethod, setActionMethod] = useState('Yape');
  const [actionNote, setActionNote] = useState('');
  const [actionSync, setActionSync] = useState(true);

  // Expansión de historial
  const [expandedLoanId, setExpandedLoanId] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtrar préstamos de la pestaña activa
  const currentLoans = loans
    .filter(l => l.type === activeTab)
    .filter(l => {
      if (filterStatus === 'pendiente') return l.status !== 'pagado';
      if (filterStatus === 'pagado') return l.status === 'pagado';
      return true;
    })
    .sort((a, b) => (b.updatedAt || b.timestamp) - (a.updatedAt || a.timestamp));

  // Abrir modal de crear
  const handleOpenCreate = () => {
    setPersonName('');
    setAmount('');
    setNote('');
    setPaymentMethod('Yape');
    setSyncTransaction(true);
    setErrorMsg('');
    setShowCreateModal(true);
  };

  // Guardar nuevo préstamo
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    let finalAmount = null;
    if (amount && /[+\-*/]/.test(amount)) {
      finalAmount = evaluateMathExpression(amount);
    } else {
      finalAmount = parseFloat(amount);
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }

    if (!personName.trim()) {
      setErrorMsg('Ingresa el nombre o parentesco de la persona');
      return;
    }

    setSaving(true);
    try {
      await createLoan({
        type: activeTab,
        personName: personName.trim(),
        amount: finalAmount,
        paymentMethod,
        note: note.trim(),
        syncTransaction
      });
      setShowCreateModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar préstamo');
    } finally {
      setSaving(false);
    }
  };

  // Guardar abono o monto adicional
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModal) return;
    setErrorMsg('');

    let finalAmount = null;
    if (actionAmount && /[+\-*/]/.test(actionAmount)) {
      finalAmount = evaluateMathExpression(actionAmount);
    } else {
      finalAmount = parseFloat(actionAmount);
    }

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }

    setSaving(true);
    try {
      if (actionModal.type === 'abono') {
        await addLoanPayment({
          loanId: actionModal.loan.id,
          amount: finalAmount,
          paymentMethod: actionMethod,
          note: actionNote.trim(),
          syncTransaction: actionSync
        });
      } else {
        await addLoanExtraAmount({
          loanId: actionModal.loan.id,
          additionalAmount: finalAmount,
          paymentMethod: actionMethod,
          note: actionNote.trim(),
          syncTransaction: actionSync
        });
      }
      setActionModal(null);
      setActionAmount('');
      setActionNote('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar acción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Selector Superior: "Me deben" vs "Yo debo" */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('me_deben')}
          className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
            activeTab === 'me_deben'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <HandCoins className="w-5 h-5 text-emerald-300" />
          <span>Me Deben</span>
        </button>

        <button
          onClick={() => setActiveTab('yo_debo')}
          className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
            activeTab === 'yo_debo'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 text-rose-300" />
          <span>Yo Debo</span>
        </button>
      </div>

      {/* 2. Tarjeta Resumen Total y Botón Agregar */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {activeTab === 'me_deben' ? 'Dinero total que te deben por cobrar:' : 'Dinero total que debes por pagar:'}
          </div>
          <div className={`text-3xl sm:text-4xl font-black mt-1 tracking-tight ${
            activeTab === 'me_deben' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatAmount(activeTab === 'me_deben' ? totalMeDeben : totalYoDebo)}
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className={`py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
            activeTab === 'me_deben'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/20'
              : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/20'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>{activeTab === 'me_deben' ? '+ Prestar Dinero' : '+ Me Prestaron Dinero'}</span>
        </button>
      </div>

      {/* 3. Sub-filtro: Pendientes vs Pagados */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <button
            onClick={() => setFilterStatus('pendiente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === 'pendiente' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilterStatus('pagado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === 'pagado' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completamente Pagados
          </button>
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterStatus === 'todos' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {currentLoans.length} {currentLoans.length === 1 ? 'persona' : 'personas'}
        </span>
      </div>

      {/* 4. Lista de Personas / Préstamos */}
      {currentLoans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
            {filterStatus === 'pendiente'
              ? (activeTab === 'me_deben' ? 'No tienes dinero pendiente por cobrar.' : 'No tienes deudas pendientes por pagar.')
              : 'No hay préstamos en esta lista.'}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Usa el botón de arriba para registrar uno nuevo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentLoans.map((loan) => {
            const pending = Math.max(0, (loan.totalAmount || 0) - (loan.paidAmount || 0));
            const progress = loan.totalAmount > 0 ? Math.min(100, Math.round(((loan.paidAmount || 0) / loan.totalAmount) * 100)) : 0;
            const isCompleted = loan.status === 'pagado' || pending === 0;

            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {loan.personName}
                      </h4>
                      {loan.paymentMethod && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                          {loan.paymentMethod}
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                      }`}>
                        {isCompleted ? '¡PAGADO COMPLETO!' : `FALTA: ${formatAmount(pending)}`}
                      </span>
                    </div>

                    {loan.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{loan.note}</p>
                    )}
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el registro de préstamo de ${loan.personName}?`)) {
                        deleteLoan(loan.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Eliminar préstamo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Números: Total, Pagado, Falta */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-center border border-slate-100 dark:border-transparent">
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Prestado</div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatAmount(loan.totalAmount)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Pagado</div>
                    <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatAmount(loan.paidAmount)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Falta Pagar</div>
                    <div className={`text-sm sm:text-base font-black mt-0.5 ${
                      isCompleted ? 'text-slate-400 dark:text-slate-500' : (activeTab === 'me_deben' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')
                    }`}>
                      {formatAmount(pending)}
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Progreso de devolución</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Botones de acción rápida: Abonar parte, Prestar más */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        setActionModal({ type: 'abono', loan });
                        setActionAmount('');
                        setActionNote('');
                        setActionMethod('Yape');
                        setActionSync(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{activeTab === 'me_deben' ? '+ Me pagó una parte' : '+ Pagué una parte'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActionModal({ type: 'extra', loan });
                      setActionAmount('');
                      setActionNote('');
                      setActionMethod('Yape');
                      setActionSync(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{activeTab === 'me_deben' ? '+ Prestarle más' : '+ Pedir prestado más'}</span>
                  </button>

                  {/* Ver historial */}
                  <button
                    onClick={() => setExpandedLoanId(expandedLoanId === loan.id ? null : loan.id)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Historial ({loan.history?.length || 1})</span>
                    {expandedLoanId === loan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Historial desplegable de cuotas y abonos */}
                {expandedLoanId === loan.id && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Historial de abonos y préstamos:</div>
                    {loan.history && loan.history.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-800/80 last:border-0">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className={h.type === 'abono' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-indigo-600 dark:text-indigo-400 font-bold'}>
                              {h.type === 'abono' ? '✓ Abono registrado' : '+ Préstamo entregado'}
                            </span>
                            {h.paymentMethod && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                                {h.paymentMethod}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{h.date} {h.note ? `• ${h.note}` : ''}</div>
                        </div>

                        <div className={`font-bold text-sm ${h.type === 'abono' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {h.type === 'abono' ? '+' : ''}{formatAmount(h.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: REGISTRAR NUEVO PRÉSTAMO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {activeTab === 'me_deben' ? 'Registrar Dinero Prestado' : 'Registrar Dinero que me Prestaron'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {activeTab === 'me_deben' ? 'Dinero que tú prestaste a alguien' : 'Dinero que alguien te prestó a ti'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Persona / Familiar */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {activeTab === 'me_deben' ? '¿A quién le prestaste?' : '¿Quién te prestó?'}
                </label>
                <input
                  type="text"
                  placeholder="Ej: Papá, Mamá, Tío Carlos, Juan..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                  required
                  autoFocus
                />

                {/* Sugerencias rápidas de familiares */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center font-medium">Rápidos:</span>
                  {COMMON_RELATIONS.map((rel, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPersonName(rel)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 dark:bg-slate-950 dark:hover:bg-indigo-900 text-slate-700 hover:text-indigo-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  ¿Cuánto dinero es? ({settings.currency || 'S/.'})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    {settings.currency || 'S/.'}
                  </span>
                  <input
                    type="text"
                    placeholder="0.00 (puedes sumar ej: 50 + 20)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Cuenta / Medio */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Cuenta / Medio de entrega
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">{m}</option>
                  ))}
                </select>
              </div>

              {/* Nota opcional */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Motivo o nota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Para compras, medicina, encargo..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                />
              </div>

              {/* Sincronizar con movimientos generales */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="syncCheck"
                  checked={syncTransaction}
                  onChange={(e) => setSyncTransaction(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="syncCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Registrar automáticamente en mis movimientos generales como {activeTab === 'me_deben' ? 'Salida' : 'Ingreso'}.
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg ${
                    activeTab === 'me_deben' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {saving ? 'Guardando...' : 'Guardar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ABONAR PARTE O PRESTAR MÁS */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActionModal(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {actionModal.type === 'abono'
                ? (actionModal.loan.type === 'me_deben' ? `Abono de ${actionModal.loan.personName}` : `Pago de deuda a ${actionModal.loan.personName}`)
                : (actionModal.loan.type === 'me_deben' ? `Prestarle más a ${actionModal.loan.personName}` : `Pedir prestado más a ${actionModal.loan.personName}`)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Saldo pendiente actual: <strong className="text-amber-600 dark:text-amber-400">{formatAmount(Math.max(0, actionModal.loan.totalAmount - actionModal.loan.paidAmount))}</strong>
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {/* Monto del abono o préstamo extra */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {actionModal.type === 'abono' ? '¿Cuánto dinero te pagó / abonó?' : '¿Cuánto dinero más se prestó?'} ({settings.currency || 'S/.'})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    {settings.currency || 'S/.'}
                  </span>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Cuenta / Medio */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Cuenta / Medio
                </label>
                <select
                  value={actionMethod}
                  onChange={(e) => setActionMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">{m}</option>
                  ))}
                </select>
              </div>

              {/* Nota opcional */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Nota o detalle (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Abono parte 1, Yape de noche..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                />
              </div>

              {/* Sincronizar con movimientos generales */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="syncActionCheck"
                  checked={actionSync}
                  onChange={(e) => setActionSync(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="syncActionCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Registrar automáticamente en mis movimientos generales.
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg"
                >
                  {saving ? 'Guardando...' : (actionModal.type === 'abono' ? 'Guardar Abono' : 'Guardar Préstamo Extra')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
