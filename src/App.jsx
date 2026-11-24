import React, { useState } from 'react';
import { useVault } from './context/VaultContext';
import LockScreen from './components/LockScreen';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import LoansManager from './components/LoansManager';
import ManualBalanceModal from './components/ManualBalanceModal';
import ProtectedTrashModal from './components/ProtectedTrashModal';
import SecurityAuditModal from './components/SecurityAuditModal';
import SettingsBackupModal from './components/SettingsBackupModal';
import { ShieldCheck, ReceiptText, HandCoins } from 'lucide-react';

export default function App() {
  const { isInitialized, isLocked, isSetupDone, pendingLoansCount } = useVault();

  // Sección principal activa: 'movimientos' o 'prestamos'
  const [currentSection, setCurrentSection] = useState('movimientos');

  // Modales
  const [showManualBalance, setShowManualBalance] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      {/* Cabecera de Seguridad */}
      <Header
        onOpenTrash={() => setShowTrash(true)}
        onOpenAudit={() => setShowAudit(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenManualBalance={() => setShowManualBalance(true)}
      />

      {/* Contenedor Principal Adaptable a Celular */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-4 py-4 space-y-4 pb-20">
        {/* Selector Principal de Vista: Movimientos vs Préstamos y Deudas */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setCurrentSection('movimientos')}
            className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              currentSection === 'movimientos'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ReceiptText className="w-5 h-5" />
            <span>Movimientos</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentSection('prestamos')}
            className={`py-3 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all relative ${
              currentSection === 'prestamos'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HandCoins className="w-5 h-5 text-amber-300" />
            <span>Préstamos / Deudas</span>
            {pendingLoansCount > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-slate-950 text-xs font-black rounded-full flex items-center justify-center">
                {pendingLoansCount}
              </span>
            )}
          </button>
        </div>

        {/* VISTA 1: MOVIMIENTOS (GASTOS E INGRESOS) */}
        {currentSection === 'movimientos' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Tarjeta de Dinero General */}
            <BalanceCard onOpenManualBalance={() => setShowManualBalance(true)} />

            {/* Formulario de Entrada con Calculadora y Autocompletado */}
            <TransactionForm />

            {/* Lista de Movimientos con Filtros de Tiempo */}
            <TransactionList />
          </div>
        )}

        {/* VISTA 2: GESTOR DE PRÉSTAMOS Y DEUDAS */}
        {currentSection === 'prestamos' && (
          <div className="animate-fadeIn">
            <LoansManager />
          </div>
        )}
      </main>

      {/* Modales */}
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
