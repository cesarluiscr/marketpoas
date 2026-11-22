'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  MapPin, Tag, Phone, MessageCircle, MessageSquare, Sprout,
  Heart, Share2, Star, Eye, Send, TrendingDown, Sparkles, TrendingUp,
  Info, Package, Hash, Calendar, Clock, BadgeCheck,
} from 'lucide-react'
import { formatCRCFull, formatRelativeTime, CATEGORY_ICONS } from '@/lib/market'
import { useToast } from '@/hooks/use-toast'
import { QuestionItem } from './question-item'
import { OfferModal } from './offer-modal'
import { ReviewModal } from './review-modal'

type Listing = any
type Question = {
  id: string
  body: string
  answer: string | null
  answeredAt: string | null
  createdAt: string
  fromUser: { id: string; name: string | null }
}
type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  fromUser: { id: string; name: string | null }
}

export default function ListingDetailModal({
  listing, session, open, onOpenChange, onOpenChat, onLogin, isFavorite, onToggleFavorite,
}: any) {
  const { toast } = useToast()
  const isVenta = listing.type === 'venta'
  const [imgError, setImgError] = useState(false)
  const [favorited, setFavorited] = useState(isFavorite || false)
  const [views, setViews] = useState(listing.views || 0)
  const [favoritedCount, setFavoritedCount] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [submittingQ, setSubmittingQ] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [showOffer, setShowOffer] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const isOwner = session?.user?.id && listing.userId === session.user.id

  const loadData = useCallback(async () => {
    if (!listing.id) return
    fetch(`/api/listings/${listing.id}/view`, { method: 'POST' }).catch(() => {})
    setViews((v) => v + 1)

    try {
      const res = await fetch(`/api/questions?listingId=${listing.id}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions || [])
      }
    } catch {}

    // Contar favoritos de este anuncio
    try {
      const res = await fetch(`/api/favorites/count?listingId=${listing.id}`)
      if (res.ok) {
        const data = await res.json()
        setFavoritedCount(data.count || 0)
      }
    } catch {}

    if (listing.userId) {
      try {
        const res = await fetch(`/api/reviews?userId=${listing.userId}`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
          setAvgRating(data.average || 0)
        }
      } catch {}
    }
  }, [listing.id, listing.userId])

  useEffect(() => {
    if (open) loadData()
  }, [open, loadData])

  useEffect(() => {
    setFavorited(isFavorite || false)
  }, [isFavorite])

  const whatsappMsg = encodeURIComponent(
    `Hola ${listing.contactName}, vi tu anuncio "${listing.title}" en MarketPoás (${formatCRCFull(listing.price)}). ¿Sigue disponible?`
  )
  const whatsappLink = listing.contactWhatsapp ? `https://wa.me/${listing.contactWhatsapp}?text=${whatsappMsg}` : null

  const handleToggleFav = async () => {
    if (!session?.user) {
      onLogin()
      return
    }
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
        toast({ title: data.favorited ? 'Añadido a favoritos ❤️' : 'Quitado de favoritos' })
        onToggleFavorite?.()
      }
    } catch {}
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?listing=${listing.id}`
    const shareText = `Mira este anuncio en MarketPoás: ${listing.title} - ${formatCRCFull(listing.price)}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MarketPoás', text: shareText, url: shareUrl })
      } catch {}
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      toast({ title: 'Link copiado', description: 'Pega donde quieras compartir' })
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      onLogin()
      return
    }
    if (!newQuestion.trim()) return
    setSubmittingQ(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, body: newQuestion }),
      })
      const data = await res.json()
      if (res.ok) {
        setQuestions((prev) => [data.question, ...prev])
        setNewQuestion('')
        toast({ title: 'Pregunta enviada' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setSubmittingQ(false)
    }
  }

  const handleAnswer = async (questionId: string, answer: string) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })
      if (res.ok) {
        const data = await res.json()
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? { ...q, answer: data.question.answer, answeredAt: data.question.answeredAt }
              : q
          )
        )
        toast({ title: 'Respuesta publicada' })
      }
    } catch {}
  }

  const handleOfferSubmit = async (amount: number, message: string) => {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          amount: Number(amount),
          message,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Oferta enviada', description: `₡${Number(amount).toLocaleString('es-CR')}` })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    }
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: listing.userId,
          rating,
          comment,
        }),
      })
      if (res.ok) {
        toast({ title: 'Reseña publicada' })
        loadData()
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh] rounded-3xl border-[#0a3d2e]/15"
          aria-describedby={undefined}
        >
          <div className="overflow-y-auto max-h-[90vh] fancy-scroll">
            {/* Imagen */}
            <div className="aspect-[4/3] bg-gradient-to-br from-[#fdf9ee] to-[#f5e8d0] relative">
              <div className="absolute inset-0 flex items-center justify-center text-7xl transition-opacity">
                <span className="opacity-60">{CATEGORY_ICONS[listing.category] ?? '📦'}</span>
              </div>
              {listing.imageUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.imageUrl} alt={listing.title} className="relative w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : null}

              <div className="absolute top-3 left-3">
                <Badge className={`border-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur ${isVenta ? 'bg-[#1a6b4a]/95 text-white hover:bg-[#1a6b4a]' : 'bg-[#c2185b]/95 text-white hover:bg-[#c2185b]'}`}>
                  {isVenta ? 'Se vende' : 'Se compra'}
                </Badge>
                {listing.promoted && listing.promotedUntil && new Date(listing.promotedUntil) > new Date() && (
                  <Badge className="ml-2 border-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-gradient-to-r from-[#d4a017] to-[#f0c75e] text-[#0a3d2e]">
                    <Sparkles className="h-3 w-3 mr-1 inline" /> Destacado
                  </Badge>
                )}
              </div>

              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={handleShare} className="h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors" aria-label="Compartir" title="Compartir">
                  <Share2 className="h-4 w-4 text-[#0a3d2e]" />
                </button>
                <button onClick={handleToggleFav} className="h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors" aria-label="Favorito">
                  <Heart className={`h-4 w-4 ${favorited ? 'fill-[#c2185b] text-[#c2185b]' : 'text-[#0a3d2e]'}`} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#0a3d2e] leading-snug">{listing.title}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#0a3d2e] to-[#1a6b4a] bg-clip-text text-transparent">
                    {formatCRCFull(listing.price)}
                    <span className="text-sm font-normal text-[#0a3d2e]/50 ml-1.5">colones</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#0a3d2e]/50 ml-auto">
                    <Eye className="h-3.5 w-3.5" /> {views} {views === 1 ? 'vista' : 'vistas'}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`border-0 px-3 py-1 rounded-full text-xs font-semibold ${isVenta ? 'bg-[#1a6b4a] text-white' : 'bg-[#c2185b] text-white'}`}>
                  {isVenta ? 'Se vende' : 'Se compra'}
                </Badge>
                <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] gap-1 rounded-full px-3 py-1">
                  <Tag className="h-3 w-3" /> {listing.category}
                </Badge>
                <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] gap-1 rounded-full px-3 py-1">
                  <MapPin className="h-3 w-3 text-[#c2185b]" /> {listing.location}
                </Badge>
                <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] capitalize rounded-full px-3 py-1">
                  {listing.condition}
                </Badge>
                {listing.promoted && listing.promotedUntil && new Date(listing.promotedUntil) > new Date() && (
                  <Badge className="bg-gradient-to-r from-[#d4a017] to-[#f0c75e] text-[#0a3d2e] border-0 px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles className="h-3 w-3 mr-0.5 inline" /> Destacado
                  </Badge>
                )}
              </div>

              {/* Descripción */}
              <div>
                <div className="text-sm font-semibold text-[#0a3d2e] mb-1.5">Descripción</div>
                <p className="text-sm text-[#0a3d2e]/80 whitespace-pre-line leading-relaxed">{listing.description}</p>
              </div>

              {/* Detalles del anuncio - cuadro con info estructurada */}
              <div className="bg-[#fdf9ee] rounded-2xl p-4 space-y-2.5 border border-[#0a3d2e]/8">
                <div className="text-sm font-semibold text-[#0a3d2e] mb-2 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-[#1a6b4a]" />
                  Detalles del anuncio
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <DetailRow icon={<Tag className="h-3.5 w-3.5" />} label="Categoría" value={listing.category} />
                  <DetailRow icon={<Package className="h-3.5 w-3.5" />} label="Condición" value={listing.condition} capitalize />
                  <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Distrito" value={listing.location} />
                  <DetailRow icon={<TrendingUp className="h-3.5 w-3.5" />} label="Tipo" value={isVenta ? 'Venta' : 'Compra'} />
                  <DetailRow icon={<Hash className="h-3.5 w-3.5" />} label="ID anuncio" value={`#${listing.id.slice(-6).toUpperCase()}`} />
                  <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Publicado" value={formatRelativeTime(listing.createdAt)} />
                </div>
              </div>

              {/* Estadísticas del anuncio */}
              <div className="grid grid-cols-3 gap-2">
                <StatBox icon={<Eye className="h-4 w-4" />} value={views} label={views === 1 ? 'Vista' : 'Vistas'} />
                <StatBox icon={<MessageSquare className="h-4 w-4" />} value={questions.length} label={questions.length === 1 ? 'Pregunta' : 'Preguntas'} />
                <StatBox icon={<Heart className="h-4 w-4" />} value={favoritedCount} label="Favoritos" />
              </div>

              <div className="text-[11px] text-[#0a3d2e]/50 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Publicado el {new Date(listing.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}
                Actualizado {formatRelativeTime(listing.updatedAt || listing.createdAt)}
              </div>

              {/* Preguntas */}
              <div className="border-t border-[#0a3d2e]/10 pt-4 space-y-3">
                <div className="text-sm font-semibold text-[#0a3d2e]">Preguntas y respuestas</div>

                {!isOwner && (
                  <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Haz una pregunta pública..."
                      className="flex-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a] h-10"
                      maxLength={300}
                    />
                    <Button type="submit" disabled={submittingQ || !newQuestion.trim()} size="icon" className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl h-10 w-10 shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                )}

                {questions.length === 0 ? (
                  <div className="text-xs text-[#0a3d2e]/50 italic text-center py-2">
                    Aún no hay preguntas. ¡Sé el primero en preguntar!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto fancy-scroll pr-1">
                    {questions.map((q) => (
                      <QuestionItem
                        key={q.id}
                        question={q}
                        isOwner={isOwner}
                        onAnswer={(answer) => handleAnswer(q.id, answer)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Contacto */}
              <div className="border-t border-[#0a3d2e]/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0a3d2e]">Información del vendedor</div>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 text-xs bg-[#d4a017]/10 px-2 py-1 rounded-full">
                      <Star className="h-3.5 w-3.5 fill-[#d4a017] text-[#d4a017]" />
                      <span className="font-semibold text-[#0a3d2e]">{avgRating.toFixed(1)}</span>
                      <span className="text-[#0a3d2e]/50">({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
                    </div>
                  )}
                </div>

                {/* Tarjeta del vendedor */}
                <div className="bg-[#fdf9ee] rounded-2xl p-3 border border-[#0a3d2e]/8 flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#1a6b4a] to-[#0a3d2e] text-white font-semibold text-lg">
                      {listing.contactName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0a3d2e] truncate">{listing.contactName}</div>
                    {listing.userId ? (
                      <div className="flex items-center gap-1 text-[10px] text-[#1a6b4a] font-medium">
                        <BadgeCheck className="h-3 w-3" /> Vendedor verificado
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#0a3d2e]/50">Vendedor invitado</div>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-[#0a3d2e]/50 mt-0.5">
                      <MapPin className="h-2.5 w-2.5" /> {listing.location}
                    </div>
                  </div>
                  {avgRating > 0 && (
                    <div className="text-right shrink-0">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.round(avgRating) ? 'fill-[#d4a017] text-[#d4a017]' : 'text-[#0a3d2e]/15'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-[#0a3d2e]/60 mt-0.5">{avgRating.toFixed(1)}/5</div>
                    </div>
                  )}
                </div>

                {/* Datos de contacto directo */}
                <div className="grid grid-cols-1 gap-2">
                  <DetailRow icon={<Phone className="h-3.5 w-3.5 text-[#1a6b4a]" />} label="Teléfono" value={listing.contactPhone} />
                  {listing.contactWhatsapp && (
                    <DetailRow icon={<MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />} label="WhatsApp" value={`+${listing.contactWhatsapp}`} />
                  )}
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-1 gap-2">
                  {!isOwner && (
                    <>
                      <Button
                        onClick={() => (session ? onOpenChat(listing) : onLogin())}
                        className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-2 rounded-xl h-11 shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {session ? 'Chatear con el vendedor' : 'Inicia sesión para chatear'}
                      </Button>

                      {isVenta && (
                        <Button
                          variant="outline"
                          onClick={() => (session ? setShowOffer(true) : onLogin())}
                          className="w-full border-[#d4a017] text-[#0a3d2e] hover:bg-[#d4a017]/10 gap-2 rounded-xl h-11"
                        >
                          <TrendingDown className="h-4 w-4" /> Hacer oferta
                        </Button>
                      )}

                      {listing.userId && (
                        <Button
                          variant="ghost"
                          onClick={() => (session ? setShowReview(true) : onLogin())}
                          className="w-full text-[#0a3d2e] hover:bg-[#0a3d2e]/5 gap-2 rounded-xl h-11"
                        >
                          <Star className="h-4 w-4" /> Calificar al vendedor
                        </Button>
                      )}
                    </>
                  )}

                  <a href={`tel:${listing.contactPhone}`}>
                    <Button variant="outline" className="w-full border-[#0a3d2e]/15 text-[#0a3d2e] hover:bg-[#0a3d2e]/5 gap-2 rounded-xl h-11">
                      <Phone className="h-4 w-4" /> Llamar: {listing.contactPhone}
                    </Button>
                  </a>
                  {whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-2 rounded-xl h-11 shadow-sm">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </Button>
                    </a>
                  )}
                </div>

                {/* Reseñas recientes */}
                {reviews.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#0a3d2e]">Reseñas recientes</div>
                    {reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="bg-[#fdf9ee] rounded-xl p-2.5 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-[#1a6b4a] text-white text-[10px]">
                              {r.fromUser.name?.charAt(0).toUpperCase() ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-semibold text-[#0a3d2e]">{r.fromUser.name}</div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < r.rating ? 'fill-[#d4a017] text-[#d4a017]' : 'text-[#0a3d2e]/20'}`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-[#0a3d2e]/80 pl-8">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-start gap-1.5 text-[11px] text-[#0a3d2e]/50 bg-[#fdf9ee] rounded-xl p-2.5 mt-2">
                  <Sprout className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1a6b4a]" />
                  <span>Reúnete en lugares públicos y verifica el producto antes de pagar. Cuídate entre vecinos.</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OfferModal
        open={showOffer}
        onOpenChange={setShowOffer}
        listingPrice={listing.price}
        onSubmit={handleOfferSubmit}
      />

      <ReviewModal
        open={showReview}
        onOpenChange={setShowReview}
        sellerName={listing.contactName}
        onSubmit={handleReviewSubmit}
      />
    </>
  )
}

// Sub-componentes para mostrar información del anuncio

function DetailRow({
  icon, label, value, capitalize,
}: {
  icon: React.ReactNode
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-[#0a3d2e]/8">
      <div className="text-[#1a6b4a] shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-[#0a3d2e]/50 uppercase tracking-wide">{label}</div>
        <div className={`text-xs font-semibold text-[#0a3d2e] truncate ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

function StatBox({
  icon, value, label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="bg-[#fdf9ee] rounded-xl p-2.5 text-center border border-[#0a3d2e]/8">
      <div className="flex items-center justify-center text-[#1a6b4a] mb-1">{icon}</div>
      <div className="text-lg font-bold text-[#0a3d2e]">{value}</div>
      <div className="text-[10px] text-[#0a3d2e]/60 uppercase tracking-wide">{label}</div>
    </div>
  )
}
