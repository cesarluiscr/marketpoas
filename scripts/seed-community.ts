import { db } from '@/lib/db'

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'San Pedro': { lat: 10.0746, lng: -84.2336 },
  'San Juan': { lat: 10.0587, lng: -84.2167 },
  'San Rafael': { lat: 10.0420, lng: -84.2080 },
  'Carrillos': { lat: 10.0920, lng: -84.2510 },
  'Sabana Redonda': { lat: 10.1080, lng: -84.2230 },
}

// Eventos del cantón de Poás (próximos y recientes)
const events = [
  {
    title: 'Feria del Agricultor Poás',
    description: 'Productores locales ofrecen café, fresas, hortalizas, lácteos y artesanías. Cada sábado en la plaza de San Pedro.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    location: 'San Pedro',
    address: 'Plaza de Deportes de San Pedro',
    lat: DISTRICT_COORDS['San Pedro'].lat,
    lng: DISTRICT_COORDS['San Pedro'].lng,
    organizer: 'Municipalidad de Poás',
    category: 'feria',
    free: true,
  },
  {
    title: 'Tope Nacional Poás',
    description: 'Cabalgata tradicional que recorre las principales calles del cantón. Inicia en el parque central de San Pedro.',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    location: 'San Pedro',
    address: 'Parque Central de San Pedro',
    lat: DISTRICT_COORDS['San Pedro'].lat,
    lng: DISTRICT_COORDS['San Pedro'].lng,
    organizer: 'Comité de Cabalgatas Poás',
    category: 'tope',
    free: true,
  },
  {
    title: 'Fiestas Cívicas de Carrillos',
    description: 'Fiestas patronales con cimarronas, tope, comida típica y bailes. Habrá stands de vendimia para productores locales.',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
    location: 'Carrillos',
    address: 'Plaza de Carrillos',
    lat: DISTRICT_COORDS['Carrillos'].lat,
    lng: DISTRICT_COORDS['Carrillos'].lng,
    organizer: 'Comité de Fiestas de Carrillos',
    category: 'fiesta_civica',
    free: true,
  },
  {
    title: 'Concierto de la Banda Municipal',
    description: 'Presentación de la Banda Municipal de Poás en el kiosko del parque. Música popular y tradicionales costarricenses.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    location: 'San Pedro',
    address: 'Kiosko del Parque Central',
    lat: DISTRICT_COORDS['San Pedro'].lat,
    lng: DISTRICT_COORDS['San Pedro'].lng,
    organizer: 'Banda Municipal de Poás',
    category: 'cultural',
    free: true,
  },
  {
    title: 'Torneo de Fútbol Cantonal',
    description: 'Torneo relámpago entre los distritos del cantón. San Pedro vs San Juan vs Carrillos vs Sabana Redonda vs San Rafael.',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    location: 'Sabana Redonda',
    address: 'Plaza de Deportes de Sabana Redonda',
    lat: DISTRICT_COORDS['Sabana Redonda'].lat,
    lng: DISTRICT_COORDS['Sabana Redonda'].lng,
    organizer: 'Comité Deportivo Cantonal',
    category: 'deportivo',
    free: true,
  },
  {
    title: 'Procesión Virgen de los Ángeles',
    description: 'Procesión religiosa en honor a la Virgen de los Ángeles. Recorre las principales calles de San Pedro.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    location: 'San Pedro',
    address: 'Iglesia Católica de San Pedro',
    lat: DISTRICT_COORDS['San Pedro'].lat,
    lng: DISTRICT_COORDS['San Pedro'].lng,
    organizer: 'Parroquia de Poás',
    category: 'religioso',
    free: true,
  },
]

// Avisos del tablón municipal
const bulletins = [
  {
    title: 'Cierre de ruta por mantenimiento',
    body: 'La ruta 718 (San Pedro - Carrillos) estará cerrada el próximo sábado de 8am a 4pm por trabajos de mantenimiento. Use rutas alternas vía San Juan.',
    type: 'cierre_via',
    priority: 'alta',
    publishUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Alerta de temporada de lluvias',
    body: 'Se informa a los vecinos del cantón de Poás que se mantiene la alerta verde por lluvias fuertes. Manténganse atentos a comunicados oficiales.',
    type: 'alerta',
    priority: 'urgente',
    publishUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Reunión de la Asociación de Desarrollo',
    body: 'Invitamos a todos los vecinos de San Pedro a la reunión mensual de la Asociación de Desarrollo Integral. Este jueves 7pm en el Salón Comunal.',
    type: 'actividad',
    priority: 'normal',
    publishUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Programa de reciclaje cantonal',
    body: 'La Municipalidad inicia el programa de reciclaje. Se pueden entregar plásticos, cartón y vidrio los sábados en el Centro de Acopio de San Pedro, de 8am a 12pm.',
    type: 'aviso',
    priority: 'normal',
  },
  {
    title: 'Ayuda social para familias afectadas',
    body: 'La Cruz Roja de Poás coordina recolección de víveres para familias afectadas por recientes inundaciones. Llevar donaciones a sus oficinas en San Pedro.',
    type: 'ayuda',
    priority: 'alta',
    publishUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Horario de atención al cliente',
    body: 'Informamos que las oficinas municipales atenderán en horario corrido de lunes a viernes de 8am a 4pm. Sábados solo con cita previa.',
    type: 'aviso',
    priority: 'normal',
  },
]

