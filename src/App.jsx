import React, { useState, useEffect, useRef } from 'react';
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
import DeadpoolGreeting from './components/DeadpoolGreeting';
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
  const [showDeadpoolWelcome, setShowDeadpoolWelcome] = useState(false);

  // Estado para el aviso de "Pulsa de nuevo para salir" al presionar Retroceder en el celular
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef(0);
  const exitToastTimerRef = useRef(null);

  // Referencias actualizadas para el interceptor del botón Retroceder
  const navStateRef = useRef({
    showManualBalance,
    showTrash,
    showAudit,
    showSettings,
    showDeadpoolWelcome,
    currentSection,
    isLocked
  });
  navStateRef.current = {
    showManualBalance,
    showTrash,
    showAudit,
    showSettings,
    showDeadpoolWelcome,
    currentSection,
    isLocked
  };

  // Interceptor del botón "Atrás / Retroceder" del celular para no salirse de golpe
  useEffect(() => {
    // Insertar estado guarda en el historial al iniciar
    window.history.pushState({ vaultGuard: true }, '');

    const handlePopState = () => {
      const st = navStateRef.current;

      // 1. Si hay algún modal abierto, el botón Atrás cierra primero ese modal
      if (st.showDeadpoolWelcome) {
        setShowDeadpoolWelcome(false);
        window.history.pushState({ vaultGuard: true }, '');
        return;
      }
      if (st.showManualBalance) {
        setShowManualBalance(false);
        window.history.pushState({ vaultGuard: true }, '');
        return;
      }
      if (st.showTrash) {
        setShowTrash(false);
        window.history.pushState({ vaultGuard: true }, '');
        return;
      }
      if (st.showAudit) {
        setShowAudit(false);
        window.history.pushState({ vaultGuard: true }, '');
        return;
      }
      if (st.showSettings) {
        setShowSettings(false);
        window.history.pushState({ vaultGuard: true }, '');
        return;
      }

      // 2. Si está en la pestaña de Préstamos, el botón Atrás regresa primero a Movimientos
      if (!st.isLocked && st.currentSection === 'prestamos') {
        setCurrentSection('movimientos');
        window.history.pushState({ vaultGuard: true }, '');
        return;
      }

      // 3. Si está en la pantalla principal, pedir doble toque ("Pulsa de nuevo para salir")
      const now = Date.now();
      if (now - lastBackPressRef.current < 2400) {
        // Segunda pulsación dentro de 2.4 segundos: permitir salir de la app
        setShowExitToast(false);
        window.history.back();
      } else {
        // Primera pulsación: evitar que se cierre y mostrar aviso
        lastBackPressRef.current = now;
        setShowExitToast(true);
        window.history.pushState({ vaultGuard: true }, '');

        if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
        exitToastTimerRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2400);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    };
  }, []);

  // Detectar cuando el usuario acaba de desbloquear e ingresar a la bóveda
  const prevLockedRef = useRef(true);
  useEffect(() => {
    if (prevLockedRef.current === true && isLocked === false && isSetupDone) {
      setShowDeadpoolWelcome(true);
    }
    prevLockedRef.current = isLocked;
  }, [isLocked, isSetupDone]);

  // Aviso flotante "Pulsa de nuevo para salir" (visible tanto en LockScreen como dentro de la app)
  const exitToastBanner = showExitToast && (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full bg-slate-900/95 dark:bg-slate-800/95 text-white border border-rose-500/40 shadow-2xl text-xs sm:text-sm font-bold tracking-wide flex items-center gap-2 animate-fadeIn pointer-events-none whitespace-nowrap">
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
      <span>Pulsa atrás de nuevo para salir</span>
    </div>
  );

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
    return (
      <>
        <LockScreen />
        {exitToastBanner}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Cabecera de Seguridad con iconos vivos y adaptada a pantalla de celular */}
      <Header
        onOpenTrash={() => setShowTrash(true)}
        onOpenAudit={() => setShowAudit(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenManualBalance={() => setShowManualBalance(true)}
        onOpenDeadpool={() => setShowDeadpoolWelcome(true)}
      />

      {/* Contenedor Principal Adaptable a Celular */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-4 py-4 space-y-4 pb-20">
        {/* Selector Principal de Vista: Movimientos vs Préstamos y Deudas */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setCurrentSection('movimientos')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              currentSection === 'movimientos'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 flex-shrink-0" />
            <span>Movimientos</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentSection('prestamos')}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-base flex items-center justify-center gap-2 transition-all relative whitespace-nowrap ${
              currentSection === 'prestamos'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HandCoins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 flex-shrink-0" />
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

      {/* Aviso flotante "Pulsa atrás de nuevo para salir" */}
      {exitToastBanner}

      {/* Animación del Billete de Dólar de Deadpool al ingresar */}
      <DeadpoolGreeting
        isOpen={showDeadpoolWelcome}
        onClose={() => setShowDeadpoolWelcome(false)}
      />

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
