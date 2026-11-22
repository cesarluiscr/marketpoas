'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin, Trash2, CircleDot, CheckCircle2, PauseCircle,
  RefreshCw, Sparkles, TrendingDown, Eye,
} from 'lucide-react'
import { formatCRCFull, formatRelativeTime, CATEGORY_ICONS, type Listing } from '@/lib/market'

type Offer = {
  id: string
  amount: number
  message: string | null
  status: string
  createdAt: string
  fromUser: { id: string; name: string | null }
  listing: { id: string; title: string }
}

export default function MineTab({
  session, onDelete, onStatusChange, onLogin,
}: any) {
  const { toast } = useToast()
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [offers, setOffers] = useState<Offer[]>([])

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

  const fetchOffers = async () => {
    if (!session) return
    try {
      const res = await fetch('/api/offers')
      if (res.ok) {
        const data = await res.json()
        setOffers(data.offers || [])
      }
    } catch {}
  }

  useEffect(() => {
    fetchMyListings()
    fetchOffers()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRenew = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}/renew`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Anuncio renovado', description: 'Aparecerá primero en la lista' })
        fetchMyListings()
      }
    } catch {}
  }

  const handlePromote = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}/promote`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Anuncio destacado', description: 'Aparecerá destacado por 7 días' })
        fetchMyListings()
      }
    } catch {}
  }

  const handleOfferAction = async (offerId: string, status: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({
          title: status === 'aceptada' ? 'Oferta aceptada' : 'Oferta rechazada',
        })
        fetchOffers()
      }
    } catch {}
  }

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

  const receivedOffers = offers.filter((o) => o.status === 'pendiente')

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0a3d2e]">Mis anuncios</h2>
        <p className="text-sm text-[#0a3d2e]/60">
          {myListings.length} {myListings.length === 1 ? 'anuncio publicado' : 'anuncios publicados'} por ti
          {receivedOffers.length > 0 && (
            <span className="ml-2 text-[#c2185b] font-semibold">· {receivedOffers.length} ofertas sin responder</span>
          )}
        </p>
      </div>

      {/* Ofertas recibidas pendientes */}
      {receivedOffers.length > 0 && (
        <Card className="p-4 mb-6 border-[#d4a017]/40 rounded-2xl bg-gradient-to-br from-[#fdf9ee] to-[#fffaeb]">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-[#d4a017]/15 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-[#d4a017]" />
            </div>
            <div className="font-bold text-[#0a3d2e]">Ofertas recibidas</div>
            <Badge className="bg-[#c2185b] text-white border-0 text-[10px] ml-auto">{receivedOffers.length}</Badge>
          </div>
          <div className="space-y-2">
            {receivedOffers.map((o) => (
              <div key={o.id} className="bg-white rounded-xl p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-[#0a3d2e]">{o.fromUser.name}</div>
                  <div className="text-[10px] text-[#0a3d2e]/50 ml-auto">{formatRelativeTime(o.createdAt)}</div>
                </div>
                <div className="text-xs text-[#0a3d2e]/70 mb-1">
                  <span className="font-medium">{o.listing.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-[#c2185b]">
                    ₡{o.amount.toLocaleString('es-CR')}
                  </div>
                  {o.message && (
                    <div className="text-xs text-[#0a3d2e]/60 italic flex-1">&quot;{o.message}&quot;</div>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleOfferAction(o.id, 'aceptada')}
                    className="bg-[#1a6b4a] hover:bg-[#0a3d2e] text-white rounded-lg h-8 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOfferAction(o.id, 'rechazada')}
                    className="border-[#0a3d2e]/15 text-[#0a3d2e] hover:bg-[#0a3d2e]/5 rounded-lg h-8 text-xs"
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de anuncios */}
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
            <Card key={l.id} className="p-3 border-[#0a3d2e]/10 rounded-2xl">
              <div className="flex gap-3 items-start">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#fdf9ee] to-[#f5e8d0] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span className="opacity-70">{CATEGORY_ICONS[l.category] ?? '📦'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`border-0 text-[10px] px-2 py-0.5 rounded-full ${l.type === 'venta' ? 'bg-[#1a6b4a] text-white' : 'bg-[#c2185b] text-white'}`}>
                      {l.type === 'venta' ? 'Vendo' : 'Compro'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full capitalize">
                      {l.status === 'activo' && <CircleDot className="h-2.5 w-2.5 mr-0.5" />}
                      {l.status === 'vendido' && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                      {l.status === 'pausado' && <PauseCircle className="h-2.5 w-2.5 mr-0.5" />}
                      {l.status}
                    </Badge>
                    {l.promoted && l.promotedUntil && new Date(l.promotedUntil) > new Date() && (
                      <Badge className="bg-gradient-to-r from-[#d4a017] to-[#f0c75e] text-[#0a3d2e] border-0 text-[10px] px-2 py-0.5 rounded-full">
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Destacado
                      </Badge>
                    )}
                    {(l.views ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#0a3d2e]/50">
                        <Eye className="h-2.5 w-2.5" /> {l.views}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-sm text-[#0a3d2e] line-clamp-1 mt-1">{l.title}</div>
                  <div className="text-sm text-[#0a3d2e]/70 font-semibold">{formatCRCFull(l.price)}</div>
                  <div className="text-[11px] text-[#0a3d2e]/50 mt-0.5">
                    <MapPin className="h-3 w-3 inline mr-0.5" />{l.location} · {formatRelativeTime(l.createdAt)}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#0a3d2e]/8">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRenew(l.id)}
                  className="border-[#0a3d2e]/15 text-[#0a3d2e] hover:bg-[#0a3d2e]/5 h-8 text-xs rounded-lg"
                  title="Mover al principio de la lista"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renovar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromote(l.id)}
                  className="border-[#d4a017]/40 text-[#0a3d2e] hover:bg-[#d4a017]/10 h-8 text-xs rounded-lg"
                  title="Destacar por 7 días"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Destacar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(l.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs ml-auto"
                >
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
