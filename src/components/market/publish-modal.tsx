'use client'

import { useState, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, TrendingUp, TrendingDown, Image as ImageIcon, Camera, X, Package, Sparkles } from 'lucide-react'
import { CATEGORIES, LOCATIONS, CONDITIONS, CATEGORY_ICONS, CATEGORY_FIELDS } from '@/lib/market'

export default function PublishModal({
  open, onOpenChange, session, onPublished, isAdmin,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  session: any
  onPublished: () => void
  isAdmin?: boolean
}) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
    promoted: false, // Solo admin puede destacar
    // Campos meta (vacíos por defecto)
    metaKm: '',
    metaYear: '',
    metaBrand: '',
    metaModel: '',
    metaAreaM2: '',
    metaBedrooms: '',
    metaBathrooms: '',
    metaSize: '',
    metaWeight: '',
    metaCapacity: '',
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }))
        toast({ title: 'Foto subida' })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setUploadingPhoto(false)
      // Limpiar input para poder subir la misma foto otra vez
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
      toast({ title: '¡Anuncio publicado!', description: 'Tu anuncio ya está visible' })
      onOpenChange(false)
      setForm({
        type: 'venta', title: '', description: '', price: '',
        category: 'Alimentos', condition: 'usado', location: 'San Pedro',
        imageUrl: '', contactName: session?.user?.name ?? '', contactPhone: '', contactWhatsapp: '',
        promoted: false,
        metaKm: '', metaYear: '', metaBrand: '', metaModel: '',
        metaAreaM2: '', metaBedrooms: '', metaBathrooms: '',
        metaSize: '', metaWeight: '', metaCapacity: '',
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

          {/* Campos personalizados según categoría */}
          {(CATEGORY_FIELDS[form.category] || []).length > 0 && (
            <div className="bg-[#fdf9ee] rounded-2xl p-4 space-y-3 border border-[#0a3d2e]/8">
              <div className="text-sm font-semibold text-[#0a3d2e] flex items-center gap-1.5">
                <Package className="h-4 w-4 text-[#1a6b4a]" />
                Especificaciones de {form.category}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(CATEGORY_FIELDS[form.category] || []).map((f) => (
                  <div key={f.key}>
                    <Label className="text-xs font-medium text-[#0a3d2e]">
                      {f.label}{f.unit ? ` (${f.unit})` : ''}
                    </Label>
                    {f.type === 'select' ? (
                      <Select
                        value={(form as any)[f.key]}
                        onValueChange={(v) => setForm({ ...form, [f.key]: v })}
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-[#0a3d2e]/15 h-10 text-sm">
                          <SelectValue placeholder={`Selecciona ${f.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(f.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={(form as any)[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a] h-10 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#0a3d2e]/50">
                💡 Estos datos ayudan a los compradores a encontrar tu anuncio más fácilmente.
              </p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium flex items-center gap-1 text-[#0a3d2e] mb-2"><ImageIcon className="h-3.5 w-3.5" /> Foto del producto (opcional)</Label>

            {/* Subir foto desde cámara/dispositivo */}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={(el) => { fileInputRef.current = el }}
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex-1 border-[#0a3d2e]/15 text-[#0a3d2e] hover:bg-[#0a3d2e]/5 rounded-xl h-11 gap-2"
                >
                  {uploadingPhoto ? 'Subiendo...' : (<>
                    <Camera className="h-4 w-4" />
                    <span className="text-sm font-semibold">Tomar / subir foto</span>
                  </>)}
                </Button>
                {form.imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                    className="text-red-600 hover:bg-red-50 rounded-xl h-11 w-11 shrink-0"
                    aria-label="Quitar foto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {form.imageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#0a3d2e]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              )}
              {/* Opción avanzada: pegar URL */}
              <details className="text-xs">
                <summary className="text-[#0a3d2e]/60 cursor-pointer hover:text-[#0a3d2e] select-none">
                  O pegar URL de imagen externa
                </summary>
                <Input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-2 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
                />
              </details>
            </div>
          </div>

          {/* Toggle de destacado (solo admin) */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-[#d4a017]/10 to-[#f0c75e]/15 rounded-2xl p-3 border border-[#d4a017]/30 flex items-center gap-3">
              <input
                type="checkbox"
                id="promoted"
                checked={form.promoted}
                onChange={(e) => setForm({ ...form, promoted: e.target.checked })}
                className="h-5 w-5 rounded accent-[#d4a017] shrink-0"
              />
              <label htmlFor="promoted" className="flex-1 cursor-pointer">
                <div className="text-sm font-semibold text-[#0a3d2e] flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-[#d4a017]" />
                  Destacar anuncio (admin)
                </div>
                <div className="text-[11px] text-[#0a3d2e]/60">
                  Aparecerá primero con badge dorado por 7 días
                </div>
              </label>
            </div>
          )}

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
