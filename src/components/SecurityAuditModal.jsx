import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  X,
  RefreshCw,
  Clock,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function SecurityAuditModal({ isOpen, onClose }) {
  const {
    auditLogs,
    checkIntegrity,
    integrityStatus,
    currentDevice,
    transactions
  } = useVault();

  const [activeTab, setActiveTab] = useState('audit'); // 'audit', 'integrity', 'device'
  const [checking, setChecking] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  if (!isOpen) return null;

  const handleRunIntegrityCheck = async () => {
    setChecking(true);
    try {
      const res = await checkIntegrity();
      setAuditResult(res);
    } catch (err) {
      setAuditResult({ valid: false, reason: err.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative max-h-[90vh] flex flex-col text-slate-900 dark:text-white">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Seguridad y Auditoría</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Registro Inmutable & Verificación SHA-256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas internas */}
        <div className="flex gap-2 my-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Auditoría Inmutable ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('integrity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === 'integrity'
                ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Verificación SHA-256
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === 'device'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Dispositivo Seguro
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {activeTab === 'audit' && (
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">Sin registros de auditoría</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString('es-PE')}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-sans text-xs">{log.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-900">
                      <span>Disp: {log.deviceId}</span>
                      {log.hash && (
                        <span className="text-teal-600 dark:text-teal-400 truncate max-w-[200px]" title={log.hash}>
                          Hash: {log.hash.substring(0, 16)}...
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'integrity' && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Estado de la Cadena Criptográfica
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Cada registro se enlaza con el anterior mediante un hash SHA-256 criptográfico idéntico a una cadena de bloques inmutable. Si alguien manipula o altera cualquier registro directamente en el almacenamiento, la comprobación alertará inmediatamente.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleRunIntegrityCheck}
                    disabled={checking}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? 'Auditando registros...' : 'Escanear Integridad Completa'}
                  </button>
                </div>
              </div>

              {/* Resultado del escaneo */}
              {auditResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    auditResult.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold font-mono">
                    {auditResult.valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>INTEGRIDAD 100% VERIFICADA</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>MANIPULACIÓN O CORRUPCIÓN DETECTADA</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 font-sans text-xs">
                    {auditResult.valid
                      ? `Se verificaron exitosamente ${auditResult.count} bloques encadenados. No se detectó ninguna alteración inesperada.`
                      : auditResult.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'device' && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Smartphone className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  Identificador Criptográfico del Dispositivo
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div>ID Corto: <span className="text-teal-600 dark:text-teal-400 font-bold">{currentDevice?.id}</span></div>
                  <div>Tipo: <span className="text-slate-800 dark:text-slate-200">{currentDevice?.label}</span></div>
                  <div className="break-all text-[10px] text-slate-400 dark:text-slate-500">
                    Huella SHA-256: {currentDevice?.fullHash}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Este dispositivo genera una sal secreta única guardada localmente para autorizar las operaciones criptográficas. Ningún dispositivo externo puede descifrar tus datos sin tu clave y sin autorización.
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
