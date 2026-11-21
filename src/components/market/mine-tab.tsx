'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Trash2, CircleDot, CheckCircle2, PauseCircle } from 'lucide-react'
import { formatCRCFull, formatRelativeTime, CATEGORY_ICONS, type Listing } from '@/lib/market'

export default function MineTab({
  session, onDelete, onStatusChange, onLogin,
}: any) {
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyListings = async () => {
    if (!session) {
      setMyListings([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/me/listings')
      if (res.ok) {
        const data = await res.json()
        setMyListings(data.listings || [])
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchMyListings() }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) {
    return (
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-[#0a3d2e] mb-2">Inicia sesión para ver tus anuncios</h2>
        <p className="text-sm text-[#0a3d2e]/70 mb-4">Necesitas una cuenta para administrar lo que publicaste.</p>
        <Button onClick={onLogin} className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl">
          Entrar
        </Button>
      </main>
    )
  }

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0a3d2e]">Mis anuncios</h2>
        <p className="text-sm text-[#0a3d2e]/60">
          {myListings.length} {myListings.length === 1 ? 'anuncio publicado' : 'anuncios publicados'} por ti
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-20 rounded-2xl" />))}
        </div>
      ) : myListings.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-[#0a3d2e] mb-2">Todavía no publicas nada</h3>
          <p className="text-sm text-[#0a3d2e]/70 mb-4">¡Comparte lo que quieres vender o comprar en Poás!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map((l: Listing) => (
            <Card key={l.id} className="p-3 border-[#0a3d2e]/10 rounded-2xl flex gap-3 items-center">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#fdf9ee] to-[#f5e8d0] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <span className="opacity-70">{CATEGORY_ICONS[l.category] ?? '📦'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={`border-0 text-[10px] px-2 py-0.5 rounded-full ${l.type === 'venta' ? 'bg-[#1a6b4a] text-white' : 'bg-[#c2185b] text-white'}`}>
                    {l.type === 'venta' ? 'Vendo' : 'Compro'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {l.status === 'activo' && <CircleDot className="h-2.5 w-2.5 mr-0.5" />}
                    {l.status === 'vendido' && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                    {l.status === 'pausado' && <PauseCircle className="h-2.5 w-2.5 mr-0.5" />}
                    {l.status}
                  </Badge>
                </div>
                <div className="font-semibold text-sm text-[#0a3d2e] line-clamp-1 mt-1">{l.title}</div>
                <div className="text-sm text-[#0a3d2e]/70 font-semibold">{formatCRCFull(l.price)}</div>
                <div className="text-[11px] text-[#0a3d2e]/50 mt-0.5">
                  <MapPin className="h-3 w-3 inline mr-0.5" />{l.location} · {formatRelativeTime(l.createdAt)}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Select value={l.status} onValueChange={(v) => onStatusChange(l.id, v)}>
                  <SelectTrigger className="h-8 text-xs w-28 rounded-lg border-[#0a3d2e]/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => onDelete(l.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
