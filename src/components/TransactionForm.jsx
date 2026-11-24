import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { CUSTOM_CATEGORIES, PRESET_PHRASES, normalizeText } from '../utils/presetPhrases';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Sparkles,
  Lock,
  Clock,
  ChevronDown
} from 'lucide-react';

export default function TransactionForm() {
  const { addTransaction, settings, learnedPhrases } = useVault();

  const [type, setType] = useState('gasto'); // 'gasto' o 'ingreso'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CUSTOM_CATEGORIES[0].label);

  // Estados de fecha y hora automática
  const [currentDateTimeStr, setCurrentDateTimeStr] = useState('');

  // Estados de autocompletado inteligente adaptativo
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Reloj en vivo para mostrar la fecha y hora fija actual
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

  // Al cambiar entre gasto e ingreso, reajustar categoría por defecto apropiada
  useEffect(() => {
    if (type === 'gasto') {
      setCategory('Algo para picar');
    } else {
      setCategory('Trabajo');
    }
  }, [type]);

  // Obtener todas las frases disponibles: aprendidas del usuario primero, luego presets
  const getAllPhrases = () => {
    // 1. Frases aprendidas del propio usuario (máxima prioridad)
    const customUserList = learnedPhrases
      .filter(p => p.type === type)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map(p => p.text);

    // 2. Frases predeterminadas
    const defaultList = PRESET_PHRASES[type] || [];

    // Unir sin duplicados ignorando tildes y mayúsculas
    const combined = [...customUserList];
    defaultList.forEach(item => {
      const normItem = normalizeText(item);
      if (!combined.some(c => normalizeText(c) === normItem)) {
        combined.push(item);
      }
    });

    return combined;
  };

  // Filtrado reactivo en tiempo real con soporte total de tildes/sin tildes
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    if (val.trim().length > 0) {
      const normInput = normalizeText(val);
      const all = getAllPhrases();

      // Buscar coincidencias ignorando tildes y mayúsculas
      const filtered = all.filter(p => {
        const normP = normalizeText(p);
        return normP.includes(normInput);
      }).slice(0, 8); // Mostrar hasta 8 sugerencias

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

    // Detección automática inteligente de categoría según la frase
    const norm = normalizeText(phrase);
    if (norm.includes('picar') || norm.includes('alfajor') || norm.includes('galleta') || norm.includes('snack') || norm.includes('papas')) {
      setCategory('Algo para picar');
    } else if (norm.includes('pasaje') || norm.includes('micro') || norm.includes('taxi') || norm.includes('bus') || norm.includes('metro')) {
      setCategory('Pasaje');
    } else if (norm.includes('refrezco') || norm.includes('refresco') || norm.includes('gaseosa') || norm.includes('agua') || norm.includes('jugo')) {
      setCategory('Refrezcos');
    } else if (norm.includes('almuerzo') || norm.includes('comida') || norm.includes('desayuno') || norm.includes('cena') || norm.includes('menu')) {
      setCategory('Comida');
    } else if (norm.includes('universidad') || norm.includes('estudio') || norm.includes('libro') || norm.includes('copia')) {
      setCategory('Estudios o universidad');
    } else if (norm.includes('trabajo') || norm.includes('sueldo') || norm.includes('quincena') || norm.includes('salario')) {
      setCategory('Trabajo');
    } else if (norm.includes('juego') || norm.includes('recarga') || norm.includes('play')) {
      setCategory('Juegos');
    } else if (norm.includes('salida') || norm.includes('amigos') || norm.includes('paseo')) {
      setCategory('Salidas');
    } else if (norm.includes('mercado') || norm.includes('verdura') || norm.includes('carne') || norm.includes('abarrote')) {
      setCategory('Compras de mercado');
    } else if (norm.includes('trago') || norm.includes('cerveza') || norm.includes('chela') || norm.includes('botella')) {
      setCategory('Trago');
    } else if (norm.includes('regalo') || norm.includes('propina') || norm.includes('cumple')) {
      setCategory('Regalos');
    } else if (norm.includes('veterinaria') || norm.includes('perro') || norm.includes('gato') || norm.includes('mascota')) {
      setCategory('Veterinaria');
    } else if (norm.includes('hospital') || norm.includes('medico') || norm.includes('farmacia') || norm.includes('pastilla')) {
      setCategory('Hospital');
    } else if (norm.includes('apoyo') || norm.includes('prestamo') || norm.includes('preste') || norm.includes('ayuda')) {
      setCategory('Apoyos');
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

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Por favor escribe el motivo o por qué del dinero');
      return;
    }

    setSaving(true);
    try {
      // Fecha y hora actual inmutable
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
        amount,
        category,
        description: description.trim(),
        date: `${dateFormatted} • ${timeFormatted}`,
        notes: ''
      });

      // Animación de éxito
      setSuccessAnim(true);
      setTimeout(() => setSuccessAnim(false), 2200);

      // Limpiar formulario para el siguiente registro
      setAmount('');
      setDescription('');
      setShowDropdown(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el movimiento');
    } finally {
      setSaving(false);
    }
  };

  const quickChips = getAllPhrases().slice(0, 4);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Selector Principal: Salida vs Ingreso con letras grandes y claras */}
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
          <span>¡Movimiento registrado con éxito! Quedó sellado con su fecha y hora fija.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. SELECCIÓN DE CATEGORÍA */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
            Categoría
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white font-medium text-base focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {CUSTOM_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.label} className="bg-slate-900 text-white py-2">
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2. CAMPO MONTO */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
            ¿Cuánto dinero es? ({settings.currency || 'S/.'})
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* 3. CAMPO MOTIVO (EL POR QUÉ) CON APRENDIZAJE Y AUTOCOMPLETADO */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Motivo (El por qué)
            </label>
            <span className="text-[11px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
              Aprende de tu forma de escribir
            </span>
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
                ? 'Escribe el motivo (ej: "compre un alfajor", "pasaje", etc.)'
                : 'Escribe el motivo (ej: "sueldo", "plata que me dieron", etc.)'
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-normal"
            required
            autoComplete="off"
          />

          {/* Menú flotante de opciones inteligentes mientras escribe */}
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

          {/* Opciones rápidas para pulsar directamente */}
          <div className="mt-2.5 flex flex-wrap gap-2">
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

        {/* 4. FECHA Y HORA ACTUAL: AUTOMÁTICA E INMUTABLE */}
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
