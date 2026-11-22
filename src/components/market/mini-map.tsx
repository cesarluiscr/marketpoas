'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  lat: number
  lng: number
  label?: string
  className?: string
}

let leafletPromise: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('server')
  if ((window as any).L) return Promise.resolve((window as any).L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

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

function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(raf)
  }, [])
  return hydrated
}

export default function MiniMap({ lat, lng, label, className = 'h-40 w-full' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const hydrated = useHydrated()

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)

      // Marcador en forma de pin
      const icon = L.divIcon({
        className: 'mp-mini-marker',
        html: `
          <div style="
            background: #1a6b4a;
            width: 24px; height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="transform: rotate(45deg); color: white; font-size: 10px; font-weight: 700;">📍</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      })

      L.marker([lat, lng], { icon }).addTo(map).bindPopup(label || 'Ubicación del anuncio')

      mapInstanceRef.current = map
    }).catch((err) => {
      console.error('Leaflet error:', err)
      setError('No se pudo cargar el mapa')
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [hydrated, lat, lng, label])

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#fdf9ee] text-[#0a3d2e]/70 text-xs rounded-2xl`}>
        {error}
      </div>
    )
  }

  if (!hydrated) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#fdf9ee] text-[#0a3d2e]/50 text-xs rounded-2xl`}>
        Cargando mapa...
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ borderRadius: '1rem', overflow: 'hidden' }}
    />
  )
}
