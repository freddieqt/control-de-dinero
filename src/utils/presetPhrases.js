// Normalizador inteligente: elimina tildes, mayúsculas y acentos
// Permite que "compre", "compré", "COMPRE" o "cómpree" coincidan siempre
export function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Las 15 categorías personalizadas solicitadas por el usuario
export const CUSTOM_CATEGORIES = [
  { id: 'algo_para_picar', label: 'Algo para picar', icon: 'Cookie' },
  { id: 'pasaje', label: 'Pasaje', icon: 'Bus' },
  { id: 'refrezcos', label: 'Refrezcos', icon: 'Coffee' },
  { id: 'comida', label: 'Comida', icon: 'Utensils' },
  { id: 'estudios_o_universidad', label: 'Estudios o universidad', icon: 'GraduationCap' },
  { id: 'trabajo', label: 'Trabajo', icon: 'Briefcase' },
  { id: 'juegos', label: 'Juegos', icon: 'Gamepad2' },
  { id: 'salidas', label: 'Salidas', icon: 'PartyPopper' },
  { id: 'compras_de_mercado', label: 'Compras de mercado', icon: 'ShoppingBag' },
  { id: 'objetos', label: 'Objetos', icon: 'Package' },
  { id: 'trago', label: 'Trago', icon: 'Wine' },
  { id: 'regalos', label: 'Regalos', icon: 'Gift' },
  { id: 'veterinaria', label: 'Veterinaria', icon: 'Dog' },
  { id: 'hospital', label: 'Hospital', icon: 'HeartPulse' },
  { id: 'apoyos', label: 'Apoyos', icon: 'HandHeart' }
];

// Frases iniciales adaptadas a las 15 categorías
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
    "Apoyo de dinero que preste o regale"
  ],
  ingreso: [
    "Pago de mi sueldo o quincena",
    "Cobro por trabajo realizado",
    "Dinero de apoyo que me dieron mis papas o familiar",
    "Propina que me regalaron",
    "Cobro de plata que me debian",
    "Venta de un objeto o producto",
    "Ganancia extra de trabajo",
    "Apoyo economico recibido"
  ]
};
