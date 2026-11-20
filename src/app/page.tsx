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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  ShoppingBag,
  X,
  Filter,
  Image as ImageIcon,
  ChevronDown,
  Mountain,
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/30 via-white to-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <button
            onClick={() => { clearFilters(); setSortBy('recent') }}
            className="flex items-center gap-2 shrink-0"
            aria-label="MarketPoás inicio"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-sm">
              <Mountain className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="font-bold text-lg text-emerald-900">MarketPoás</div>
              <div className="text-[11px] text-emerald-700 -mt-0.5">Compra y vende en Poás</div>
            </div>
          </button>

          {/* Buscador */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-700/60 pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar café, bicicleta, terreno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 h-10 border-emerald-200 focus-visible:ring-emerald-500 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-emerald-700/60 hover:text-emerald-900"
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
            className="lg:hidden border-emerald-200 text-emerald-800"
            aria-label="Filtros"
          >
            <Filter className="h-5 w-5" />
          </Button>

          {/* Botón publicar */}
          <Button
            onClick={() => setPublishOpen(true)}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Publicar</span>
          </Button>
        </div>

        {/* Filtros desktop */}
        <div className="hidden lg:block border-t border-emerald-100/60 bg-white/40">
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center gap-2">
            {/* Tipo */}
            <div className="flex bg-emerald-50 rounded-lg p-0.5 border border-emerald-100">
              <FilterChip
                active={typeFilter === 'todas'}
                onClick={() => setTypeFilter('todas')}
                label={`Todas (${stats.total})`}
              />
              <FilterChip
                active={typeFilter === 'venta'}
                onClick={() => setTypeFilter('venta')}
                label="Vender"
                icon={<TrendingUp className="h-3.5 w-3.5" />}
              />
              <FilterChip
                active={typeFilter === 'compra'}
                onClick={() => setTypeFilter('compra')}
                label="Comprar"
                icon={<TrendingDown className="h-3.5 w-3.5" />}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px] border-emerald-200 bg-white text-sm">
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
              <SelectTrigger className="h-9 w-auto min-w-[130px] border-emerald-200 bg-white text-sm">
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
              <SelectTrigger className="h-9 w-auto min-w-[130px] border-emerald-200 bg-white text-sm">
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
                className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 h-9"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Limpiar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-emerald-100/70 to-white border-b border-emerald-100/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 leading-tight">
                El marketplace del cantón de Poás 🇨🇷
              </h1>
              <p className="text-sm sm:text-base text-emerald-700 mt-1">
                Compra y vende entre vecinos de San Pedro, San Juan, Carrizal y Sabana Redonda.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Se vende" value={stats.venta} color="emerald" />
              <StatCard icon={<TrendingDown className="h-4 w-4" />} label="Se compra" value={stats.compra} color="amber" />
            </div>
          </div>

          {/* Chips de categorías (mobile) */}
          <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            <CategoryChip
              active={categoryFilter === 'todas'}
              onClick={() => setCategoryFilter('todas')}
              label="Todas"
              icon="🏠"
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
      </section>

      {/* MAIN */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
        {/* Toolbar de tipo (mobile) */}
        <div className="lg:hidden flex gap-2 mb-4">
          <Button
            size="sm"
            variant={typeFilter === 'todas' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('todas')}
            className={typeFilter === 'todas' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-200 text-emerald-800'}
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={typeFilter === 'venta' ? 'default' : 'outline'}
            onClick={() => setTypeFilter(typeFilter === 'venta' ? 'todas' : 'venta')}
            className={typeFilter === 'venta' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-200 text-emerald-800'}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Vender
          </Button>
          <Button
            size="sm"
            variant={typeFilter === 'compra' ? 'default' : 'outline'}
            onClick={() => setTypeFilter(typeFilter === 'compra' ? 'todas' : 'compra')}
            className={typeFilter === 'compra' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-emerald-200 text-emerald-800'}
          >
            <TrendingDown className="h-3.5 w-3.5 mr-1" /> Comprar
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} onPublish={() => setPublishOpen(true)} />
        ) : (
          <>
            <div className="text-sm text-emerald-700 mb-3">
              {listings.length} {listings.length === 1 ? 'anuncio' : 'anuncios'} encontrados
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} onClick={() => setSelectedListing(l)} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto bg-emerald-900 text-emerald-50 py-6 px-4">
        <div className="mx-auto max-w-6xl text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout className="h-4 w-4" />
            <span className="font-semibold">MarketPoás</span>
          </div>
          <p className="text-emerald-200/80 text-xs">
            Hecho con cariño para los vecinos de Poás, Alajuela, Costa Rica.
            <br className="sm:hidden" /> Instala esta app en tu celular: abre el menú del navegador y toca <strong>«Agregar a pantalla de inicio»</strong>.
          </p>
        </div>
      </footer>

      {/* DETALLE MODAL */}
      <Dialog open={!!selectedListing} onOpenChange={(o) => !o && setSelectedListing(null)}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh]"
          aria-describedby={undefined}
        >
          {selectedListing && <ListingDetail listing={selectedListing} />}
        </DialogContent>
      </Dialog>

      {/* FORMULARIO PUBLICAR */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-emerald-900 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Publicar en MarketPoás
            </DialogTitle>
            <DialogDescription>
              Comparte lo que quieres vender o lo que estás buscando comprar en Poás.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <Label className="text-sm font-medium mb-2 block">¿Qué quieres hacer?</Label>
              <div className="grid grid-cols-2 gap-2">
                <TypeButton
                  active={form.type === 'venta'}
                  onClick={() => setForm({ ...form, type: 'venta' })}
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Quiero VENDER"
                  sublabel="Tengo algo que ofrecer"
                  color="emerald"
                />
                <TypeButton
                  active={form.type === 'compra'}
                  onClick={() => setForm({ ...form, type: 'compra' })}
                  icon={<TrendingDown className="h-5 w-5" />}
                  label="Quiero COMPRAR"
                  sublabel="Estoy buscando algo"
                  color="amber"
                />
              </div>
            </div>

            {/* Título */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Título del anuncio *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={form.type === 'venta' ? 'Ej: Café fresco de Poás, 5 libras' : 'Ej: Compro gallinas ponedoras'}
                maxLength={80}
                className="mt-1"
                required
              />
              <div className="text-[11px] text-emerald-700/60 mt-1">{form.title.length}/80</div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Descripción *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe el producto, estado, ubicación, detalles importantes..."
                rows={4}
                maxLength={600}
                className="mt-1 resize-none"
                required
              />
              <div className="text-[11px] text-emerald-700/60 mt-1">{form.description.length}/600</div>
            </div>

            {/* Precio + Categoría */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price" className="text-sm font-medium">Precio (colones) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="100"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Categoría *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="mt-1">
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
                <Label className="text-sm font-medium">Condición</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm({ ...form, condition: v })}
                >
                  <SelectTrigger className="mt-1">
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
                <Label className="text-sm font-medium">Distrito</Label>
                <Select
                  value={form.location}
                  onValueChange={(v) => setForm({ ...form, location: v })}
                >
                  <SelectTrigger className="mt-1">
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
              <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" /> URL de imagen (opcional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
              <p className="text-[11px] text-emerald-700/60 mt-1">
                Pega un enlace de imagen. Si dejas vacío, se mostrará un icono por categoría.
              </p>
            </div>

            {/* Contacto */}
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-semibold text-emerald-900">Información de contacto</div>
              <div>
                <Label htmlFor="contactName" className="text-sm font-medium">Tu nombre *</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Nombre completo"
                  maxLength={60}
                  className="mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contactPhone" className="text-sm font-medium">Teléfono *</Label>
                  <Input
                    id="contactPhone"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="8888-8888"
                    maxLength={20}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactWhatsapp" className="text-sm font-medium">WhatsApp (opcional)</Label>
                  <Input
                    id="contactWhatsapp"
                    value={form.contactWhatsapp}
                    onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                    placeholder="50688888888"
                    maxLength={20}
                    className="mt-1"
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
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                {submitting ? 'Publicando...' : 'Publicar anuncio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FILTROS MOBILE SHEET */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Ajusta los filtros para encontrar lo que buscas en Poás.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={typeFilter === 'todas' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('todas')}
                  className={typeFilter === 'todas' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Todas
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'venta' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('venta')}
                  className={typeFilter === 'venta' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Vender
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'compra' ? 'default' : 'outline'}
                  onClick={() => setTypeFilter('compra')}
                  className={typeFilter === 'compra' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  Comprar
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
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
              <Label className="text-sm font-medium mb-2 block">Distrito</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
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
              <Label className="text-sm font-medium mb-2 block">Ordenar por</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
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
                className="w-full text-emerald-700"
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
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
        active
          ? 'bg-white text-emerald-700 shadow-sm'
          : 'text-emerald-700/70 hover:text-emerald-900'
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
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
        active
          ? 'bg-emerald-600 text-white border-emerald-600'
          : 'bg-white text-emerald-800 border-emerald-200'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'emerald' | 'amber'
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
      color === 'emerald' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
    }`}>
      <div className={color === 'emerald' ? 'text-emerald-700' : 'text-amber-700'}>{icon}</div>
      <div className="leading-tight">
        <div className={`text-lg font-bold ${color === 'emerald' ? 'text-emerald-900' : 'text-amber-900'}`}>
          {value}
        </div>
        <div className="text-[11px] text-emerald-700/80">{label}</div>
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
  color: 'emerald' | 'amber'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left ${
        active
          ? color === 'emerald'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
            : 'border-amber-500 bg-amber-50 text-amber-900'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className={active ? (color === 'emerald' ? 'text-emerald-600' : 'text-amber-600') : 'text-gray-400'}>
        {icon}
      </div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-[11px] opacity-70">{sublabel}</div>
    </button>
  )
}

function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const isVenta = listing.type === 'venta'
  return (
    <Card
      onClick={onClick}
      className="group overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-emerald-100 p-0 gap-0"
    >
      {/* Imagen */}
      <div className="aspect-square bg-emerald-50 relative overflow-hidden">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
              const fb = t.nextElementSibling as HTMLElement
              if (fb) fb.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-5xl ${listing.imageUrl ? 'hidden' : 'flex'}`}
        >
          {CATEGORY_ICONS[listing.category] ?? '📦'}
        </div>
        {/* Badge tipo */}
        <div className="absolute top-2 left-2">
          <Badge
            className={
              isVenta
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-0'
            }
          >
            {isVenta ? 'Se vende' : 'Se compra'}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="font-semibold text-sm text-emerald-900 line-clamp-2 leading-snug min-h-[2.5rem]">
          {listing.title}
        </div>
        <div className="text-lg font-bold text-emerald-700">
          {formatCRC(listing.price)}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-700/70">
          <MapPin className="h-3 w-3" />
          {listing.location}
          <span className="mx-0.5">·</span>
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
    <div className="overflow-y-auto max-h-[90vh]">
      {/* Imagen */}
      <div className="aspect-[4/3] bg-emerald-50 relative">
        {listing.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            {CATEGORY_ICONS[listing.category] ?? '📦'}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge
            className={
              isVenta
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-0'
            }
          >
            {isVenta ? 'Se vende' : 'Se compra'}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-900 leading-snug">{listing.title}</h2>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {formatCRCFull(listing.price)}
            <span className="text-sm font-normal text-emerald-700/70 ml-1">colones</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800 gap-1">
            <Tag className="h-3 w-3" />
            {listing.category}
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800 gap-1">
            <MapPin className="h-3 w-3" />
            {listing.location}
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-800 capitalize">
            {listing.condition}
          </Badge>
        </div>

        <div>
          <div className="text-sm font-semibold text-emerald-900 mb-1">Descripción</div>
          <p className="text-sm text-emerald-800/90 whitespace-pre-line">{listing.description}</p>
        </div>

        <div className="text-[11px] text-emerald-700/60">
          Publicado {formatRelativeTime(listing.createdAt)}
        </div>

        {/* Contacto */}
        <div className="border-t border-emerald-100 pt-4 space-y-3">
          <div className="text-sm font-semibold text-emerald-900">Contacto</div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
              {listing.contactName.charAt(0).toUpperCase()}
            </div>
            <div className="font-medium text-emerald-900">{listing.contactName}</div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <a href={`tel:${listing.contactPhone}`}>
              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 gap-2"
              >
                <Phone className="h-4 w-4" />
                Llamar: {listing.contactPhone}
              </Button>
            </a>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>

          <p className="text-[11px] text-emerald-700/60 text-center">
            Recuerda reunirte en lugares públicos y verificar el producto antes de pagar.
          </p>
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
      <div className="text-6xl mb-4">🌱</div>
      <h3 className="text-xl font-semibold text-emerald-900 mb-2">
        {hasFilters ? 'No hay anuncios con esos filtros' : 'Todavía no hay anuncios'}
      </h3>
      <p className="text-sm text-emerald-700 mb-6 max-w-md mx-auto">
        {hasFilters
          ? 'Prueba con otros filtros o limpia para ver todos los anuncios.'
          : '¡Sé la primera persona en publicar algo en MarketPoás!'}
      </p>
      <div className="flex justify-center gap-2">
        {hasFilters && (
          <Button variant="outline" onClick={onClear} className="border-emerald-200 text-emerald-800">
            Limpiar filtros
          </Button>
        )}
        <Button onClick={onPublish} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
          <Plus className="h-4 w-4" /> Publicar anuncio
        </Button>
      </div>
    </div>
  )
}
