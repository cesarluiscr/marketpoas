'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from '@/components/ui/toaster'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Home as HomeIcon,
  Map as MapIcon,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Plus,
  X,
  Mountain,
  Search,
} from 'lucide-react'
import type { Listing } from '@/lib/market'
import type { ConversationWithMeta, Message } from '@/components/market/types'
import { io, Socket } from 'socket.io-client'

import HomeTab from '@/components/market/home-tab'
import MapTab from '@/components/market/map-tab'
import ChatTab from '@/components/market/chat-tab'
import MineTab from '@/components/market/mine-tab'
import PublishModal from '@/components/market/publish-modal'
import ListingDetailModal from '@/components/market/listing-detail'
import LoginModal from '@/components/market/login-modal'

type Tab = 'home' | 'map' | 'chat' | 'mine'

export default function Home() {
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>('home')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, venta: 0, compra: 0 })
  const [unreadCount, setUnreadCount] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'todas' | 'venta' | 'compra'>('todas')
  const [categoryFilter, setCategoryFilter] = useState<string>('todas')
  const [locationFilter, setLocationFilter] = useState<string>('todas')
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent')

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  const [conversations, setConversations] = useState<ConversationWithMeta[]>([])
  const [activeConversation, setActiveConversation] = useState<ConversationWithMeta | null>(null)
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const socketRef = useRef<Socket | null>(null)

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
      if (res.ok) setListings(data.listings)
      else toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [typeFilter, categoryFilter, locationFilter, searchQuery, sortBy, toast])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) setStats(await res.json())
    } catch {}
  }, [])

  const fetchUnread = useCallback(async () => {
    if (status !== 'authenticated') {
      setUnreadCount(0)
      return
    }
    try {
      const res = await fetch('/api/me/unread')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unread ?? 0)
      }
    } catch {}
  }, [status])

  const fetchConversations = useCallback(async () => {
    if (status !== 'authenticated') {
      setConversations([])
      return
    }
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
        fetchUnread()
      }
    } catch {}
  }, [status, fetchUnread])

  useEffect(() => { fetchListings() }, [fetchListings])
  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchUnread() }, [fetchUnread])
  useEffect(() => {
    if (tab === 'chat') fetchConversations()
  }, [tab, fetchConversations])

  // Cargar favoritos al iniciar sesión
  useEffect(() => {
    if (session) {
      fetch('/api/favorites/list')
        .then((r) => r.ok ? r.json() : { listings: [] })
        .then((data) => setFavoriteIds(data.listings.map((l: any) => l.id)))
        .catch(() => {})
    } else {
      setFavoriteIds([])
    }
  }, [session])

  // Service Worker (PWA)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Socket.io
  useEffect(() => {
    if (!session || socketRef.current) return
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    })
    socketRef.current = socket
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session])

  useEffect(() => {
    if (!socketRef.current || !activeConversation) return
    socketRef.current.emit('join_conversation', activeConversation.id)
    return () => {
      socketRef.current?.emit('leave_conversation', activeConversation.id)
    }
  }, [activeConversation])

  useEffect(() => {
    if (!socketRef.current) return
    const socket = socketRef.current
    const handler = (message: Message) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setActiveMessages((prev) => [...prev, message])
      }
      fetchConversations()
      fetchUnread()
    }
    socket.on('new_message', handler)
    return () => { socket.off('new_message', handler) }
  }, [activeConversation, fetchConversations, fetchUnread])

  // Debounced search
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

  const handleToggleFavorite = async (listingId: string) => {
    if (!session) {
      setLoginOpen(true)
      return
    }
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.favorited) {
          setFavoriteIds((prev) => [...prev, listingId])
        } else {
          setFavoriteIds((prev) => prev.filter((id) => id !== listingId))
        }
      }
    } catch {}
  }

  const handleNearMe = (onDone: () => void) => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocalización no disponible', variant: 'destructive' })
      onDone()
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Filtrar listings por cercanía (usar los listings actuales con lat/lng)
        const { latitude, longitude } = pos.coords
        // Calcular distancia y ordenar por cercanía
        const sorted = [...listings]
          .map((l) => {
            const dist = l.lat && l.lng
              ? Math.sqrt(Math.pow(l.lat - latitude, 2) + Math.pow(l.lng - longitude, 2))
              : 999
            return { l, dist }
          })
          .sort((a, b) => a.dist - b.dist)
          .map((x) => x.l)
        setListings(sorted)
        toast({
          title: 'Cerca de ti',
          description: `Anuncios ordenados por distancia a tu ubicación`,
        })
        onDone()
      },
      (err) => {
        toast({ title: 'No se pudo obtener tu ubicación', variant: 'destructive' })
        onDone()
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSaveSearch = async () => {
    if (!session) {
      setLoginOpen(true)
      return
    }
    // Generar nombre automático
    const parts: string[] = []
    if (searchQuery.trim()) parts.push(`"${searchQuery.trim()}"`)
    if (typeFilter !== 'todas') parts.push(typeFilter === 'venta' ? 'Vender' : 'Comprar')
    if (categoryFilter !== 'todas') parts.push(categoryFilter)
    if (locationFilter !== 'todas') parts.push(locationFilter)
    const name = parts.length > 0 ? parts.join(' · ') : 'Mi búsqueda'

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          search: searchQuery.trim() || null,
          type: typeFilter !== 'todas' ? typeFilter : null,
          category: categoryFilter !== 'todas' ? categoryFilter : null,
          location: locationFilter !== 'todas' ? locationFilter : null,
        }),
      })
      if (res.ok) {
        toast({
          title: 'Búsqueda guardada',
          description: 'Te avisaremos cuando aparezcan nuevos anuncios que coincidan',
        })
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    }
  }

  const handleOpenChat = async (listing: Listing) => {
    if (!session) {
      setLoginOpen(true)
      return
    }
    if (!listing.userId) {
      toast({
        title: 'Chat no disponible',
        description: 'Este anuncio fue publicado antes del sistema de usuarios. Usa el teléfono/WhatsApp.',
        variant: 'destructive',
      })
      return
    }
    if (listing.userId === (session.user as any).id) {
      toast({ title: 'Es tu propio anuncio', description: 'Abre el chat desde la pestaña Chat' })
      return
    }
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      setSelectedListing(null)
      setTab('chat')
      // Fetch messages
      const msgRes = await fetch(`/api/conversations/${data.conversation.id}/messages`)
      if (msgRes.ok) {
        const msgData = await msgRes.json()
        setActiveConversation(msgData.conversation)
        setActiveMessages(msgData.messages)
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    }
  }

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`)
      const data = await res.json()
      if (res.ok) {
        setActiveConversation(data.conversation)
        setActiveMessages(data.messages)
      }
    } catch {}
  }, [])

  const onSelectConversation = (c: ConversationWithMeta) => {
    setActiveConversation(c)
    fetchMessages(c.id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9ee] pattern-coffee pb-16 lg:pb-0">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-[#0a3d2e]/10 glass">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setTab('home')}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="MarketPoás inicio"
          >
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0a3d2e] via-[#1a6b4a] to-[#2d8a6a] flex items-center justify-center shadow-volcano overflow-hidden">
              <svg viewBox="0 0 40 40" className="h-full w-full p-1.5" fill="none">
                <circle cx="29" cy="13" r="3.5" fill="#d4a017" opacity="0.85" />
                <path d="M2 32 L12 18 L20 26 L26 22 L38 32 Z" fill="#fdf9ee" opacity="0.95" />
                <path d="M10 32 L20 8 L30 32 Z" fill="#fdf9ee" />
                <ellipse cx="20" cy="11" rx="4" ry="1.5" fill="#1e3a5f" />
                <path d="M16 13 L20 8 L24 13 L22 14 L20 12.5 L18 14 Z" fill="#1e3a5f" />
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

          {(tab === 'home' || tab === 'map') && (
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#0a3d2e]/40 hover:text-[#0a3d2e] rounded-md hover:bg-[#0a3d2e]/5"
                  aria-label="Borrar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1" />

          {/* Usuario */}
          {session ? (
            <div className="flex items-center gap-2 shrink-0">
              <Avatar className="h-9 w-9 border-2 border-[#1a6b4a]">
                <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? 'User'} />
                <AvatarFallback className="bg-[#1a6b4a] text-white text-xs font-semibold">
                  {session.user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-[#0a3d2e]/60 hover:text-[#0a3d2e] hover:bg-[#0a3d2e]/5 rounded-full"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setLoginOpen(true)}
              className="shrink-0 border-[#0a3d2e]/15 text-[#0a3d2e] bg-white/70 hover:bg-white rounded-xl h-11 gap-1.5 px-3 sm:px-4"
            >
              <UserIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">Entrar</span>
            </Button>
          )}

          <Button
            onClick={() => (session ? setPublishOpen(true) : setLoginOpen(true))}
            className="shrink-0 bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-1.5 shadow-volcano rounded-xl h-11 px-4"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline font-semibold">Publicar</span>
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      {tab === 'home' && (
        <HomeTab
          listings={listings}
          loading={loading}
          stats={stats}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          onCardClick={setSelectedListing}
          onPublish={() => (session ? setPublishOpen(true) : setLoginOpen(true))}
          session={session}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          onNearMe={handleNearMe}
          onSaveSearch={handleSaveSearch}
        />
      )}

      {tab === 'map' && (
        <MapTab
          listings={listings}
          onCardClick={setSelectedListing}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
      )}

      {tab === 'chat' && (
        <ChatTab
          session={session}
          conversations={conversations}
          activeConversation={activeConversation}
          activeMessages={activeMessages}
          setActiveMessages={setActiveMessages}
          onSelectConversation={onSelectConversation}
          onBack={() => setActiveConversation(null)}
        />
      )}

      {tab === 'mine' && (
        <MineTab
          session={session}
          onDelete={async (id: string) => {
            if (!confirm('¿Eliminar este anuncio?')) return
            try {
              const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
              if (res.ok) {
                toast({ title: 'Anuncio eliminado' })
                fetchStats()
              }
            } catch {}
          }}
          onStatusChange={async (id: string, status: string) => {
            try {
              const res = await fetch(`/api/listings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
              })
              if (res.ok) toast({ title: 'Estado actualizado' })
            } catch {}
          }}
          onLogin={() => setLoginOpen(true)}
        />
      )}

      {/* PIE MÓVIL - Tech Center CR 2026 (visible antes del bottom nav) */}
      <div className="lg:hidden text-center py-4 text-[11px] text-[#0a3d2e]/50 px-4">
        Tech Center CR 2026
      </div>

      {/* FOOTER (desktop) */}
      <footer className="hidden lg:block mt-auto bg-gradient-to-b from-[#0a3d2e] to-[#062920] text-white/90 py-6 px-4">
        <div className="mx-auto max-w-6xl text-center text-xs text-white/60">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mountain className="h-4 w-4 text-[#d4a017]" />
            <span className="font-semibold text-white/90">MarketPoás</span>
            <span className="mx-1">·</span>
            <span>Cantón de Poás · Alajuela · Costa Rica</span>
          </div>
          Hecho con ☕ y 🍓 para los vecinos del cantón de Poás
          <div className="mt-3 pt-3 border-t border-white/10 text-white/50">
            Tech Center CR 2026
          </div>
        </div>
      </footer>

      {/* BOTTOM NAV (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#0a3d2e]/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <NavButton active={tab === 'home'} onClick={() => setTab('home')} icon={<HomeIcon className="h-5 w-5" />} label="Inicio" />
        <NavButton active={tab === 'map'} onClick={() => setTab('map')} icon={<MapIcon className="h-5 w-5" />} label="Mapa" />
        <NavButton
          active={tab === 'chat'}
          onClick={() => (session ? setTab('chat') : setLoginOpen(true))}
          icon={<MessageSquare className="h-5 w-5" />}
          label="Chat"
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
        <NavButton
          active={tab === 'mine'}
          onClick={() => (session ? setTab('mine') : setLoginOpen(true))}
          icon={<UserIcon className="h-5 w-5" />}
          label="Míos"
        />
      </nav>

      {/* DESKTOP TAB BAR */}
      <nav className="hidden lg:flex sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#0a3d2e]/10 px-2 py-2 justify-center gap-1">
        <DesktopNavButton active={tab === 'home'} onClick={() => setTab('home')} icon={<HomeIcon className="h-4 w-4" />} label="Inicio" />
        <DesktopNavButton active={tab === 'map'} onClick={() => setTab('map')} icon={<MapIcon className="h-4 w-4" />} label="Mapa del cantón" />
        <DesktopNavButton
          active={tab === 'chat'}
          onClick={() => (session ? setTab('chat') : setLoginOpen(true))}
          icon={<MessageSquare className="h-4 w-4" />}
          label="Chat"
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
        <DesktopNavButton
          active={tab === 'mine'}
          onClick={() => (session ? setTab('mine') : setLoginOpen(true))}
          icon={<UserIcon className="h-4 w-4" />}
          label="Mis anuncios"
        />
      </nav>

      {/* MODALES */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          session={session}
          open={!!selectedListing}
          onOpenChange={(o) => !o && setSelectedListing(null)}
          onOpenChat={handleOpenChat}
          onLogin={() => { setSelectedListing(null); setLoginOpen(true) }}
          isFavorite={favoriteIds.includes(selectedListing.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedListing.id)}
        />
      )}

      {publishOpen && (
        <PublishModal
          open={publishOpen}
          onOpenChange={setPublishOpen}
          session={session}
          onPublished={() => { fetchListings(); fetchStats() }}
        />
      )}

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

      <Toaster />
    </div>
  )
}

function NavButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
        active ? 'text-[#1a6b4a]' : 'text-[#0a3d2e]/50'
      }`}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-[#c2185b] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}

function DesktopNavButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2 rounded-xl transition-colors text-sm font-medium ${
        active ? 'bg-[#0a3d2e]/8 text-[#0a3d2e]' : 'text-[#0a3d2e]/60 hover:bg-[#0a3d2e]/5 hover:text-[#0a3d2e]'
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-[#c2185b] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}
