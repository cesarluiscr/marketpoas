'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, TrendingUp, TrendingDown, Image as ImageIcon } from 'lucide-react'
import { CATEGORIES, LOCATIONS, CONDITIONS, CATEGORY_ICONS } from '@/lib/market'

export default function PublishModal({
  open, onOpenChange, session, onPublished,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  session: any
  onPublished: () => void
}) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    type: 'venta' as 'venta' | 'compra',
    title: '',
    description: '',
    price: '',
    category: 'Alimentos',
    condition: 'usado',
    location: 'San Pedro',
    imageUrl: '',
    contactName: session?.user?.name ?? '',
    contactPhone: '',
    contactWhatsapp: '',
  })

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
      toast({ title: '¡Anuncio publicado!', description: 'Tu anuncio ya está visible' })
      onOpenChange(false)
      setForm({
        type: 'venta', title: '', description: '', price: '',
        category: 'Alimentos', condition: 'usado', location: 'San Pedro',
        imageUrl: '', contactName: session?.user?.name ?? '', contactPhone: '', contactWhatsapp: '',
      })
      onPublished()
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border-[#0a3d2e]/15" aria-describedby={undefined}>
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
          <div>
            <Label className="text-sm font-semibold mb-2 block text-[#0a3d2e]">¿Qué quieres hacer?</Label>
            <div className="grid grid-cols-2 gap-2">
              <TypeButton active={form.type === 'venta'} onClick={() => setForm({ ...form, type: 'venta' })} icon={<TrendingUp className="h-5 w-5" />} label="Quiero VENDER" sublabel="Tengo algo que ofrecer" color="forest" />
              <TypeButton active={form.type === 'compra'} onClick={() => setForm({ ...form, type: 'compra' })} icon={<TrendingDown className="h-5 w-5" />} label="Quiero COMPRAR" sublabel="Estoy buscando algo" color="strawberry" />
            </div>
          </div>
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-[#0a3d2e]">Título del anuncio *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.type === 'venta' ? 'Ej: Café fresco de Poás, 5 libras' : 'Ej: Compro gallinas ponedoras'} maxLength={80} className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" required />
            <div className="text-[11px] text-[#0a3d2e]/50 mt-1">{form.title.length}/80</div>
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-[#0a3d2e]">Descripción *</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe el producto, estado, ubicación, detalles importantes..." rows={4} maxLength={600} className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" required />
            <div className="text-[11px] text-[#0a3d2e]/50 mt-1">{form.description.length}/600</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-[#0a3d2e]">Precio (colones) *</Label>
              <Input id="price" type="number" min="0" step="100" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" required />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Categoría *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{CATEGORY_ICONS[c]} {c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Condición</Label>
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15"><SelectValue /></SelectTrigger>
                <SelectContent>{CONDITIONS.map((c) => (<SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Distrito</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15"><SelectValue /></SelectTrigger>
                <SelectContent>{LOCATIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center gap-1 text-[#0a3d2e]"><ImageIcon className="h-3.5 w-3.5" /> URL de imagen (opcional)</Label>
            <Input id="imageUrl" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" />
          </div>
          <div className="border-t border-[#0a3d2e]/10 pt-4 space-y-3">
            <div className="text-sm font-semibold text-[#0a3d2e]">Información de contacto</div>
            <div>
              <Label htmlFor="contactName" className="text-sm font-medium text-[#0a3d2e]">Tu nombre *</Label>
              <Input id="contactName" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Nombre completo" maxLength={60} className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contactPhone" className="text-sm font-medium text-[#0a3d2e]">Teléfono *</Label>
                <Input id="contactPhone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="8888-8888" maxLength={20} className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" required />
              </div>
              <div>
                <Label htmlFor="contactWhatsapp" className="text-sm font-medium text-[#0a3d2e]">WhatsApp (opcional)</Label>
                <Input id="contactWhatsapp" value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} placeholder="50688888888" maxLength={20} className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="rounded-xl border-[#0a3d2e]/15 text-[#0a3d2e]">Cancelar</Button>
            <Button type="submit" disabled={submitting} className="bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white gap-1.5 rounded-xl shadow-volcano">
              {submitting ? 'Publicando...' : 'Publicar anuncio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TypeButton({ active, onClick, icon, label, sublabel, color }: any) {
  const activeClasses = color === 'forest' ? 'border-[#1a6b4a] bg-[#1a6b4a]/5 text-[#0a3d2e]' : 'border-[#c2185b] bg-[#c2185b]/5 text-[#0a3d2e]'
  const iconColor = active ? (color === 'forest' ? 'text-[#1a6b4a]' : 'text-[#c2185b]') : 'text-[#0a3d2e]/40'
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-start gap-1 p-3 rounded-2xl border-2 transition-all text-left ${active ? `${activeClasses} shadow-sm` : 'border-[#0a3d2e]/12 bg-white text-[#0a3d2e]/70 hover:border-[#0a3d2e]/25'}`}>
      <div className={iconColor}>{icon}</div>
      <div className="text-sm font-bold">{label}</div>
      <div className="text-[11px] opacity-70">{sublabel}</div>
    </button>
  )
}
