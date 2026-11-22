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
}
