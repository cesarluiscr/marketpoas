'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Tag, Phone, MessageCircle, MessageSquare, Sprout } from 'lucide-react'
import { formatCRCFull, formatRelativeTime, CATEGORY_ICONS, type Listing } from '@/lib/market'

export default function ListingDetailModal({
  listing, session, open, onOpenChange, onOpenChat, onLogin,
}: any) {
  const isVenta = listing.type === 'venta'
  const [imgError, setImgError] = useState(false)
  const whatsappMsg = encodeURIComponent(
    `Hola ${listing.contactName}, vi tu anuncio "${listing.title}" en MarketPoás (${formatCRCFull(listing.price)}). ¿Sigue disponible?`
  )
  const whatsappLink = listing.contactWhatsapp ? `https://wa.me/${listing.contactWhatsapp}?text=${whatsappMsg}` : null
  const isOwner = session?.user?.id && listing.userId === session.user.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh] rounded-3xl border-[#0a3d2e]/15"
        aria-describedby={undefined}
      >
        <div className="overflow-y-auto max-h-[90vh] fancy-scroll">
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
                <Tag className="h-3 w-3" /> {listing.category}
              </Badge>
              <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] gap-1 rounded-full px-3 py-1">
                <MapPin className="h-3 w-3 text-[#c2185b]" /> {listing.location}
              </Badge>
              <Badge variant="outline" className="bg-[#fdf9ee] border-[#0a3d2e]/15 text-[#0a3d2e] capitalize rounded-full px-3 py-1">
                {listing.condition}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0a3d2e] mb-1.5">Descripción</div>
              <p className="text-sm text-[#0a3d2e]/80 whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>
            <div className="text-[11px] text-[#0a3d2e]/50">Publicado {formatRelativeTime(listing.createdAt)}</div>

            <div className="border-t border-[#0a3d2e]/10 pt-4 space-y-3">
              <div className="text-sm font-semibold text-[#0a3d2e]">Contacto</div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a6b4a] to-[#0a3d2e] text-white flex items-center justify-center font-semibold shadow-sm">
                  {listing.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="font-medium text-[#0a3d2e]">{listing.contactName}</div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {!isOwner && (
                  <Button
                    onClick={() => (session ? onOpenChat(listing) : onLogin())}
                    className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-2 rounded-xl h-11 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {session ? 'Chatear con el vendedor' : 'Inicia sesión para chatear'}
                  </Button>
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

              <div className="flex items-start gap-1.5 text-[11px] text-[#0a3d2e]/50 bg-[#fdf9ee] rounded-xl p-2.5 mt-2">
                <Sprout className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#1a6b4a]" />
                <span>Reúnete en lugares públicos y verifica el producto antes de pagar. Cuídate entre vecinos.</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
