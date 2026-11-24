import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  PRESET_PHRASES,
  normalizeText
} from '../utils/presetPhrases';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Lock,
  Clock,
  ChevronDown,
  CreditCard,
  Calculator
} from 'lucide-react';

function evaluateMath(expr) {
  if (!expr) return null;
  const clean = expr.trim();
  // Validar que solo contenga números, puntos, espacios y operadores permitidos
  if (!/^[0-9+\-*/. ()]+$/.test(clean)) return null;
  try {
    const result = Function(`"use strict"; return (${clean})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result * 100) / 100;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export default function TransactionForm() {
  const { addTransaction, settings, learnedPhrases } = useVault();

  const [type, setType] = useState('gasto'); // 'gasto' o 'ingreso'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState('Yape');
  const [description, setDescription] = useState('');

  // Fecha y hora en vivo
  const [currentDateTimeStr, setCurrentDateTimeStr] = useState('');

  // Autocompletado inteligente
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cálculo en vivo de la calculadora
  const calculatedResult = evaluateMath(amount);
  const hasMathOperator = /[+\-*/]/.test(amount);

  // Reloj en vivo
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timePart = now.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setCurrentDateTimeStr(`${datePart} • ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Al alternar entre gasto e ingreso, actualizar categorías
  useEffect(() => {
    if (type === 'gasto') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [type]);

  // Obtener todas las frases disponibles (las del usuario tienen prioridad)
  const getAllPhrases = () => {
    const customUserList = learnedPhrases
      .filter(p => p.type === type)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map(p => p.text);

    const defaultList = PRESET_PHRASES[type] || [];

    const combined = [...customUserList];
    defaultList.forEach(item => {
      const normItem = normalizeText(item);
      if (!combined.some(c => normalizeText(c) === normItem)) {
        combined.push(item);
      }
    });

    return combined;
  };

  // Filtrado predictivo con normalización de tildes
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    if (val.trim().length > 0) {
      const normInput = normalizeText(val);
      const all = getAllPhrases();

      const filtered = all.filter(p => {
        const normP = normalizeText(p);
        return normP.includes(normInput);
      }).slice(0, 8);

      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Seleccionar sugerencia
  const handleSelectSuggestion = (phrase) => {
    setDescription(phrase);
    setShowDropdown(false);

    const norm = normalizeText(phrase);
    if (type === 'gasto') {
      if (norm.includes('picar') || norm.includes('alfajor') || norm.includes('galleta') || norm.includes('snack')) {
        setCategory('Algo para picar');
      } else if (norm.includes('pasaje') || norm.includes('micro') || norm.includes('taxi')) {
        setCategory('Pasaje');
      } else if (norm.includes('refrezco') || norm.includes('gaseosa') || norm.includes('agua') || norm.includes('jugo')) {
        setCategory('Refrezcos');
      } else if (norm.includes('comida') || norm.includes('almuerzo') || norm.includes('desayuno') || norm.includes('cena')) {
        setCategory('Comida');
      } else if (norm.includes('prestamo') || norm.includes('preste') || norm.includes('prestar')) {
        setCategory('Préstamos');
      }
    } else {
      if (norm.includes('prestamo') || norm.includes('preste') || norm.includes('prestar')) {
        setCategory('Préstamos');
      } else if (norm.includes('propina') || norm.includes('regalo') || norm.includes('dieron')) {
        setCategory('Propina');
      } else if (norm.includes('trabajo') || norm.includes('sueldo') || norm.includes('quincena')) {
        setCategory('Trabajo');
      } else if (norm.includes('universidad') || norm.includes('estudio')) {
        setCategory('Universidad');
      }
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Resolver cálculo de calculadora si escribió una suma tipo 2.50 + 3
    const finalAmount = calculatedResult !== null ? calculatedResult : parseFloat(amount);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Por favor escribe el motivo');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeFormatted = now.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      await addTransaction({
        type,
        amount: finalAmount,
        category,
        paymentMethod,
        description: description.trim(),
        date: `${dateFormatted} • ${timeFormatted}`,
        notes: ''
      });

      setSuccessAnim(true);
      setTimeout(() => setSuccessAnim(false), 2200);

      setAmount('');
      setDescription('');
      setShowDropdown(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el movimiento');
    } finally {
      setSaving(false);
    }
  };

  const currentCategories = type === 'gasto' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const quickChips = getAllPhrases().slice(0, 4);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Selector: Salida (Gasto) vs Ingreso */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => setType('gasto')}
          className={`py-3 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            type === 'gasto'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownCircle className="w-5 h-5 text-rose-400" />
          Registrar Salida (Gasto)
        </button>

        <button
          type="button"
          onClick={() => setType('ingreso')}
          className={`py-3 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            type === 'ingreso'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
          Registrar Ingreso
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs sm:text-sm text-rose-300">
          {errorMsg}
        </div>
      )}

      {successAnim && (
        <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-sm text-emerald-300 flex items-center gap-2.5">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>¡Movimiento registrado con éxito!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FILA 1: CATEGORÍA Y MEDIO / CUENTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CATEGORÍA */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
              Categoría
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium text-sm sm:text-base focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                {currentCategories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white py-2">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* CUENTA / MEDIO DE PAGO */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Cuenta / Medio
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method} className="bg-slate-900 text-white font-bold py-2">
                    {method}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* FILA 2: MONTO CON CALCULADORA MATEMÁTICA RÁPIDA */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-400" />
              ¿Cuánto dinero es? ({settings.currency || 'S/.'})
            </label>
            {hasMathOperator && calculatedResult !== null && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                = {settings.currency || 'S/.'} {calculatedResult.toFixed(2)}
              </span>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
              {settings.currency || 'S/.'}
            </span>
            <input
              type="text"
              placeholder="0.00 (puedes escribir 2.50 + 3)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Atajos de suma rápida para agregar dinero con un toque */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-medium">Sumar:</span>
            {[1, 2, 5, 10, 20].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => {
                  const currentVal = calculatedResult !== null ? calculatedResult : parseFloat(amount);
                  const base = isNaN(currentVal) ? 0 : currentVal;
                  setAmount((base + inc).toFixed(2));
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                + {inc}
              </button>
            ))}
          </div>
        </div>

        {/* FILA 3: MOTIVO */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
            Motivo
          </label>

          <input
            ref={inputRef}
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            onFocus={() => {
              if (description.trim().length > 0 && suggestions.length > 0) {
                setShowDropdown(true);
              }
            }}
            placeholder="Escribe el motivo..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-normal"
            required
            autoComplete="off"
          />

          {/* Menú flotante de opciones */}
          {showDropdown && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto"
            >
              <div className="px-3.5 py-2 bg-slate-900 text-xs font-semibold text-indigo-300 flex items-center justify-between">
                <span>Opciones para terminar tu frase rápido</span>
                <span className="text-[11px] text-slate-400">Toca para escoger</span>
              </div>
              {suggestions.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(phrase)}
                  className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-indigo-600/25 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="truncate font-medium">{phrase}</span>
                  <span className="text-xs text-indigo-400 font-semibold ml-2 flex-shrink-0">
                    Completar ↵
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Opciones rápidas */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 self-center font-medium">Opciones:</span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(chip)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-indigo-900 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* FECHA Y HORA ACTUAL FIJA */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Fecha y hora de registro:</span>
          </div>
          <div className="font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30">
            {currentDateTimeStr || 'Actual automática'} (Fija)
          </div>
        </div>

        {/* BOTÓN REGISTRAR */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-base text-white transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg ${
            type === 'gasto'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/40'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>{type === 'gasto' ? 'Registrar Salida' : 'Registrar Ingreso'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
