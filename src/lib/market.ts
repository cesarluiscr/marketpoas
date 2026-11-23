// Helpers compartidos de MarketPoás

export const CATEGORIES = [
  'Alimentos',
  'Vehículos',
  'Muebles',
  'Animales',
  'Herramientas',
  'Hogar',
  'Jardín',
  'Electrodomésticos',
  'Inmuebles',
  'Servicios',
  'Tecnología',
  'Ropa',
  'Otros',
] as const

export const LOCATIONS = [
  'San Pedro',
  'San Juan',
  'San Rafael',
  'Carrillos',
  'Sabana Redonda',
] as const

export const CONDITIONS = ['nuevo', 'seminuevo', 'usado'] as const

export function formatCRC(amount: number): string {
  if (amount === 0) return '₡0'
  // Formato compacto para números grandes (miles y millones)
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    return `₡${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `₡${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`
  }
  return `₡${amount.toLocaleString('es-CR')}`
}

export function formatCRCFull(amount: number): string {
  return `₡${amount.toLocaleString('es-CR')}`
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24) return `hace ${hours} h`
  if (days < 7) return `hace ${days} ${days === 1 ? 'día' : 'días'}`
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`
  return `hace ${Math.floor(days / 365)} años`
}

export const CATEGORY_ICONS: Record<string, string> = {
  'Alimentos': '🍞',
  'Vehículos': '🚲',
  'Muebles': '🪑',
  'Animales': '🐔',
  'Herramientas': '🔧',
  'Hogar': '🏠',
  'Jardín': '🪴',
  'Electrodomésticos': '🔌',
  'Inmuebles': '🗺️',
  'Servicios': '🎓',
  'Tecnología': '💻',
  'Ropa': '👕',
  'Otros': '📦',
}

export type Listing = {
  id: string
  type: 'venta' | 'compra'
  title: string
  description: string
  price: number
  currency: string
  category: string
  condition: string
  location: string
  imageUrl: string | null
  contactName: string
  contactPhone: string
  contactWhatsapp: string | null
  status: string
  createdAt: string
  updatedAt: string
  lat?: number | null
  lng?: number | null
  userId?: string | null
  views?: number
  promoted?: boolean
  promotedUntil?: string | null
  // Negociación e intercambio
  negotiable?: boolean
  exchangeFor?: string | null
  previousPrice?: number | null
  // Campos meta por categoría
  metaKm?: number | null
  metaYear?: number | null
  metaBrand?: string | null
  metaModel?: string | null
  metaAreaM2?: number | null
  metaBedrooms?: number | null
  metaBathrooms?: number | null
  metaSize?: string | null
  metaWeight?: string | null
  metaCapacity?: string | null
}

// Definición de campos personalizados por categoría
export type CategoryField = {
  key: string
  label: string
  type: 'text' | 'number' | 'select'
  placeholder?: string
  options?: string[]
  unit?: string
}

export const CATEGORY_FIELDS: Record<string, CategoryField[]> = {
  'Vehículos': [
    { key: 'metaBrand', label: 'Marca', type: 'text', placeholder: 'Ej: Toyota, Suzuki' },
    { key: 'metaModel', label: 'Modelo', type: 'text', placeholder: 'Ej: Hilux, Swift' },
    { key: 'metaYear', label: 'Año', type: 'number', placeholder: '2020' },
    { key: 'metaKm', label: 'Kilometraje', type: 'number', placeholder: '50000', unit: 'km' },
  ],
  'Tecnología': [
    { key: 'metaBrand', label: 'Marca', type: 'text', placeholder: 'Ej: Apple, Samsung' },
    { key: 'metaModel', label: 'Modelo', type: 'text', placeholder: 'Ej: iPhone 13, Galaxy S22' },
    { key: 'metaSize', label: 'Tamaño/Almacenamiento', type: 'text', placeholder: 'Ej: 128GB, 15 pulgadas' },
  ],
  'Inmuebles': [
    { key: 'metaAreaM2', label: 'Área', type: 'number', placeholder: '200', unit: 'm²' },
    { key: 'metaBedrooms', label: 'Habitaciones', type: 'number', placeholder: '3' },
    { key: 'metaBathrooms', label: 'Baños', type: 'number', placeholder: '2' },
  ],
  'Ropa': [
    { key: 'metaSize', label: 'Talla', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'] },
    { key: 'metaBrand', label: 'Marca', type: 'text', placeholder: 'Ej: Nike, Adidas' },
  ],
  'Alimentos': [
    { key: 'metaWeight', label: 'Peso/Cantidad', type: 'text', placeholder: 'Ej: 5 libras, 1 litro' },
  ],
  'Electrodomésticos': [
    { key: 'metaBrand', label: 'Marca', type: 'text', placeholder: 'Ej: LG, Samsung' },
    { key: 'metaCapacity', label: 'Capacidad', type: 'text', placeholder: 'Ej: 12 pies cúbicos' },
  ],
  'Herramientas': [
    { key: 'metaBrand', label: 'Marca', type: 'text', placeholder: 'Ej: Bosch, Makita' },
    { key: 'metaModel', label: 'Modelo', type: 'text', placeholder: 'Ej: Taladro 18V' },
  ],
  'Animales': [
    { key: 'metaSize', label: 'Edad/Tamaño', type: 'text', placeholder: 'Ej: 6 meses, adulto' },
  ],
}
/* Force redeploy Mon Nov 23 22:12:37 UTC 2026 */
