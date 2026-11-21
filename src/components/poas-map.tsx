'use client'

import { useEffect, useRef, useState } from 'react'

type MapMarker = {
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

// Cargar Leaflet desde CDN dinámicamente (evita ChunkLoadError del bundler)
let leafletPromise: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('server')
  if ((window as any).L) return Promise.resolve((window as any).L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    // CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      if ((window as any).L) resolve((window as any).L)
      else reject('Leaflet no cargó')
    }
    script.onerror = () => reject('No se pudo cargar Leaflet')
    document.head.appendChild(script)
  })

  return leafletPromise
}

// Hook para saber si estamos en cliente (evita hidratación)
function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    // Usar requestAnimationFrame para diferir el setState
    const raf = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(raf)
  }, [])
  return hydrated
}

export default function PoasMap({
  markers,
  onMarkerClick,
  center = [10.0746, -84.2336],
  zoom = 13,
  className = 'h-[400px] w-full',
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const hydrated = useHydrated()

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      const markersLayer = L.layerGroup().addTo(map)
      markersLayerRef.current = markersLayer
      mapInstanceRef.current = map

      // Renderizar marcadores inmediatamente después de crear el mapa
      renderMarkers(L, markersLayer)
    }).catch((err) => {
      console.error('Leaflet error:', err)
      setError('No se pudo cargar el mapa')
    })

    function renderMarkers(L: any, layer: any) {
      layer.clearLayers()
      const makeIcon = (type: 'venta' | 'compra') => {
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
    }

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersLayerRef.current = null
      }
    }
  }, [hydrated])

  // Re-render markers cuando cambian
  useEffect(() => {
    const L = (window as any).L
    if (!L || !mapInstanceRef.current || !markersLayerRef.current) return
    const layer = markersLayerRef.current
    layer.clearLayers()
    const makeIcon = (type: 'venta' | 'compra') => {
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

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#fdf9ee] text-[#0a3d2e]/70 text-sm rounded-2xl`}>
        {error}
      </div>
    )
  }

  // Placeholder antes de hidratar (evita mismatch)
  if (!hydrated) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#fdf9ee] text-[#0a3d2e]/50 text-sm rounded-2xl`}>
        Cargando mapa...
      </div>
    )
  }

  return <div ref={mapRef} className={className} style={{ borderRadius: '1rem', overflow: 'hidden' }} />
}

