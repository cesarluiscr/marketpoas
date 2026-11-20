'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/toaster'
import {
  Plus,
  Search,
  MapPin,
  Tag,
  Phone,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  X,
  Filter,
  Image as ImageIcon,
  Sparkles,
  Mountain,
  Coffee,
  Sprout,
} from 'lucide-react'
import {
  CATEGORIES,
  LOCATIONS,
  CONDITIONS,
  formatCRC,
  formatCRCFull,
  formatRelativeTime,
  CATEGORY_ICONS,
  type Listing,
} from '@/lib/market'

export default function Home() {
  const { toast } = useToast()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, venta: 0, compra: 0 })

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'todas' | 'venta' | 'compra'>('todas')
  const [categoryFilter, setCategoryFilter] = useState<string>('todas')
  const [locationFilter, setLocationFilter] = useState<string>('todas')
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Modales
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)

  // Form de publicación
  const [form, setForm] = useState({
    type: 'venta' as 'venta' | 'compra',
    title: '',
    description: '',
    price: '',
    category: 'Alimentos',
    condition: 'usado',
    location: 'San Pedro',
    imageUrl: '',
    contactName: '',
    contactPhone: '',
    contactWhatsapp: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'todas') params.set('type', typeFilter)
      if (categoryFilter !== 'todas') params.set('category', categoryFilter)
      if (locationFilter !== 'todas') params.set('location', locationFilter)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      params.set('sort', sortBy)
      const res = await fetch(`/api/listings?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setListings(data.listings)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error de red', description: 'No se pudieron cargar los anuncios', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [typeFilter, categoryFilter, locationFilter, searchQuery, sortBy, toast])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Registrar Service Worker (PWA)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Debounce para el search
  useEffect(() => {
    const t = setTimeout(() => fetchListings(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const hasActiveFilters = useMemo(
    () =>
      typeFilter !== 'todas' ||
      categoryFilter !== 'todas' ||
      locationFilter !== 'todas' ||
      searchQuery.trim() !== '',
    [typeFilter, categoryFilter, locationFilter, searchQuery]
  )

  const clearFilters = () => {
    setTypeFilter('todas')
    setCategoryFilter('todas')
    setLocationFilter('todas')
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          contactWhatsapp: form.contactWhatsapp || null,
          imageUrl: form.imageUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'No se pudo publicar', description: data.error, variant: 'destructive' })
        return
      }
      toast({ title: '¡Anuncio publicado!', description: 'Tu anuncio ya está visible en MarketPoás' })
      setPublishOpen(false)
      setForm({
        type: 'venta',
        title: '',
        description: '',
        price: '',
        category: 'Alimentos',
        condition: 'usado',
        location: 'San Pedro',
        imageUrl: '',
        contactName: '',
        contactPhone: '',
        contactWhatsapp: '',
      })
      fetchListings()
      fetchStats()
    } catch {
      toast({ title: 'Error de red', description: 'Intenta de nuevo', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9ee] pattern-coffee">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 w-full border-b border-[#0a3d2e]/10 glass">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          {/* Logo - Volcán Poás */}
          <button
            onClick={() => { clearFilters(); setSortBy('recent') }}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="MarketPoás inicio"
          >
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0a3d2e] via-[#1a6b4a] to-[#2d8a6a] flex items-center justify-center shadow-volcano overflow-hidden">
              <svg viewBox="0 0 40 40" className="h-full w-full p-1.5" fill="none">
                {/* Sol/nube */}
                <circle cx="29" cy="13" r="3.5" fill="#d4a017" opacity="0.85" />
                {/* Montaña izquierda */}
                <path d="M2 32 L12 18 L20 26 L26 22 L38 32 Z" fill="#fdf9ee" opacity="0.95" />
                {/* Volcán principal */}
                <path d="M10 32 L20 8 L30 32 Z" fill="#fdf9ee" />
                {/* Cráter */}
                <ellipse cx="20" cy="11" rx="4" ry="1.5" fill="#1e3a5f" />
                {/* Nieve cima */}
                <path d="M16 13 L20 8 L24 13 L22 14 L20 12.5 L18 14 Z" fill="#1e3a5f" />
                {/* Humo */}
                <path d="M19 8 Q18 6 20 5 Q22 6 21 8" stroke="#fdf9ee" strokeWidth="0.8" fill="none" opacity="0.7" />
              </svg>
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="font-bold text-lg tracking-tight text-[#0a3d2e]">
                Market<span className="text-[#1a6b4a]">Poás</span>
              </div>
              <div className="text-[10px] text-[#0a3d2e]/60 -mt-0.5 font-medium tracking-wide uppercase">
                Cantón de Poás · CR
              </div>
            </div>
          </button>

          {/* Buscador */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0a3d2e]/40 pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar café, fresas, bicicleta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 h-11 border-[#0a3d2e]/15 bg-white/70 focus-visible:ring-[#1a6b4a] focus-visible:border-[#1a6b4a] rounded-xl placeholder:text-[#0a3d2e]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#0a3d2e]/40 hover:text-[#0a3d2e] rounded-md hover:bg-[#0a3d2e]/5 transition-colors"
                aria-label="Borrar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtros (mobile) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden border-[#0a3d2e]/15 text-[#0a3d2e] h-11 w-11 rounded-xl bg-white/70 hover:bg-white"
            aria-label="Filtros"
          >
            <Filter className="h-5 w-5" />
          </Button>

          {/* Botón publicar */}
          <Button
            onClick={() => setPublishOpen(true)}
            className="shrink-0 bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-1.5 shadow-volcano rounded-xl h-11 px-4"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline font-semibold">Publicar</span>
          </Button>
        </div>

        {/* Filtros desktop */}
        <div className="hidden lg:block border-t border-[#0a3d2e]/8 bg-white/30">
          <div className="mx-auto max-w-6xl px-4 py-2.5 flex flex-wrap items-center gap-2">
            {/* Tipo - segmented control */}
            <div className="flex bg-white rounded-xl p-1 border border-[#0a3d2e]/12 shadow-sm">
              <FilterChip
                active={typeFilter === 'todas'}
                onClick={() => setTypeFilter('todas')}
                label={`Todas ${stats.total}`}
              />
              <FilterChip
                active={typeFilter === 'venta'}
                onClick={() => setTypeFilter('venta')}
                label="Vender"
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                activeColor="forest"
              />
              <FilterChip
                active={typeFilter === 'compra'}
                onClick={() => setTypeFilter('compra')}
                label="Comprar"
                icon={<TrendingDown className="h-3.5 w-3.5" />}
                activeColor="strawberry"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[150px] border-[#0a3d2e]/15 bg-white text-sm rounded-xl">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_ICONS[c]} {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] border-[#0a3d2e]/15 bg-white text-sm rounded-xl">
                <SelectValue placeholder="Distrito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todo el cantón</SelectItem>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] border-[#0a3d2e]/15 bg-white text-sm rounded-xl">
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="price_asc">Precio: menor primero</SelectItem>
                <SelectItem value="price_desc">Precio: mayor primero</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[#0a3d2e]/70 hover:text-[#0a3d2e] hover:bg-[#0a3d2e]/5 h-9 ml-auto"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ============ HERO - VOLCÁN POÁS ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a3d2e] via-[#1a6b4a] to-[#2d8a6a] text-white">
        {/* SVG Volcán de fondo */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
            {/* Sol */}
            <circle cx="950" cy="80" r="40" fill="#d4a017" opacity="0.7" />
            <circle cx="950" cy="80" r="60" fill="#d4a017" opacity="0.15" />
            {/* Montañas fondo */}
            <path d="M0 400 L200 250 L400 320 L600 220 L800 280 L1000 200 L1200 280 L1200 400 Z" fill="#062920" opacity="0.4" />
            {/* Volcán principal */}
            <path d="M0 400 L300 180 L500 280 L600 230 L900 140 L1200 280 L1200 400 Z" fill="#062920" opacity="0.6" />
            {/* Volcán frente */}
            <path d="M350 400 L700 80 L1050 400 Z" fill="#062920" opacity="0.85" />
            {/* Cráter */}
            <ellipse cx="700" cy="100" rx="35" ry="8" fill="#1e3a5f" />
            <ellipse cx="700" cy="100" rx="28" ry="5" fill="#2d4a7a" opacity="0.6" />
          </svg>
        </div>

        {/* Neblina animada */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-full h-20 bg-gradient-to-b from-white/0 via-white/10 to-white/0 animate-drift" />
          <div className="absolute top-2/3 left-0 w-full h-16 bg-gradient-to-b from-white/0 via-white/8 to-white/0 animate-drift-slow" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium text-white/90 mb-3 border border-white/20">
                <Sparkles className="h-3 w-3" />
                Marketplace del cantón de Poás
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
                Compra y vende<br />
                <span className="bg-gradient-to-r from-[#d4a017] via-[#f0c75e] to-[#d4a017] bg-clip-text text-transparent">
                  entre vecinos
                </span>{' '}
                de Poás 🌋
              </h1>
              <p className="text-sm sm:text-base text-white/80 mt-3 max-w-md">
                Café fresco, fresas, terrenos y mucho más, directo de San Pedro, San Juan, Carrizal y Sabana Redonda.
              </p>
            </div>

            {/* Stats glassmorphism */}
            <div className="flex gap-3 shrink-0">
              <HeroStat
                icon={<TrendingUp className="h-5 w-5" />}
                value={stats.venta}
                label="Se vende"
                accent="gold"
              />
              <HeroStat
                icon={<TrendingDown className="h-5 w-5" />}
                value={stats.compra}
                label="Se compra"
                accent="strawberry"
              />
            </div>
          </div>

          {/* Chips de categorías (mobile) */}
          <div className="lg:hidden mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            <CategoryChip
              active={categoryFilter === 'todas'}
              onClick={() => setCategoryFilter('todas')}
              label="Todas"
              icon="🌋"
            />
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                active={categoryFilter === c}
                onClick={() => setCategoryFilter(c === categoryFilter ? 'todas' : c)}
                label={c}
                icon={CATEGORY_ICONS[c]}
              />
            ))}
          </div>
        </div>

        {/* Curva inferior */}
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute bottom-0 w-full h-8 fill-[#fdf9ee]" />
      </section>

      {/* ============ MAIN ============ */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
        {/* Tipo filtros mobile */}
        <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <Button
            size="sm"
            variant={typeFilter === 'todas' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('todas')}
            className={`rounded-full shrink-0 h-9 px-4 ${
              typeFilter === 'todas'
                ? 'bg-[#0a3d2e] hover:bg-[#062920] text-white border-[#0a3d2e]'
                : 'border-[#0a3d2e]/15 text-[#0a3d2e] bg-white'
            }`}
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={typeFilter === 'venta' ? 'default' : 'outline'}
            onClick={() => setTypeFilter(typeFilter === 'venta' ? 'todas' : 'venta')}
            className={`rounded-full shrink-0 h-9 px-4 gap-1.5 ${
              typeFilter === 'venta'
                ? 'bg-[#1a6b4a] hover:bg-[#0a3d2e] text-white border-[#1a6b4a]'
                : 'border-[#0a3d2e]/15 text-[#0a3d2e] bg-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Vender
          </Button>
          <Button
            size="sm"
            variant={typeFilter === 'compra' ? 'default' : 'outline'}
            onClick={() => setTypeFilter(typeFilter === 'compra' ? 'todas' : 'compra')}
            className={`rounded-full shrink-0 h-9 px-4 gap-1.5 ${
              typeFilter === 'compra'
                ? 'bg-[#c2185b] hover:bg-[#9c1247] text-white border-[#c2185b]'
                : 'border-[#0a3d2e]/15 text-[#0a3d2e] bg-white'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" /> Comprar
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} onPublish={() => setPublishOpen(true)} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-[#0a3d2e]/70">
                <span className="font-semibold text-[#0a3d2e]">{listings.length}</span> {listings.length === 1 ? 'anuncio' : 'anuncios'}
                {hasActiveFilters && ' · filtrado'}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#0a3d2e]/50">
                <Coffee className="h-3.5 w-3.5" />
                <span>Hecho en Poás</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {listings.map((l, idx) => (
                <ListingCard key={l.id} listing={l} onClick={() => setSelectedListing(l)} index={idx} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ============ FAB (mobile) ============ */}
      <button
        onClick={() => setPublishOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] text-white shadow-volcano-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Publicar anuncio"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* ============ FOOTER ============ */}
      <footer className="mt-auto bg-gradient-to-b from-[#0a3d2e] to-[#062920] text-white/90 py-8 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Mountain className="h-5 w-5 text-[#d4a017]" />
              </div>
              <div>
                <div className="font-semibold text-white">MarketPoás</div>
                <div className="text-[11px] text-white/60">Cantón de Poás · Alajuela · Costa Rica</div>
              </div>
            </div>
            <div className="text-xs text-white/60 text-right">
              Instala la app: menú del navegador →<br />
              <strong className="text-white/90">«Agregar a pantalla de inicio»</strong>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-white/50">
            Hecho con ☕ y 🍓 para los vecinos del cantón de Poás
          </div>
        </div>
      </footer>

      {/* ============ DETALLE MODAL ============ */}
      <Dialog open={!!selectedListing} onOpenChange={(o) => !o && setSelectedListing(null)}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh] rounded-3xl border-[#0a3d2e]/15"
          aria-describedby={undefined}
        >
          {selectedListing && <ListingDetail listing={selectedListing} />}
        </DialogContent>
      </Dialog>

      {/* ============ FORMULARIO PUBLICAR ============ */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border-[#0a3d2e]/15"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-[#0a3d2e] flex items-center gap-2 text-xl">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              Publicar en MarketPoás
            </DialogTitle>
            <DialogDescription className="text-[#0a3d2e]/70">
              Comparte lo que quieres vender o lo que estás buscando comprar en Poás.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <Label className="text-sm font-semibold mb-2 block text-[#0a3d2e]">¿Qué quieres hacer?</Label>
              <div className="grid grid-cols-2 gap-2">
                <TypeButton
                  active={form.type === 'venta'}
                  onClick={() => setForm({ ...form, type: 'venta' })}
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Quiero VENDER"
                  sublabel="Tengo algo que ofrecer"
                  color="forest"
                />
                <TypeButton
                  active={form.type === 'compra'}
                  onClick={() => setForm({ ...form, type: 'compra' })}
                  icon={<TrendingDown className="h-5 w-5" />}
                  label="Quiero COMPRAR"
                  sublabel="Estoy buscando algo"
                  color="strawberry"
                />
              </div>
            </div>

            {/* Título */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-[#0a3d2e]">Título del anuncio *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={form.type === 'venta' ? 'Ej: Café fresco de Poás, 5 libras' : 'Ej: Compro gallinas ponedoras'}
                maxLength={80}
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                required
              />
              <div className="text-[11px] text-[#0a3d2e]/50 mt-1">{form.title.length}/80</div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-[#0a3d2e]">Descripción *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el producto, estado, ubicación, detalles importantes..."
                rows={4}
                maxLength={600}
                className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                required
              />
              <div className="text-[11px] text-[#0a3d2e]/50 mt-1">{form.description.length}/600</div>
            </div>

            {/* Precio + Categoría */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-[#0a3d2e]">Precio (colones) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="100"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#0a3d2e]">Categoría *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_ICONS[c]} {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condición + Distrito */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-[#0a3d2e]">Condición</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm({ ...form, condition: v })}
                >
                  <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-[#0a3d2e]">Distrito</Label>
                <Select
                  value={form.location}
                  onValueChange={(v) => setForm({ ...form, location: v })}
                >
                  <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* URL imagen */}
            <div>
              <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center gap-1 text-[#0a3d2e]">
                <ImageIcon className="h-3.5 w-3.5" /> URL de imagen (opcional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
              <p className="text-[11px] text-[#0a3d2e]/50 mt-1">
                Pega un enlace de imagen. Si dejas vacío, se mostrará un icono por categoría.
              </p>
            </div>

            {/* Contacto */}
            <div className="border-t border-[#0a3d2e]/10 pt-4 space-y-3">
              <div className="text-sm font-semibold text-[#0a3d2e]">Información de contacto</div>
              <div>
                <Label htmlFor="contactName" className="text-sm font-medium text-[#0a3d2e]">Tu nombre *</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Nombre completo"
                  maxLength={60}
                  className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contactPhone" className="text-sm font-medium text-[#0a3d2e]">Teléfono *</Label>
                  <Input
                    id="contactPhone"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="8888-8888"
                    maxLength={20}
                    className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactWhatsapp" className="text-sm font-medium text-[#0a3d2e]">WhatsApp (opcional)</Label>
                  <Input
                    id="contactWhatsapp"
                    value={form.contactWhatsapp}
                    onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                    placeholder="50688888888"
                    maxLength={20}
                    className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPublishOpen(false)}
                disabled={submitting}
                className="rounded-xl border-[#0a3d2e]/15 text-[#0a3d2e]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-1.5 rounded-xl shadow-volcano"
              >
                {submitting ? 'Publicando...' : 'Publicar anuncio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============ FILTROS MOBILE SHEET ============ */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-[#0a3d2e]">Filtros</SheetTitle>
            <SheetDescription className="text-[#0a3d2e]/70">
              Ajusta los filtros para encontrar lo que buscas en Poás.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Tipo</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={typeFilter === 'todas' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('todas')}
                  className={`rounded-xl ${typeFilter === 'todas' ? 'bg-[#0a3d2e] hover:bg-[#062920]' : 'border-[#0a3d2e]/15 text-[#0a3d2e]'}`}
                >
                  Todas
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'venta' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('venta')}
                  className={`rounded-xl ${typeFilter === 'venta' ? 'bg-[#1a6b4a] hover:bg-[#0a3d2e]' : 'border-[#0a3d2e]/15 text-[#0a3d2e]'}`}
                >
                  Vender
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'compra' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('compra')}
                  className={`rounded-xl ${typeFilter === 'compra' ? 'bg-[#c2185b] hover:bg-[#9c1247]' : 'border-[#0a3d2e]/15 text-[#0a3d2e]'}`}
                >
                  Comprar
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl border-[#0a3d2e]/15">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_ICONS[c]} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Distrito</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="rounded-xl border-[#0a3d2e]/15">
                  <SelectValue placeholder="Todo el cantón" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todo el cantón</SelectItem>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-[#0a3d2e]">Ordenar por</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="rounded-xl border-[#0a3d2e]/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="price_asc">Precio: menor primero</SelectItem>
                  <SelectItem value="price_desc">Precio: mayor primero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full text-[#0a3d2e] hover:bg-[#0a3d2e]/5"
              >
                <X className="h-4 w-4 mr-1" /> Limpiar filtros
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Toaster />
    </div>
  )
}

// === Subcomponentes ===

function FilterChip({
  active,
  onClick,
  label,
  icon,
  activeColor = 'forest',
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
  activeColor?: 'forest' | 'strawberry'
}) {
  const activeBg = activeColor === 'forest' ? 'bg-[#1a6b4a] text-white' : 'bg-[#c2185b] text-white'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
        active
          ? `${activeBg} shadow-sm`
          : 'text-[#0a3d2e]/70 hover:text-[#0a3d2e] hover:bg-[#0a3d2e]/5'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function CategoryChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 shadow-sm ${
        active
          ? 'bg-[#0a3d2e] text-white border-[#0a3d2e]'
          : 'bg-white/90 text-[#0a3d2e] border-[#0a3d2e]/12 hover:border-[#0a3d2e]/25'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

function HeroStat({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode
  value: number
  label: string
  accent: 'gold' | 'strawberry'
}) {
  const accentBg = accent === 'gold' ? 'bg-[#d4a017]/20 text-[#f0c75e]' : 'bg-[#c2185b]/25 text-[#ec4899]'
  return (
    <div className="glass-dark rounded-2xl px-4 py-3 border border-white/15 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl ${accentBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-[11px] text-white/70 font-medium uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}

function TypeButton({
  active,
  onClick,
  icon,
  label,
  sublabel,
  color,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  sublabel: string
  color: 'forest' | 'strawberry'
}) {
  const activeClasses = color === 'forest'
    ? 'border-[#1a6b4a] bg-[#1a6b4a]/5 text-[#0a3d2e]'
    : 'border-[#c2185b] bg-[#c2185b]/5 text-[#0a3d2e]'
  const iconColor = active
    ? (color === 'forest' ? 'text-[#1a6b4a]' : 'text-[#c2185b]')
    : 'text-[#0a3d2e]/40'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 p-3 rounded-2xl border-2 transition-all text-left ${
        active
          ? `${activeClasses} shadow-sm`
          : 'border-[#0a3d2e]/12 bg-white text-[#0a3d2e]/70 hover:border-[#0a3d2e]/25'
      }`}
    >
      <div className={iconColor}>{icon}</div>
      <div className="text-sm font-bold">{label}</div>
      <div className="text-[11px] opacity-70">{sublabel}</div>
    </button>
  )
}

function ListingCard({ listing, onClick, index }: { listing: Listing; onClick: () => void; index: number }) {
  const isVenta = listing.type === 'venta'
  return (
    <Card
      onClick={onClick}
      className="group overflow-hidden cursor-pointer hover:shadow-volcano-lg transition-all duration-300 border-[#0a3d2e]/10 p-0 gap-0 rounded-2xl hover:-translate-y-0.5 animate-fade-in-up bg-white"
      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
    >
      {/* Imagen */}
      <div className="aspect-square bg-gradient-to-br from-[#fdf9ee] to-[#f5e8d0] relative overflow-hidden">
        {/* Fallback emoji siempre visible de fondo, se oculta si la imagen carga */}
        <div
          className="absolute inset-0 flex items-center justify-center text-5xl transition-opacity"
          data-fallback="true"
        >
          <span className="opacity-70">{CATEGORY_ICONS[listing.category] ?? '📦'}</span>
        </div>

        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onLoad={(e) => {
              // Ocultar el fallback cuando la imagen carga OK
              const t = e.target as HTMLImageElement
              const fb = t.previousElementSibling as HTMLElement
              if (fb) fb.style.opacity = '0'
            }}
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
            }}
          />
        ) : null}

        {/* Gradiente inferior sutil */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />

        {/* Badge tipo */}
        <div className="absolute top-2.5 left-2.5">
          <Badge
            className={`border-0 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur ${
              isVenta
                ? 'bg-[#1a6b4a]/95 text-white hover:bg-[#1a6b4a]'
                : 'bg-[#c2185b]/95 text-white hover:bg-[#c2185b]'
            }`}
          >
            {isVenta ? 'Se vende' : 'Se compra'}
          </Badge>
        </div>

        {/* Badge condición */}
        <div className="absolute top-2.5 right-2.5">
          <div className="bg-white/90 backdrop-blur text-[#0a3d2e] px-2 py-0.5 rounded-full text-[10px] font-medium capitalize shadow-sm">
            {listing.condition}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="font-semibold text-sm text-[#0a3d2e] line-clamp-2 leading-snug min-h-[2.5rem]">
          {listing.title}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold bg-gradient-to-r from-[#0a3d2e] to-[#1a6b4a] bg-clip-text text-transparent">
            {formatCRC(listing.price)}
          </span>
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

function ListingDetail({ listing }: { listing: Listing }) {
  const isVenta = listing.type === 'venta'
  const [imgError, setImgError] = useState(false)

  const whatsappMsg = encodeURIComponent(
    `Hola ${listing.contactName}, vi tu anuncio "${listing.title}" en MarketPoás (${formatCRCFull(listing.price)}). ¿Sigue disponible?`
  )
  const whatsappLink = listing.contactWhatsapp
    ? `https://wa.me/${listing.contactWhatsapp}?text=${whatsappMsg}`
    : null

  return (
    <div className="overflow-y-auto max-h-[90vh] fancy-scroll">
      {/* Imagen */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[#fdf9ee] to-[#f5e8d0] relative">
        {/* Fallback emoji siempre visible */}
        <div className="absolute inset-0 flex items-center justify-center text-7xl transition-opacity">
          <span className="opacity-60">{CATEGORY_ICONS[listing.category] ?? '📦'}</span>
        </div>
        {listing.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="relative w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : null}
        <div className="absolute top-3 left-3">
          <Badge
            className={`border-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur ${
              isVenta
                ? 'bg-[#1a6b4a]/95 text-white hover:bg-[#1a6b4a]'
                : 'bg-[#c2185b]/95 text-white hover:bg-[#c2185b]'
            }`}
          >
            {isVenta ? 'Se vende' : 'Se compra'}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#0a3d2e] leading-snug">{listing.title}</h2>
          <div className="text-3xl font-bold bg-gradient-to-r from-[#0a3d2e] to-[#1a6b4a] bg-clip-text text-transparent mt-1.5">
            {formatCRCFull(listing.price)}
            <span className="text-sm font-normal text-[#0a3d2e]/50 ml-1.5">colones</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] gap-1 rounded-full px-3 py-1">
            <Tag className="h-3 w-3" />
            {listing.category}
          </Badge>
          <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] gap-1 rounded-full px-3 py-1">
            <MapPin className="h-3 w-3 text-[#c2185b]" />
            {listing.location}
          </Badge>
          <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] capitalize rounded-full px-3 py-1">
            {listing.condition}
          </Badge>
        </div>

        <div>
          <div className="text-sm font-semibold text-[#0a3d2e] mb-1.5">Descripción</div>
          <p className="text-sm text-[#0a3d2e]/80 whitespace-pre-line leading-relaxed">{listing.description}</p>
        </div>

        <div className="text-[11px] text-[#0a3d2e]/50">
          Publicado {formatRelativeTime(listing.createdAt)}
        </div>

        {/* Contacto */}
        <div className="border-t border-[#0a3d2e]/10 pt-4 space-y-3">
          <div className="text-sm font-semibold text-[#0a3d2e]">Contacto</div>
          <div className="flex items-center gap-2.5 text-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a6b4a] to-[#0a3d2e] text-white flex items-center justify-center font-semibold shadow-sm">
              {listing.contactName.charAt(0).toUpperCase()}
            </div>
            <div className="font-medium text-[#0a3d2e]">{listing.contactName}</div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <a href={`tel:${listing.contactPhone}`}>
              <Button
                variant="outline"
                className="w-full border-[#0a3d2e]/15 text-[#0a3d2e] hover:bg-[#0a3d2e]/5 gap-2 rounded-xl h-11"
              >
                <Phone className="h-4 w-4" />
                Llamar: {listing.contactPhone}
              </Button>
            </a>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-2 rounded-xl h-11 shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-[#0a3d2e]/50 bg-[#fdf9ee] rounded-xl p-2.5 mt-2">
            <Sprout className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1a6b4a]" />
            <span>Reúnete en lugares públicos y verifica el producto antes de pagar. Cuídate entre vecinos.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  hasFilters,
  onClear,
  onPublish,
}: {
  hasFilters: boolean
  onClear: () => void
  onPublish: () => void
}) {
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
        {hasFilters
          ? 'Prueba con otros filtros o limpia para ver todos los anuncios del cantón.'
          : '¡Sé la primera persona en publicar algo en MarketPoás!'}
      </p>
      <div className="flex justify-center gap-2">
        {hasFilters && (
          <Button variant="outline" onClick={onClear} className="border-[#0a3d2e]/15 text-[#0a3d2e] rounded-xl">
            Limpiar filtros
          </Button>
        )}
        <Button
          onClick={onPublish}
          className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-1.5 rounded-xl shadow-volcano"
        >
          <Plus className="h-4 w-4" /> Publicar anuncio
        </Button>
      </div>
    </div>
  )
}
