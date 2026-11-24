'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  X,
  Filter,
  Sparkles,
  Coffee,
  MapPin,
  Plus,
  Heart,
  LocateFixed,
  Bookmark,
} from 'lucide-react'
import {
  CATEGORIES,
  LOCATIONS,
  formatCRC,
  formatRelativeTime,
  CATEGORY_ICONS,
  type Listing,
} from '@/lib/market'

export default function HomeTab(props: any) {
  const {
    listings, loading, stats,
    searchQuery, typeFilter, setTypeFilter,
    categoryFilter, setCategoryFilter,
    hasActiveFilters, clearFilters, onCardClick, onPublish,
    session, favoriteIds, onToggleFavorite,
    onNearMe,
  } = props

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [nearMeLoading, setNearMeLoading] = useState(false)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a3d2e] via-[#1a6b4a] to-[#2d8a6a] text-white">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
            <circle cx="950" cy="80" r="40" fill="#d4a017" opacity="0.7" />
            <circle cx="950" cy="80" r="60" fill="#d4a017" opacity="0.15" />
            <path d="M0 400 L200 250 L400 320 L600 220 L800 280 L1000 200 L1200 280 L1200 400 Z" fill="#062920" opacity="0.4" />
            <path d="M0 400 L300 180 L500 280 L600 230 L900 140 L1200 280 L1200 400 Z" fill="#062920" opacity="0.6" />
            <path d="M350 400 L700 80 L1050 400 Z" fill="#062920" opacity="0.85" />
            <ellipse cx="700" cy="100" rx="35" ry="8" fill="#1e3a5f" />
          </svg>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-20 bg-gradient-to-b from-white/0 via-white/10 to-white/0 animate-drift" />
          <div className="absolute top-2/3 left-0 w-full h-16 bg-gradient-to-b from-white/0 via-white/8 to-white/0 animate-drift-slow" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium text-white/90 mb-3 border border-white/20">
                <Sparkles className="h-3 w-3" /> Marketplace del cantón de Poás
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
                Compra y Venta<br />
                <span className="bg-gradient-to-r from-[#d4a017] via-[#f0c75e] to-[#d4a017] bg-clip-text text-transparent">en Poás</span>{' '}
                🌋
              </h1>
            </div>
            <div className="flex gap-3 shrink-0">
              <HeroStat icon={<TrendingUp className="h-5 w-5" />} value={stats.venta} label="Se vende" accent="gold" />
              <HeroStat icon={<TrendingDown className="h-5 w-5" />} value={stats.compra} label="Se compra" accent="strawberry" />
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute bottom-0 w-full h-8 fill-[#fdf9ee]" />
      </section>

      {/* Franja de categorías (móvil) - fondo claro y sombra para que se aprecien */}
      <section className="lg:hidden bg-[#fdf9ee] border-b border-[#0a3d2e]/8 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <CategoryChip active={categoryFilter === 'todas'} onClick={() => setCategoryFilter('todas')} label="Todas" icon="🌋" />
          {CATEGORIES.map((c: string) => (
            <CategoryChip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c === categoryFilter ? 'todas' : c)} label={c} icon={CATEGORY_ICONS[c]} />
          ))}
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
        {/* Toolbar mobile */}
        <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <Button size="sm" variant={typeFilter === 'todas' ? 'default' : 'outline'} onClick={() => setTypeFilter('todas')} className={`rounded-full shrink-0 h-9 px-4 ${typeFilter === 'todas' ? 'bg-[#0a3d2e] hover:bg-[#062920] text-white border-[#0a3d2e]' : 'border-[#0a3d2e]/15 text-[#0a3d2e] bg-white'}`}>Todas</Button>
          <Button size="sm" variant={typeFilter === 'venta' ? 'default' : 'outline'} onClick={() => setTypeFilter(typeFilter === 'venta' ? 'todas' : 'venta')} className={`rounded-full shrink-0 h-9 px-4 gap-1.5 ${typeFilter === 'venta' ? 'bg-[#1a6b4a] hover:bg-[#0a3d2e] text-white border-[#1a6b4a]' : 'border-[#0a3d2e]/15 text-[#0a3d2e] bg-white'}`}>
            <TrendingUp className="h-3.5 w-3.5" /> Vender
          </Button>
          <Button size="sm" variant={typeFilter === 'compra' ? 'default' : 'outline'} onClick={() => setTypeFilter(typeFilter === 'compra' ? 'todas' : 'compra')} className={`rounded-full shrink-0 h-9 px-4 gap-1.5 ${typeFilter === 'compra' ? 'bg-[#c2185b] hover:bg-[#9c1247] text-white border-[#c2185b]' : 'border-[#0a3d2e]/15 text-[#0a3d2e] bg-white'}`}>
            <TrendingDown className="h-3.5 w-3.5" /> Comprar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFiltersOpen(true)} className="shrink-0 h-9 border-[#0a3d2e]/15 text-[#0a3d2e] bg-white rounded-full">
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Filtros desktop */}
        <div className="hidden lg:flex flex-wrap items-center gap-2 mb-4">
          <div className="flex bg-white rounded-xl p-1 border border-[#0a3d2e]/12 shadow-sm">
            <FilterChip active={typeFilter === 'todas'} onClick={() => setTypeFilter('todas')} label={`Todas ${stats.total}`} />
            <FilterChip active={typeFilter === 'venta'} onClick={() => setTypeFilter('venta')} label="Vender" icon={<TrendingUp className="h-3.5 w-3.5" />} activeColor="forest" />
            <FilterChip active={typeFilter === 'compra'} onClick={() => setTypeFilter('compra')} label="Comprar" icon={<TrendingDown className="h-3.5 w-3.5" />} activeColor="strawberry" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[150px] border-[#0a3d2e]/15 bg-white text-sm rounded-xl">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {c}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={props.locationFilter} onValueChange={props.setLocationFilter}>
            <SelectTrigger className="h-9 w-auto min-w-[140px] border-[#0a3d2e]/15 bg-white text-sm rounded-xl">
              <SelectValue placeholder="Distrito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todo el cantón</SelectItem>
              {LOCATIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={props.sortBy} onValueChange={(v) => props.setSortBy(v)}>
            <SelectTrigger className="h-9 w-auto min-w-[140px] border-[#0a3d2e]/15 bg-white text-sm rounded-xl">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="price_asc">Precio: menor primero</SelectItem>
              <SelectItem value="price_desc">Precio: mayor primero</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNearMeLoading(true)
              onNearMe?.(() => setNearMeLoading(false))
            }}
            disabled={nearMeLoading}
            className="h-9 border-[#1a6b4a]/30 text-[#1a6b4a] hover:bg-[#1a6b4a]/5 rounded-xl gap-1.5"
            title="Ver anuncios cerca de tu ubicación"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {nearMeLoading ? 'Buscando...' : 'Cerca de mí'}
          </Button>
          {hasActiveFilters && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={props.onSaveSearch}
                disabled={!props.onSaveSearch}
                className="h-9 border-[#1a6b4a]/30 text-[#1a6b4a] hover:bg-[#1a6b4a]/5 rounded-xl gap-1.5"
                title="Guardar esta búsqueda y recibir alertas"
              >
                <Bookmark className="h-3.5 w-3.5" /> Guardar búsqueda
              </Button>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#0a3d2e]/70 hover:text-[#0a3d2e] hover:bg-[#0a3d2e]/5 h-9">
                <X className="h-3.5 w-3.5 mr-1" /> Limpiar
              </Button>
            </>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="aspect-[4/5] rounded-2xl" />))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} onPublish={onPublish} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-[#0a3d2e]/70">
                <span className="font-semibold text-[#0a3d2e]">{listings.length}</span> {listings.length === 1 ? 'anuncio' : 'anuncios'}
                {hasActiveFilters && ' · filtrado'}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#0a3d2e]/50">
                <Coffee className="h-3.5 w-3.5" /> <span>Hecho en Poás</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {listings.map((l: Listing, idx: number) => (<ListingCard key={l.id} listing={l} onClick={() => onCardClick(l)} index={idx} favorited={favoriteIds?.includes(l.id)} onToggleFavorite={onToggleFavorite} session={session} />))}
            </div>
          </>
        )}
      </main>

      {/* Filtros mobile sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-[#0a3d2e]">Filtros</SheetTitle>
            <SheetDescription className="text-[#0a3d2e]/70">Ajusta los filtros para encontrar lo que buscas en Poás.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Tipo</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant={typeFilter === 'todas' ? 'default' : 'outline'} onClick={() => setTypeFilter('todas')} className={`rounded-xl ${typeFilter === 'todas' ? 'bg-[#0a3d2e] hover:bg-[#062920]' : 'border-[#0a3d2e]/15 text-[#0a3d2e]'}`}>Todas</Button>
                <Button size="sm" variant={typeFilter === 'venta' ? 'default' : 'outline'} onClick={() => setTypeFilter('venta')} className={`rounded-xl ${typeFilter === 'venta' ? 'bg-[#1a6b4a] hover:bg-[#0a3d2e]' : 'border-[#0a3d2e]/15 text-[#0a3d2e]'}`}>Vender</Button>
                <Button size="sm" variant={typeFilter === 'compra' ? 'default' : 'outline'} onClick={() => setTypeFilter('compra')} className={`rounded-xl ${typeFilter === 'compra' ? 'bg-[#c2185b] hover:bg-[#9c1247]' : 'border-[#0a3d2e]/15 text-[#0a3d2e]'}`}>Comprar</Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl border-[#0a3d2e]/15"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Distrito</Label>
              <Select value={props.locationFilter} onValueChange={props.setLocationFilter}>
                <SelectTrigger className="rounded-xl border-[#0a3d2e]/15"><SelectValue placeholder="Todo el cantón" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todo el cantón</SelectItem>
                  {LOCATIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Ordenar por</Label>
              <Select value={props.sortBy} onValueChange={(v) => props.setSortBy(v)}>
                <SelectTrigger className="rounded-xl border-[#0a3d2e]/15"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="price_asc">Precio: menor primero</SelectItem>
                  <SelectItem value="price_desc">Precio: mayor primero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="w-full text-[#0a3d2e] hover:bg-[#0a3d2e]/5">
                <X className="h-4 w-4 mr-1" /> Limpiar filtros
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

import { useState } from 'react'

function HeroStat({ icon, value, label, accent }: { icon: React.ReactNode; value: number; label: string; accent: 'gold' | 'strawberry' }) {
  const accentBg = accent === 'gold' ? 'bg-[#d4a017]/20 text-[#f0c75e]' : 'bg-[#c2185b]/25 text-[#ec4899]'
  return (
    <div className="glass-dark rounded-2xl px-4 py-3 border border-white/15 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl ${accentBg} flex items-center justify-center`}>{icon}</div>
      <div className="leading-tight">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-[11px] text-white/70 font-medium uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label, icon, activeColor = 'forest' }: any) {
  const activeBg = activeColor === 'forest' ? 'bg-[#1a6b4a] text-white' : 'bg-[#c2185b] text-white'
  return (
    <button type="button" onClick={onClick} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${active ? `${activeBg} shadow-sm` : 'text-[#0a3d2e]/70 hover:text-[#0a3d2e] hover:bg-[#0a3d2e]/5'}`}>
      {icon}{label}
    </button>
  )
}

function CategoryChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1.5 shadow-md ${
        active
          ? 'bg-[#0a3d2e] text-white border-[#0a3d2e]'
          : 'bg-white text-[#0a3d2e] border-[#1a6b4a]/40 hover:border-[#1a6b4a] hover:bg-[#1a6b4a]/5'
      }`}
    >
      <span>{icon}</span>{label}
    </button>
  )
}

function ListingCard({ listing, onClick, index, favorited, onToggleFavorite, session }: any) {
  const isVenta = listing.type === 'venta'
  const isPromoted = listing.promoted && listing.promotedUntil && new Date(listing.promotedUntil) > new Date()
  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session) return
    onToggleFavorite?.(listing.id)
  }
  return (
    <Card onClick={onClick} className={`group overflow-hidden cursor-pointer hover:shadow-volcano-lg transition-all duration-300 border-[#0a3d2e]/10 p-0 gap-0 rounded-2xl hover:-translate-y-0.5 animate-fade-in-up bg-white ${isPromoted ? 'ring-2 ring-[#d4a017]/40' : ''}`} style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}>
      <div className="aspect-square bg-gradient-to-br from-[#fdf9ee] to-[#f5e8d0] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-5xl transition-opacity" data-fallback="true">
          <span className="opacity-70">{CATEGORY_ICONS[listing.category] ?? '📦'}</span>
        </div>
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.title} className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onLoad={(e) => { const t = e.target as HTMLImageElement; const fb = t.previousElementSibling as HTMLElement; if (fb) fb.style.opacity = '0' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
        <div className="absolute top-2.5 left-2.5">
          <Badge className={`border-0 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur ${isVenta ? 'bg-[#1a6b4a]/95 text-white hover:bg-[#1a6b4a]' : 'bg-[#c2185b]/95 text-white hover:bg-[#c2185b]'}`}>
            {isVenta ? 'Se vende' : 'Se compra'}
          </Badge>
        </div>
        {isPromoted && (
          <div className="absolute top-2.5 left-2.5 translate-y-7">
            <Badge className="bg-gradient-to-r from-[#d4a017] to-[#f0c75e] text-[#0a3d2e] border-0 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm">
              <Sparkles className="h-2.5 w-2.5 mr-0.5 inline" /> Destacado
            </Badge>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <div className="bg-white/90 backdrop-blur text-[#0a3d2e] px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shadow-sm">{listing.condition}</div>
        </div>
        {session && (
          <button
            onClick={handleFavClick}
            className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-[#c2185b] text-[#c2185b]' : 'text-[#0a3d2e]'}`} />
          </button>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <div className="font-semibold text-sm text-[#0a3d2e] line-clamp-2 leading-snug min-h-[2.5rem]">{listing.title}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold bg-gradient-to-r from-[#0a3d2e] to-[#1a6b4a] bg-clip-text text-transparent">{formatCRC(listing.price)}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#0a3d2e]/55 pt-0.5">
          <MapPin className="h-3 w-3 shrink-0 text-[#c2185b]/70" />
          <span className="truncate">{listing.location}</span>
          <span className="shrink-0 text-[#0a3d2e]/30">·</span>
          <span className="truncate">{formatRelativeTime(listing.createdAt)}</span>
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ hasFilters, onClear, onPublish }: { hasFilters: boolean; onClear: () => void; onPublish: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="relative inline-block mb-5">
        <div className="text-6xl">🌋</div>
        <div className="absolute -top-1 -right-1 text-2xl animate-pulse">✨</div>
      </div>
      <h3 className="text-xl font-bold text-[#0a3d2e] mb-2">
        {hasFilters ? 'No hay anuncios con esos filtros' : 'Todavía no hay anuncios'}
      </h3>
      <p className="text-sm text-[#0a3d2e]/70 mb-6 max-w-md mx-auto">
        {hasFilters ? 'Prueba con otros filtros o limpia para ver todos los anuncios del cantón.' : '¡Sé la primera persona en publicar algo en MarketPoás!'}
      </p>
      <div className="flex justify-center gap-2">
        {hasFilters && (
          <Button variant="outline" onClick={onClear} className="border-[#0a3d2e]/15 text-[#0a3d2e] rounded-xl">Limpiar filtros</Button>
        )}
        <Button onClick={onPublish} className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-1.5 rounded-xl shadow-volcano">
          <Plus className="h-4 w-4" /> Publicar anuncio
        </Button>
      </div>
    </div>
  )
}
