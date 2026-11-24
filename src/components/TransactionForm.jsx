import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { PRESET_PHRASES, CATEGORIES } from '../utils/presetPhrases';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Sparkles,
  Lock,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  HelpCircle,
  Briefcase,
  Laptop,
  Gift,
  Coins,
  Receipt,
  Tag
} from 'lucide-react';

const CATEGORY_ICONS = {
  comida: Utensils,
  transporte: Car,
  servicios: Zap,
  compras: ShoppingBag,
  salud: HeartPulse,
  ocio: Film,
  educacion: GraduationCap,
  otros: HelpCircle,
  sueldo: Briefcase,
  freelance: Laptop,
  regalo: Gift,
  cobro: Receipt,
  venta: Tag
};

export default function TransactionForm() {
  const { addTransaction, settings, learnedPhrases } = useVault();

  const [type, setType] = useState('gasto'); // 'gasto' o 'ingreso'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('comida');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Estados de autocompletado inteligente predictivo
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Al cambiar entre gasto e ingreso, reajustar categoría por defecto
  useEffect(() => {
    if (type === 'gasto') {
      setCategory('comida');
    } else {
      setCategory('sueldo');
    }
  }, [type]);

  // Lista combinada de frases: frases predeterminadas + frases que el usuario ha usado
  const getAllPhrases = () => {
    const defaultList = PRESET_PHRASES[type] || [];
    const customUserList = learnedPhrases
      .filter(p => p.type === type)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map(p => p.text);

    // Unir sin duplicados (case-insensitive)
    const combined = [...customUserList];
    defaultList.forEach(item => {
      if (!combined.some(c => c.toLowerCase() === item.toLowerCase())) {
        combined.push(item);
      }
    });

    return combined;
  };

  // Filtrado reactivo en tiempo real mientras el usuario escribe
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    if (val.trim().length > 0) {
      const all = getAllPhrases();
      const filtered = all.filter(p =>
        p.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 7); // Mostrar hasta 7 sugerencias relevantes

      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Seleccionar una sugerencia para autocompletar la frase al instante
  const handleSelectSuggestion = (phrase) => {
    setDescription(phrase);
    setShowDropdown(false);

    // Inferir categoría automática según la frase seleccionada
    const lower = phrase.toLowerCase();
    if (type === 'gasto') {
      if (lower.includes('alfajor') || lower.includes('almuerzo') || lower.includes('desayuno') || lower.includes('comida') || lower.includes('mercado') || lower.includes('pan') || lower.includes('cena')) {
        setCategory('comida');
      } else if (lower.includes('bus') || lower.includes('taxi') || lower.includes('metro') || lower.includes('gasolina') || lower.includes('pasaje')) {
        setCategory('transporte');
      } else if (lower.includes('luz') || lower.includes('agua') || lower.includes('recarga') || lower.includes('internet') || lower.includes('gas')) {
        setCategory('servicios');
      } else if (lower.includes('farmacia') || lower.includes('medico') || lower.includes('pastillas')) {
        setCategory('salud');
      } else if (lower.includes('amigos') || lower.includes('cine') || lower.includes('streaming')) {
        setCategory('ocio');
      }
    } else {
      if (lower.includes('sueldo') || lower.includes('salario') || lower.includes('quincena')) {
        setCategory('sueldo');
      } else if (lower.includes('propina') || lower.includes('dieron') || lower.includes('regalo')) {
        setCategory('regalo');
      } else if (lower.includes('freelance') || lower.includes('extra')) {
        setCategory('freelance');
      } else if (lower.includes('deuda') || lower.includes('debían')) {
        setCategory('cobro');
      } else if (lower.includes('venta')) {
        setCategory('venta');
      }
    }
  };

  // Cerrar dropdown si se hace click fuera
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

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Por favor especifica el motivo o por qué del dinero');
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        type,
        amount,
        category,
        description,
        date,
        notes
      });

      // Animación de éxito
      setSuccessAnim(true);
      setTimeout(() => setSuccessAnim(false), 2000);

      // Limpiar formulario
      setAmount('');
      setDescription('');
      setNotes('');
      setShowDropdown(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar');
    } finally {
      setSaving(false);
    }
  };

  const currentCategories = CATEGORIES[type] || [];
  const quickChips = getAllPhrases().slice(0, 4);

  return (
    <div className="vault-card rounded-2xl p-5 shadow-xl">
      {/* Selector de Tipo: Salida (Gasto) vs Ingreso */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => setType('gasto')}
          className={`py-2.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            type === 'gasto'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4 text-rose-400" />
          Registrar Salida (Gasto)
        </button>

        <button
          type="button"
          onClick={() => setType('ingreso')}
          className={`py-2.5 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            type === 'ingreso'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
          Registrar Ingreso
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {successAnim && (
        <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Movimiento cifrado y sellado con SHA-256 correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Monto */}
        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Monto ({settings.currency || 'S/.'})
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono font-bold text-slate-400">
              {settings.currency || 'S/.'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {/* Campo 'El Por Qué' (Descripción con autocompletado predictivo inteligente) */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              El Por Qué (Motivo / Detalle)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Autocompletado predictivo</span>
          </div>

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
            placeholder={
              type === 'gasto'
                ? 'Ej: "Compré un alfajor en la tienda", "Pasaje de bus"'
                : 'Ej: "Pago de sueldo", "Dinero que me dieron"'
            }
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            required
            autoComplete="off"
          />

          {/* Menú desplegable flotante de predicción mientras escribe */}
          {showDropdown && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-800"
            >
              <div className="px-3 py-1.5 bg-slate-950/90 text-[10px] uppercase font-mono text-indigo-300 flex items-center justify-between">
                <span>Sugerencias rápidas</span>
                <span>Toca para completar</span>
              </div>
              {suggestions.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(phrase)}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-200 hover:bg-indigo-600/20 hover:text-white flex items-center justify-between group transition-colors"
                >
                  <span className="truncate">{phrase}</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-400 font-mono ml-2">
                    Completar ↵
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Sugerencias Rápidas en chips clicables (para no tener que escribir todo) */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono mr-1 self-center">Opciones rápidas:</span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(chip)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-600/50 transition-all flex items-center gap-1"
              >
                <span>+</span>
                <span className="truncate max-w-[170px]">{chip}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categoría y Fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Categoría con iconos */}
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Categoría
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm appearance-none"
              >
                {currentCategories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
              required
            />
          </div>
        </div>

        {/* Botón de Envío con Cifrado Inmediato */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3.5 px-4 rounded-xl font-bold font-mono tracking-wide text-white transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg ${
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
              <span>{type === 'gasto' ? 'Cifrar y Registrar Salida' : 'Cifrar y Registrar Ingreso'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
