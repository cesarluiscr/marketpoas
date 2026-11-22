'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Calendar, MapPin, Clock, Store, Phone, MessageCircle, AlertTriangle,
  Info, Megaphone, CheckCircle2, TrendingUp, Users, Tag, BarChart3,
  ExternalLink, BadgeCheck,
} from 'lucide-react'

type Event = {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string | null
  location: string | null
  address: string | null
  organizer: string | null
  category: string
  free: boolean
}

type Bulletin = {
  id: string
  title: string
  body: string
  type: string
  priority: string
  author: string
  createdAt: string
}

type Business = {
  id: string
  name: string
  description: string | null
  category: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  location: string | null
  verified: boolean
}

type Dashboard = {
  total: number
  totalActive: number
  ventas: number
  compras: number
  thisMonth: number
  activeUsers: number
  topCategories: { category: string; count: number }[]
  priceByCategory: { category: string; avgPrice: number; count: number }[]
  topDistricts: { district: string; count: number }[]
}

const EVENT_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  feria: { label: 'Feria', emoji: '🥬', color: 'bg-[#1a6b4a]/15 text-[#1a6b4a]' },
  tope: { label: 'Tope', emoji: '🐎', color: 'bg-[#d4a017]/15 text-[#d4a017]' },
  fiesta_civica: { label: 'Fiestas', emoji: '🎉', color: 'bg-[#c2185b]/15 text-[#c2185b]' },
  cultural: { label: 'Cultural', emoji: '🎵', color: 'bg-[#1e3a5f]/15 text-[#1e3a5f]' },
  deportivo: { label: 'Deportivo', emoji: '⚽', color: 'bg-[#1a6b4a]/15 text-[#1a6b4a]' },
  religioso: { label: 'Religioso', emoji: '⛪', color: 'bg-[#6f3d1d]/15 text-[#6f3d1d]' },
}

const BUSINESS_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  comercio: { label: 'Comercio', emoji: '🏪' },
  restaurante: { label: 'Restaurante', emoji: '🍽️' },
  servicios: { label: 'Servicios', emoji: '🔧' },
  feria: { label: 'Finca/Feria', emoji: '🥬' },
  taller: { label: 'Taller', emoji: '🛠️' },
}

