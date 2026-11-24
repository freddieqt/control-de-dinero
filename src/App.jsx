import React, { useState } from 'react';
import { useVault } from './context/VaultContext';
import LockScreen from './components/LockScreen';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ManualBalanceModal from './components/ManualBalanceModal';
import ProtectedTrashModal from './components/ProtectedTrashModal';
import SecurityAuditModal from './components/SecurityAuditModal';
import SettingsBackupModal from './components/SettingsBackupModal';
import LoansModal from './components/LoansModal';
import { ShieldCheck, HandCoins } from 'lucide-react';

export default function App() {
  const { isInitialized, isLocked, isSetupDone, totalMeDeben, totalYoDebo, settings, privacyMode } = useVault();

  // Modales
  const [showManualBalance, setShowManualBalance] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoans, setShowLoans] = useState(false);

  const formatAmount = (num) => {
    if (privacyMode) return '••••••';
    return `${settings.currency || 'S/.'} ${(num || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Pantalla de carga mientras se inicializa el motor criptográfico
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="text-white font-bold tracking-tight text-lg">Iniciando Bóveda Cifrada</div>
        <p className="text-slate-500 text-xs font-mono mt-1">Cargando módulos criptográficos y base de datos...</p>
      </div>
    );
  }

  // Si la bóveda está bloqueada o aún no configurada, mostrar Pantalla de Bloqueo
  if (isLocked || !isSetupDone) {
    return <LockScreen />;
  }

  // Interfaz de Bóveda Desbloqueada
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      {/* Cabecera de Seguridad */}
      <Header
        onOpenTrash={() => setShowTrash(true)}
        onOpenAudit={() => setShowAudit(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenManualBalance={() => setShowManualBalance(true)}
      />

      {/* Contenedor Principal Adaptable a Celular */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-4 py-4 space-y-4 pb-20">
        {/* Tarjeta de Dinero General */}
        <BalanceCard onOpenManualBalance={() => setShowManualBalance(true)} />

        {/* Tarjeta de Acceso Rápido a Préstamos (Quién me debe / A quién le debo) */}
        <div className="bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/50 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <HandCoins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Control de Préstamos</span>
                {(totalMeDeben > 0 || totalYoDebo > 0) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Te deben: <strong className="text-emerald-400 font-bold">{formatAmount(totalMeDeben)}</strong></span>
                <span>•</span>
                <span>Debes: <strong className="text-rose-400 font-bold">{formatAmount(totalYoDebo)}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLoans(true)}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow flex-shrink-0"
          >
            Ver Préstamos
          </button>
        </div>

        {/* Formulario de Entrada con Calculadora y Autocompletado */}
        <TransactionForm />

        {/* Lista de Movimientos con Filtros por Tiempo */}
        <TransactionList />
      </main>

      {/* Modales */}
      <LoansModal
        isOpen={showLoans}
        onClose={() => setShowLoans(false)}
      />

      <ManualBalanceModal
        isOpen={showManualBalance}
        onClose={() => setShowManualBalance(false)}
      />

      <ProtectedTrashModal
        isOpen={showTrash}
        onClose={() => setShowTrash(false)}
      />

      <SecurityAuditModal
        isOpen={showAudit}
        onClose={() => setShowAudit(false)}
      />

      <SettingsBackupModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
