/**
 * Evaluador matemático seguro para cálculos rápidos en montos (ej: 2.50 + 3.00 * 2)
 */
export function evaluateMathExpression(expr) {
  if (!expr || typeof expr !== 'string') return null;
  const clean = expr.trim();
  if (!clean) return null;

  // Solo permitir caracteres matemáticos seguros: números, puntos, espacios y operadores básicos
  if (!/^[0-9+\-*/. ()]+$/.test(clean)) return null;

  // Si no contiene operadores (+, -, *, /), verificar si es un número válido
  if (!/[+\-*/]/.test(clean)) {
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  try {
    // Al estar validado estrictamente por el regex anterior, es 100% seguro
    const fn = new Function(`"use strict"; return (${clean});`);
    const result = fn();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result * 100) / 100;
    }
  } catch {
    return null;
  }
  return null;
}
