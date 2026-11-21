// Coordenadas de los distritos del cantón de Poás
export const DISTRICT_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  'San Pedro': { lat: 10.0746, lng: -84.2336, label: 'San Pedro (cabecera)' },
  'San Juan': { lat: 10.0587, lng: -84.2167, label: 'San Juan' },
  'Carrizal': { lat: 10.0920, lng: -84.2510, label: 'Carrizal' },
  'Sabana Redonda': { lat: 10.1080, lng: -84.2230, label: 'Sabana Redonda' },
}

export const CANTON_CENTER = { lat: 10.0746, lng: -84.2336 }
export const CANTON_ZOOM = 13

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