const BULLETIN_TYPES: Record<string, { label: string; icon: any; color: string }> = {
  aviso: { label: 'Aviso', icon: Info, color: 'text-[#1a6b4a] bg-[#1a6b4a]/10' },
  alerta: { label: 'Alerta', icon: AlertTriangle, color: 'text-[#d4a017] bg-[#d4a017]/10' },
  cierre_via: { label: 'Cierre de vía', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  actividad: { label: 'Actividad', icon: Megaphone, color: 'text-[#1e3a5f] bg-[#1e3a5f]/10' },
  ayuda: { label: 'Ayuda social', icon: CheckCircle2, color: 'text-[#c2185b] bg-[#c2185b]/10' },
}

export default function CommunityTab() {
  const [events, setEvents] = useState<Event[]>([])
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'overview' | 'events' | 'bulletins' | 'businesses'>('overview')

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then((r) => r.ok ? r.json() : { events: [] }),
      fetch('/api/bulletins').then((r) => r.ok ? r.json() : { bulletins: [] }),
      fetch('/api/businesses').then((r) => r.ok ? r.json() : { businesses: [] }),
      fetch('/api/dashboard').then((r) => r.ok ? r.json() : null),
    ]).then(([e, b, biz, d]) => {
      setEvents(e.events || [])
      setBulletins(b.bulletins || [])
      setBusinesses(biz.businesses || [])
      setDashboard(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const sections = [
    { id: 'overview' as const, label: 'Dashboard', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'bulletins' as const, label: 'Tablón', icon: <Megaphone className="h-3.5 w-3.5" /> },
    { id: 'events' as const, label: 'Eventos', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'businesses' as const, label: 'Comercios', icon: <Store className="h-3.5 w-3.5" /> },
  ]

  if (loading) {
    return (
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </main>
    )
  }

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#0a3d2e]">Comunidad de Poás</h2>
        <p className="text-sm text-[#0a3d2e]/60">Eventos, comercios locales, avisos de la municipalidad y estadísticas del cantón</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 bg-[#0a3d2e]/5 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              section === s.id
                ? 'bg-white text-[#0a3d2e] shadow-sm'
                : 'text-[#0a3d2e]/60 hover:text-[#0a3d2e]'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {section === 'overview' && dashboard && (
        <div className="space-y-6">
          {/* Stats principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<TrendingUp className="h-5 w-5" />} value={dashboard.totalActive} label="Anuncios activos" color="forest" />
            <StatCard icon={<Users className="h-5 w-5" />} value={dashboard.activeUsers} label="Usuarios" color="gold" />
            <StatCard icon={<Tag className="h-5 w-5" />} value={dashboard.thisMonth} label="Nuevos este mes" color="strawberry" />
            <StatCard icon={<MapPin className="h-5 w-5" />} value={dashboard.topDistricts[0]?.count || 0} label={`Más activo: ${dashboard.topDistricts[0]?.district || '-'}`} color="forest" />
          </div>

          {/* Categorías populares */}
          <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
            <div className="text-sm font-semibold text-[#0a3d2e] mb-3 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#1a6b4a]" />
              Categorías más populares
            </div>
            <div className="space-y-2">
              {dashboard.topCategories.map((c) => {
                const max = dashboard.topCategories[0]?.count || 1
                const pct = (c.count / max) * 100
                return (
                  <div key={c.category} className="flex items-center gap-3">
                    <div className="text-xs font-medium text-[#0a3d2e] w-32 shrink-0">{c.category}</div>
                    <div className="flex-1 h-6 bg-[#0a3d2e]/5 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#0a3d2e] to-[#1a6b4a] rounded-lg transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-semibold text-[#0a3d2e]">
                        {c.count}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Precio promedio por categoría */}
          {dashboard.priceByCategory.length > 0 && (
            <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
              <div className="text-sm font-semibold text-[#0a3d2e] mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-[#d4a017]" />
                Precio promedio por categoría
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dashboard.priceByCategory.map((p) => (
                  <div key={p.category} className="bg-[#fdf9ee] rounded-xl p-3 border border-[#0a3d2e]/8">
                    <div className="text-xs text-[#0a3d2e]/60">{p.category}</div>
                    <div className="text-lg font-bold text-[#0a3d2e] mt-1">
                      ₡{p.avgPrice.toLocaleString('es-CR')}
                    </div>
                    <div className="text-[10px] text-[#0a3d2e]/50 mt-0.5">
                      Promedio de {p.count} anuncios
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Distritos */}
          {dashboard.topDistricts.length > 0 && (
            <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
              <div className="text-sm font-semibold text-[#0a3d2e] mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#c2185b]" />
                Anuncios por distrito
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {dashboard.topDistricts.map((d, i) => (
                  <div key={d.district} className="bg-[#fdf9ee] rounded-xl p-3 border border-[#0a3d2e]/8 text-center">
                    <div className="text-2xl font-bold text-[#0a3d2e]">{d.count}</div>
                    <div className="text-[11px] text-[#0a3d2e]/60">{d.district}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* BULLETINS (Tablón municipal) */}
      {section === 'bulletins' && (
        <div className="space-y-3">
          {bulletins.length === 0 ? (
            <div className="text-center py-12 text-[#0a3d2e]/60">
              <Megaphone className="h-12 w-12 mx-auto mb-2 opacity-30" />
              No hay avisos del tablón por ahora.
            </div>
          ) : (
            bulletins.map((b) => {
              const typeInfo = BULLETIN_TYPES[b.type] || BULLETIN_TYPES.aviso
              const Icon = typeInfo.icon
              const isUrgent = b.priority === 'urgente'
              return (
                <Card
                  key={b.id}
                  className={`p-4 rounded-2xl border-2 ${
                    isUrgent ? 'border-red-500/40 bg-red-50/30'
                    : b.priority === 'alta' ? 'border-[#d4a017]/40 bg-[#fdf9ee]'
                    : 'border-[#0a3d2e]/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={`text-[10px] px-2 py-0.5 rounded-full border-0 ${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                        {b.priority === 'urgente' && (
                          <Badge className="bg-red-600 text-white border-0 text-[10px] px-2 py-0.5 rounded-full">
                            URGENTE
                          </Badge>
                        )}
                        {b.priority === 'alta' && (
                          <Badge className="bg-[#d4a017] text-white border-0 text-[10px] px-2 py-0.5 rounded-full">
                            IMPORTANTE
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#0a3d2e] mb-1">{b.title}</h3>
                      <p className="text-sm text-[#0a3d2e]/80 whitespace-pre-line">{b.body}</p>
                      <div className="text-[10px] text-[#0a3d2e]/50 mt-2">
                        {b.author} · {new Date(b.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* EVENTS */}
      {section === 'events' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-12 text-[#0a3d2e]/60">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
              No hay eventos próximos.
            </div>
          ) : (
            events.map((e) => {
              const cat = EVENT_CATEGORIES[e.category] || { label: e.category, emoji: '📅', color: 'bg-[#0a3d2e]/10 text-[#0a3d2e]' }
              return (
                <Card key={e.id} className="p-4 rounded-2xl border-[#0a3d2e]/10">
                  <div className="flex gap-3">
                    <div className="text-3xl shrink-0">{cat.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={`text-[10px] px-2 py-0.5 rounded-full border-0 ${cat.color}`}>
                          {cat.label}
                        </Badge>
                        {e.free && (
                          <Badge className="bg-[#1a6b4a] text-white border-0 text-[10px] px-2 py-0.5 rounded-full">
                            Gratis
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#0a3d2e] mb-1">{e.title}</h3>
                      {e.description && <p className="text-sm text-[#0a3d2e]/80 mb-2">{e.description}</p>}
                      <div className="flex flex-wrap gap-3 text-xs text-[#0a3d2e]/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(e.date).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(e.date).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {e.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {e.address}
                          </div>
                        )}
                      </div>
                      {e.organizer && (
                        <div className="text-[10px] text-[#0a3d2e]/50 mt-1">Organiza: {e.organizer}</div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* BUSINESSES */}
      {section === 'businesses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {businesses.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-[#0a3d2e]/60">
              <Store className="h-12 w-12 mx-auto mb-2 opacity-30" />
              No hay comercios registrados todavía.
            </div>
          ) : (
            businesses.map((b) => {
              const cat = BUSINESS_CATEGORIES[b.category] || { label: b.category, emoji: '🏪' }
              return (
                <Card key={b.id} className="p-4 rounded-2xl border-[#0a3d2e]/10">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0a3d2e]/10 to-[#1a6b4a]/15 flex items-center justify-center text-2xl shrink-0">
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-semibold text-[#0a3d2e] truncate">{b.name}</h3>
                        {b.verified && (
                          <BadgeCheck className="h-4 w-4 text-[#1a6b4a] shrink-0" />
                        )}
                      </div>
                      <Badge className="bg-[#0a3d2e]/8 text-[#0a3d2e] border-0 text-[10px] px-2 py-0.5 rounded-full mb-2">
                        {cat.label}
                      </Badge>
                      {b.description && (
                        <p className="text-xs text-[#0a3d2e]/70 mb-2 line-clamp-2">{b.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-[#0a3d2e]/60">
                        {b.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{b.address}</span>
                          </div>
                        )}
                        {b.location && (
                          <div className="text-[#0a3d2e]/40">· {b.location}</div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {b.phone && (
                          <a href={`tel:${b.phone}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-[#0a3d2e]/15 text-[#0a3d2e] rounded-lg gap-1 px-2">
                              <Phone className="h-3 w-3" /> Llamar
                            </Button>
                          </a>
                        )}
                        {b.whatsapp && (
                          <a href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="h-7 text-xs bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg gap-1 px-2">
                              <MessageCircle className="h-3 w-3" /> WhatsApp
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}
    </main>
  )
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: 'forest' | 'gold' | 'strawberry' }) {
  const colors = {
    forest: 'bg-[#1a6b4a]/15 text-[#1a6b4a]',
    gold: 'bg-[#d4a017]/15 text-[#d4a017]',
    strawberry: 'bg-[#c2185b]/15 text-[#c2185b]',
  }
  return (
    <div className="bg-[#fdf9ee] rounded-2xl p-4 border border-[#0a3d2e]/8 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl ${colors[color]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-[#0a3d2e]">{value}</div>
        <div className="text-[10px] text-[#0a3d2e]/60 uppercase tracking-wide truncate">{label}</div>
      </div>
    </div>
  )
}
