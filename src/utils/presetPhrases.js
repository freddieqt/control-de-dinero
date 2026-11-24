// Normalizador inteligente: elimina tildes, mayúsculas y acentos
// Permite que "compre", "compré", "COMPRE" coincidan siempre
export function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Categorías para SALIDA (Gastos)
export const EXPENSE_CATEGORIES = [
  'Algo para picar',
  'Pasaje',
  'Refrezcos',
  'Comida',
  'Estudios o universidad',
  'Trabajo',
  'Juegos',
  'Salidas',
  'Compras de mercado',
  'Objetos',
  'Trago',
  'Regalos',
  'Veterinaria',
  'Hospital',
  'Apoyos',
  'Préstamos'
];

// Categorías para INGRESO (Dinero que entra)
export const INCOME_CATEGORIES = [
  'Préstamos',
  'Propina',
  'Trabajo',
  'Universidad'
];

// Medios de pago / Cuentas para ambos (Ingreso y Salida)
export const PAYMENT_METHODS = [
  'Yape',
  'BCP',
  'SIP',
  'PLIN',
  'LEMON',
  'BBVA',
  'Efectivo'
];

// Frases predictivas iniciales
export const PRESET_PHRASES = {
  gasto: [
    "Compre un alfajor en la tienda",
    "Compre unas galletas y papitas",
    "Compre un snack para picar",
    "Pasaje de micro ida y vuelta",
    "Pasaje de taxi",
    "Compre una gaseosa bien helada",
    "Compre una botella de agua",
    "Compre un jugo o refresco",
    "Almuerzo menu del dia",
    "Desayuno en la mañana",
    "Cena en la noche",
    "Copias y libros de la universidad",
    "Pago de mensualidad o examen",
    "Materiales para el trabajo",
    "Compre un juego o recarga",
    "Salida con amigos el fin de semana",
    "Compras de verduras y comida en el mercado",
    "Compre un cargador o accesorio",
    "Compre ropa o zapatillas",
    "Salida a tomar un trago con amigos",
    "Compre una cerveza o botella",
    "Compre un regalo de cumpleaños",
    "Comida y atencion veterinaria de mi mascota",
    "Consulta medica y medicina en farmacia",
    "Apoyo de dinero que preste",
    "Pago de prestamo que me hicieron"
  ],
  ingreso: [
    "Pago de mi sueldo o quincena",
    "Cobro por trabajo realizado",
    "Propina que me dieron mis papas o familiar",
    "Dinero para la universidad que me dieron",
    "Prestamo de dinero que recibi",
    "Cobro de prestamo que me debian",
    "Apoyo economico recibido"
  ]
};
