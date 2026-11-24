// Catálogo inteligente de frases predictivas para autocompletado rápido
// Cubre Gastos (comida, transporte, servicios, compras, salud, diversión) e Ingresos (sueldos, propinas, ventas, pagos)

export const PRESET_PHRASES = {
  gasto: [
    // Comida y Antojos
    "Compré un alfajor en la tienda",
    "Compré gaseosa y galletas en la bodega",
    "Almuerzo menú del día",
    "Desayuno café con pan",
    "Cena rápida de noche",
    "Compras del mercado y verduras",
    "Supermercado compras de la semana",
    "Delivery de comida rápida",
    "Compré golosinas y snacks",
    "Compré panadería y pasteles",
    "Helado y postres",
    "Agua mineral embotellada",

    // Transporte
    "Pasaje de bus / combi / micro",
    "Taxi / Uber / InDrive",
    "Recarga de tarjeta de metro o tren",
    "Gasolina para el vehículo",
    "Estacionamiento / cochera",

    // Servicios del Hogar
    "Pago de recibo de luz",
    "Pago de recibo de agua",
    "Pago de internet fibra / wifi",
    "Recarga de saldo y datos para el celular",
    "Pago del gas",
    "Mantenimiento o alquiler del hogar",

    // Compras Personales y Hogar
    "Artículos de limpieza para la casa",
    "Compré ropa o calzado",
    "Corte de cabello / peluquería",
    "Medicamentos en la farmacia",
    "Consulta médica o dentista",
    "Accesorios de tecnología / cargador",

    // Diversión y Ocio
    "Salida con amigos o pareja",
    "Entradas de cine y palomitas",
    "Suscripción mensual de streaming",
    "Juegos o entretenimiento digital",

    // Educación y Trabajo
    "Libros, cuadernos y útiles de escritorio",
    "Pago de mensualidad de curso o estudio",
    "Impresiones y fotocopias",

    // Otros
    "Préstamo de dinero a familiar o amigo",
    "Imprevisto o emergencia personal",
    "Propina o donación voluntaria"
  ],
  ingreso: [
    // Trabajo y Salarios
    "Pago de sueldo mensual / quincena",
    "Cobro por trabajo independiente / freelance",
    "Horas extras trabajadas",
    "Comisión o bono por metas",

    // Apoyo y Regalos
    "Dinero que me dieron mis padres / familiar",
    "Propina familiar que me regalaron",
    "Regalo de cumpleaños en efectivo",

    // Ventas y Cobros
    "Cobro de dinero que me debían",
    "Venta de artículo usado por marketplace",
    "Venta de productos o mercadería",
    "Devolución o reembolso de compra",

    // Inversiones y Otros
    "Ganancia por intereses o ahorros",
    "Premio o sorteo ganado",
    "Ingreso extra inesperado"
  ]
};

// Categorías con iconos y colores para organización rápida
export const CATEGORIES = {
  gasto: [
    { id: 'comida', label: 'Comida & Antojos', icon: 'Utensils', color: 'emerald' },
    { id: 'transporte', label: 'Transporte', icon: 'Car', color: 'cyan' },
    { id: 'servicios', label: 'Servicios', icon: 'Zap', color: 'amber' },
    { id: 'compras', label: 'Compras & Hogar', icon: 'ShoppingBag', color: 'purple' },
    { id: 'salud', label: 'Salud & Cuidado', icon: 'HeartPulse', color: 'rose' },
    { id: 'ocio', label: 'Ocio & Salidas', icon: 'Film', color: 'indigo' },
    { id: 'educacion', label: 'Estudio & Trabajo', icon: 'GraduationCap', color: 'blue' },
    { id: 'otros', label: 'Otros Gastos', icon: 'HelpCircle', color: 'slate' }
  ],
  ingreso: [
    { id: 'sueldo', label: 'Sueldo & Salario', icon: 'Briefcase', color: 'emerald' },
    { id: 'freelance', label: 'Trabajo Extra', icon: 'Laptop', color: 'blue' },
    { id: 'regalo', label: 'Dinero Recibido / Propina', icon: 'Gift', color: 'amber' },
    { id: 'cobro', label: 'Cobro de Deuda', icon: 'ReceiptCheck', color: 'cyan' },
    { id: 'venta', label: 'Venta de Bienes', icon: 'Tag', color: 'purple' },
    { id: 'otros', label: 'Otros Ingresos', icon: 'Coins', color: 'slate' }
  ]
};
