import React, { useEffect } from 'react';

/**
 * Componente 1 (Para el Login):
 * La imagen de Deadpool cómic con el Guantelete del Infinito dorado y sus gemas brillantes
 * sacando el dedo del medio y con animación viva en el guantelete y cuerpo.
 */
export function DeadpoolLoginMiddleFinger({ className = "w-52 h-60" }) {
  return (
    <div className={`relative select-none pointer-events-none mx-auto ${className}`}>
      {/* Resplandor dorado y rojo detrás de Deadpool y las Gemas del Infinito */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-rose-600/25 via-red-500/20 to-amber-400/35 blur-2xl animate-pulse" />

      {/* Contenedor animado del personaje */}
      <div className="relative w-full h-full animate-dpBodyAttitude">
        {/* Capa 1: Cuerpo de Deadpool apuntando al guantelete */}
        <img
          src="./deadpool-body.png"
          alt="Deadpool"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)]"
          draggable={false}
        />

        {/* Capa 2: Guantelete del Infinito Dorado con Gemas de colores sacando el dedo del medio */}
        <img
          src="./deadpool-gauntlet-mid.png"
          alt="Deadpool Guantelete"
          className="absolute inset-0 w-full h-full object-contain animate-dpMiddleFinger drop-shadow-[0_0_16px_rgba(251,191,36,0.55)]"
          draggable={false}
        />
      </div>
    </div>
  );
}

/**
 * Componente 2 (Al ingresar a la bóveda):
 * El Billete de Dólar de Deadpool (1ra imagen) con el Deadpool de la 3ra imagen (Salt Bae lanzando balas)
 * dentro del óvalo central, con animación 3D holográfica, efecto parallax y lluvia de balas/destellos dorados.
 */
export default function DeadpoolGreeting({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm cursor-pointer overflow-hidden animate-fadeIn"
      title="Toca en cualquier parte para continuar"
    >
      {/* Contenedor 3D del Billete de Dólar de Deadpool */}
      <div className="relative w-full max-w-[650px] select-none animate-dpDollarEnter">
        {/* Resplandor verde dólar, dorado y rojo carmesí detrás del billete */}
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-emerald-500/35 via-rose-600/45 to-amber-400/35 blur-3xl animate-pulse pointer-events-none" />

        {/* Billete flotando en 3D */}
        <div className="relative w-full aspect-[690/290] rounded-2xl overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.85)] border-2 border-emerald-400/50 animate-dpDollarFloat bg-[#eae5d5]">
          {/* 1. Imagen del Billete con el Deadpool de la 3ra imagen integrado en el óvalo central */}
          <img
            src="./deadpool-dollar.png"
            alt="Deadpool One Dollar Bill"
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* 2. Capa Parallax Viva: El Deadpool de la 3ra imagen en el centro moviéndose y lanzando balas doradas */}
          <div className="absolute left-1/2 top-[48%] w-[18.2%] h-[60%] rounded-full overflow-hidden pointer-events-none animate-dpSaltBae shadow-[0_0_25px_rgba(220,38,38,0.5)]">
            <img
              src="./deadpool-saltbae.png"
              alt="Deadpool Salt Bae"
              className="w-full h-full object-contain scale-105 drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
              draggable={false}
            />
          </div>

          {/* 3. Partículas animadas de balas doradas y destellos cayendo desde la mano de Deadpool en el centro del billete */}
          <div className="absolute left-[44%] top-[24%] w-[12%] h-[55%] pointer-events-none z-20">
            <span className="absolute left-[15%] top-0 w-1.5 h-3.5 rounded-full bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 shadow-[0_0_8px_#fbbf24] animate-dpBullet1" />
            <span className="absolute left-[38%] top-2 w-1.5 h-3.5 rounded-full bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 shadow-[0_0_8px_#fbbf24] animate-dpBullet2" />
            <span className="absolute left-[25%] top-4 w-1.5 h-3.5 rounded-full bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 shadow-[0_0_8px_#fbbf24] animate-dpBullet3" />
          </div>

          {/* 4. Barrido de brillo holográfico de billete nuevo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-dpShimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
