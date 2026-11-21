'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DISTRICT_COORDS } from '@/lib/poas'
import type { Listing } from '@/lib/market'
import PoasMap from '@/components/poas-map'

type MapMarker = {
  id: string
  lat: number
  lng: number
  title: string
  price: number
  type: 'venta' | 'compra'
  category: string
}

export default function MapTab({
  listings,
  onCardClick,
  hasActiveFilters,
  clearFilters,
}: {
  listings: Listing[]
  onCardClick: (l: Listing) => void
  hasActiveFilters: boolean
  clearFilters: () => void
}) {
  const markers: MapMarker[] = useMemo(() => listings.map((l) => ({
    id: l.id,
    lat: l.lat ?? DISTRICT_COORDS[l.location]?.lat ?? 10.0746,
    lng: l.lng ?? DISTRICT_COORDS[l.location]?.lng ?? -84.2336,
    title: l.title,
    price: l.price,
    type: l.type as 'venta' | 'compra',
    category: l.category,
  })), [listings])

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#0a3d2e]">Mapa del cantón de Poás</h2>
          <p className="text-sm text-[#0a3d2e]/60">{markers.length} anuncios geolocalizados por distrito</p>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#0a3d2e]">
            <X className="h-3.5 w-3.5 mr-1" /> Limpiar
          </Button>
        )}
      </div>
      <PoasMap
        markers={markers}
        onMarkerClick={(id) => {
          const l = listings.find((x) => x.id === id)
          if (l) onCardClick(l)
        }}
        className="h-[60vh] sm:h-[70vh] w-full"
      />
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#0a3d2e]/70">
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#1a6b4a]" /> Se vende</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#c2185b]" /> Se compra</div>
        <div className="text-[#0a3d2e]/50">Toca un marcador para ver el anuncio</div>
      </div>
    </main>
  )
}