// Comercios locales del cantón
const businesses = [
  {
    name: 'Pulpería La Esquina',
    description: 'Pulpería tradicional con productos básicos, snacks, y servicio de Sinpe Móvil. Atención de 6am a 9pm todos los días.',
    category: 'comercio',
    address: '200m este del parque, San Pedro',
    phone: '2448-1234',
    whatsapp: '50687451234',
    location: 'San Pedro',
    lat: DISTRICT_COORDS['San Pedro'].lat + 0.001,
    lng: DISTRICT_COORDS['San Pedro'].lng - 0.001,
    verified: true,
  },
  {
    name: 'Café Don Poás',
    description: 'Beneficio y tostador de café local. Venta de café en grano, molido y bolsas para regalo. Tours del café con cita previa.',
    category: 'comercio',
    address: 'Carretera a Sabana Redonda, km 3',
    phone: '2448-5678',
    whatsapp: '50685435678',
    email: 'ventas@cafedonpoas.cr',
    location: 'Sabana Redonda',
    lat: DISTRICT_COORDS['Sabana Redonda'].lat,
    lng: DISTRICT_COORDS['Sabana Redonda'].lng - 0.005,
    verified: true,
  },
  {
    name: 'Soda La Tica',
    description: 'Comida típica costarricense: casados, gallina pintada, olla de carne, frescos naturales. Ambiente familiar.',
    category: 'restaurante',
    address: 'Frente al parque de San Pedro',
    phone: '2448-9123',
    whatsapp: '50687459123',
    location: 'San Pedro',
    lat: DISTRICT_COORDS['San Pedro'].lat - 0.002,
    lng: DISTRICT_COORDS['San Pedro'].lng + 0.001,
    verified: true,
  },
  {
    name: 'Fresas Poás Volcán',
    description: 'Finca productora de fresas. Venta directa al público en la finca (recogidas el mismo día). Tours para familias y grupos.',
    category: 'feria',
    address: 'Vía al Volcán Poás, km 5',
    phone: '2448-7777',
    whatsapp: '50687457777',
    location: 'Sabana Redonda',
    lat: DISTRICT_COORDS['Sabana Redonda'].lat + 0.003,
    lng: DISTRICT_COORDS['Sabana Redonda'].lng + 0.002,
    verified: false,
  },
  {
    name: 'Taller Mecánico El Tico',
    description: 'Servicio de mecánica general para motos y autos. Mecánico con 20 años de experiencia en el cantón.',
    category: 'taller',
    address: 'Carrillos, frente a la plaza de deportes',
    phone: '2448-4567',
    whatsapp: '50687454567',
    location: 'Carrillos',
    lat: DISTRICT_COORDS['Carrillos'].lat,
    lng: DISTRICT_COORDS['Carrillos'].lng + 0.002,
    verified: true,
  },
  {
    name: 'Veterinaria Cantón Poás',
    description: 'Servicios veterinarios para mascotas y animales de granja. Consultas, vacunas, cirugías, emergencias.',
    category: 'servicios',
    address: 'San Rafael, 200m sur de la iglesia',
    phone: '2448-3344',
    whatsapp: '50687453344',
    location: 'San Rafael',
    lat: DISTRICT_COORDS['San Rafael'].lat,
    lng: DISTRICT_COORDS['San Rafael'].lng - 0.001,
    verified: true,
  },
  {
    name: 'Mini Super Carrillos',
    description: 'Supermercado con amplia variedad de productos, carnes, verduras, lácteos. Cajero automático y Sinpe.',
    category: 'comercio',
    address: 'Centro de Carrillos',
    phone: '2448-2255',
    whatsapp: '50687452255',
    location: 'Carrillos',
    lat: DISTRICT_COORDS['Carrillos'].lat - 0.002,
    lng: DISTRICT_COORDS['Carrillos'].lng - 0.001,
    verified: false,
  },
]

async function main() {
  console.log('Seeding community data...')

  // Limpiar tablas
  await db.event.deleteMany({})
  await db.bulletin.deleteMany({})
  await db.business.deleteMany({})

  // Insertar eventos
  for (const e of events) {
    await db.event.create({ data: e })
  }
  console.log(`Seeded ${events.length} events.`)

  // Insertar bulletins
  for (const b of bulletins) {
    await db.bulletin.create({ data: b })
  }
  console.log(`Seeded ${bulletins.length} bulletins.`)

  // Insertar businesses
  for (const biz of businesses) {
    await db.business.create({ data: biz })
  }
  console.log(`Seeded ${businesses.length} businesses.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
