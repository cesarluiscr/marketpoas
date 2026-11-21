'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

export type MapMarker = {
  id: string
  lat: number
  lng: number
  title: string
  price: number
  type: 'venta' | 'compra'
  category: string
}

type Props = {
  markers: MapMarker[]
  onMarkerClick?: (id: string) => void
  center?: [number, number]
  zoom?: number
  className?: string
}

export default function PoasMap({
  markers,
  onMarkerClick,
  center = [10.0746, -84.2336],
  zoom = 13,
  className = 'h-[400px] w-full',
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    })

    // Tile layer OpenStreetMap standard (no requiere API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    markersLayerRef.current = L.layerGroup().addTo(map)
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markersLayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return
    const layer = markersLayerRef.current
    layer.clearLayers()

    // Icono personalizado
    const makeIcon = (type: 'venta' | 'compra') => {
      const color = type === 'venta' ? '#1a6b4a' : '#c2185b'
      const bgColor = type === 'venta' ? '#1a6b4a' : '#c2185b'
      return L.divIcon({
        className: 'mp-marker',
        html: `
          <div style="
            background: ${bgColor};
            width: 28px; height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 12px;
              font-weight: 700;
            ">${type === 'venta' ? 'V' : 'C'}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      })
    }

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: makeIcon(m.type) })
      const priceStr =
        m.price >= 1_000_000
          ? `₡${(m.price / 1_000_000).toFixed(1)}M`
          : m.price >= 1000
          ? `₡${(m.price / 1000).toFixed(0)}K`
          : `₡${m.price}`
      marker.bindPopup(
        `<div style="font-family: system-ui; padding: 4px; max-width: 200px;">
          <div style="font-weight: 700; color: #0a3d2e; font-size: 13px; line-height: 1.2;">${m.title}</div>
          <div style="color: #1a6b4a; font-weight: 700; font-size: 14px; margin-top: 2px;">${priceStr}</div>
          <div style="color: #666; font-size: 11px; margin-top: 2px;">${m.category}</div>
        </div>`
      )
      marker.on('click', () => onMarkerClick?.(m.id))
      layer.addLayer(marker)
    })
  }, [markers, onMarkerClick])

  return <div ref={mapRef} className={className} style={{ borderRadius: '1rem', overflow: 'hidden' }} />
}
