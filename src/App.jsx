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
import { ShieldCheck, Download, Smartphone } from 'lucide-react';

export default function App() {
  const { isInitialized, isLocked, isSetupDone } = useVault();

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
  // Cero fuga de información: ningún saldo ni registro se renderiza
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

        {/* Formulario de Entrada con Autocompletado Predictivo */}
        <TransactionForm />

        {/* Lista de Movimientos con Verificación Criptográfica */}
        <TransactionList />
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
