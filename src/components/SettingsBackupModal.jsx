import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import {
  Settings,
  ShieldCheck,
  Download,
  Upload,
  Lock,
  QrCode,
  KeyRound,
  Check,
  X,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function SettingsBackupModal({ isOpen, onClose }) {
  const {
    settings,
    totpConfig,
    startTotpSetup,
    confirmAndEnableTotp,
    disableTotp,
    exportEncryptedBackup,
    importEncryptedBackup
  } = useVault();

  // Estados de 2FA TOTP
  const [totpSetupData, setTotpSetupData] = useState(null);
  const [totpTestCode, setTotpTestCode] = useState('');
  const [totpDisablePass, setTotpDisablePass] = useState('');
  const [showDisableTotp, setShowDisableTotp] = useState(false);

  // Estados de Respaldos Cifrados
  const [backupPassword, setBackupPassword] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [restoreFileContent, setRestoreFileContent] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Iniciar configuración 2FA
  const handleStartTotp = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await startTotpSetup();
      setTotpSetupData(data);
    } catch (err) {
      setErrorMsg(err.message || "Error al iniciar 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar y activar 2FA
  const handleConfirmTotp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await confirmAndEnableTotp(totpSetupData.secretBase32, totpTestCode);
      setSuccessMsg("¡Segundo Factor 2FA (TOTP) activado con éxito!");
      setTotpSetupData(null);
      setTotpTestCode('');
    } catch (err) {
      setErrorMsg(err.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  // Desactivar 2FA
  const handleDisableTotp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await disableTotp(totpDisablePass);
      setSuccessMsg("2FA desactivado correctamente.");
      setShowDisableTotp(false);
      setTotpDisablePass('');
    } catch (err) {
      setErrorMsg(err.message || "Error al desactivar 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Descargar Respaldo Cifrado
  const handleExportBackup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!backupPassword || backupPassword.length < 6) {
      setErrorMsg("Ingresa una contraseña de al menos 6 caracteres para proteger el respaldo.");
      return;
    }

    setLoading(true);
    try {
      const jsonBackup = await exportEncryptedBackup(backupPassword);
      const blob = new Blob([jsonBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boveda_respaldo_cifrado_${new Date().toISOString().split('T')[0]}.vault`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg("Copia de seguridad cifrada (.vault) descargada con éxito.");
      setBackupPassword('');
    } catch (err) {
      setErrorMsg(err.message || "Error al exportar");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar archivo de respaldo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestoreFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setRestoreFileContent(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Restaurar Respaldo
  const handleImportBackup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!restoreFileContent) {
      setErrorMsg("Selecciona un archivo de respaldo válido.");
      return;
    }
    if (!restorePassword) {
      setErrorMsg("Ingresa la contraseña con la que se cifró este respaldo.");
      return;
    }

    setLoading(true);
    try {
      await importEncryptedBackup(restoreFileContent, restorePassword);
      setSuccessMsg("¡Respaldo cifrado restaurado con éxito!");
      setRestorePassword('');
      setRestoreFileContent('');
      setRestoreFileName('');
    } catch (err) {
      setErrorMsg(err.message || "Error al restaurar respaldo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="vault-card rounded-2xl w-full max-w-xl p-6 border border-slate-700 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Seguridad & Respaldos</h3>
              <p className="text-xs text-slate-400 font-mono">2FA TOTP, Bloqueo y Copias Cifradas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes */}
        {errorMsg && (
          <div className="my-2 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="my-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 py-3 pr-1 text-xs">
          {/* SECCIÓN 1: BLOQUEO AUTOMÁTICO */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <Clock className="w-4 h-4 text-amber-400" />
                Bloqueo Automático por Inactividad
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                2 minutos (Activo)
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              La aplicación bloquea el acceso y purga los datos de la memoria tras 2 minutos sin interacción para protegerte si dejas el teléfono apoyado.
            </p>
          </div>

          {/* SECCIÓN 2: SEGUNDO FACTOR TOTP */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Segundo Factor 2FA (TOTP)
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  totpConfig?.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {totpConfig?.enabled ? 'ACTIVADO' : 'DESACTIVADO'}
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Genera códigos temporales de 6 dígitos con Google Authenticator, Aegis o cualquier app TOTP sin requerir conexión a internet.
            </p>

            {!totpConfig?.enabled && !totpSetupData && (
              <button
                type="button"
                onClick={handleStartTotp}
                disabled={loading}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                Configurar 2FA con Código QR
              </button>
            )}

            {/* Modal / formulario de escaneo de QR */}
            {totpSetupData && (
              <form onSubmit={handleConfirmTotp} className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-3">
                <div className="text-center">
                  <p className="text-slate-300 font-semibold mb-2">
                    Escanea este código QR con Google Authenticator:
                  </p>
                  <div className="inline-block p-2 bg-white rounded-xl shadow-lg">
                    <img src={totpSetupData.qrDataUrl} alt="QR 2FA" className="w-44 h-44" />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 break-all select-all">
                    Clave manual: <strong className="text-white">{totpSetupData.secretBase32}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Ingresa el código de 6 dígitos para verificar y activar:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={totpTestCode}
                    onChange={(e) => setTotpTestCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-mono text-emerald-400 tracking-widest focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTotpSetupData(null)}
                    className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-lg"
                  >
                    Verificar y Activar 2FA
                  </button>
                </div>
              </form>
            )}

            {totpConfig?.enabled && (
              <div>
                {!showDisableTotp ? (
                  <button
                    type="button"
                    onClick={() => setShowDisableTotp(true)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Desactivar 2FA TOTP...
                  </button>
                ) : (
                  <form onSubmit={handleDisableTotp} className="space-y-2 p-3 bg-slate-900 rounded-xl border border-rose-500/30">
                    <label className="block text-[11px] text-rose-300">
                      Ingresa tu contraseña maestra para confirmar desactivación de 2FA:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={totpDisablePass}
                        onChange={(e) => setTotpDisablePass(e.target.value)}
                        placeholder="Contraseña maestra..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDisableTotp(false)}
                        className="px-2 py-1.5 bg-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN 3: EXPORTAR RESPALDO CIFRADO */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <Download className="w-4 h-4 text-teal-400" />
              Exportar Respaldo Cifrado (.vault)
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Genera un archivo cifrado con AES-256-GCM. Si cambias de celular o formateas, podrás restaurar todos tus datos completos.
            </p>

            <form onSubmit={handleExportBackup} className="space-y-2">
              <label className="block text-[11px] font-mono text-slate-300">
                Contraseña de Cifrado para el Respaldo:
              </label>
              <input
                type="password"
                placeholder="Contraseña para proteger este archivo..."
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar Respaldo Cifrado (.vault)
              </button>
            </form>
          </div>

          {/* SECCIÓN 4: RESTAURAR RESPALDO CIFRADO */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <Upload className="w-4 h-4 text-indigo-400" />
              Restaurar Copia de Seguridad Cifrada
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Selecciona tu archivo <code>.vault</code> e introduce la contraseña con la que lo creaste para reincorporar los movimientos.
            </p>

            <form onSubmit={handleImportBackup} className="space-y-2">
              <div>
                <input
                  type="file"
                  accept=".vault,.json"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                />
                {restoreFileName && (
                  <span className="text-[10px] text-teal-400 font-mono mt-1 block">
                    Archivo seleccionado: {restoreFileName}
                  </span>
                )}
              </div>

              <input
                type="password"
                placeholder="Contraseña del respaldo..."
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />

              <button
                type="submit"
                disabled={loading || !restoreFileContent}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Restaurar y Desencriptar Datos
              </button>
            </form>
          </div>
        </div>

        {/* Pie */}
        <div className="pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
