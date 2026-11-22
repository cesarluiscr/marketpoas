'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Flag } from 'lucide-react'

const REASONS = [
  { value: 'spam', label: 'Spam o anuncio repetido', icon: '📢' },
  { value: 'fraude', label: 'Posible fraude o estafa', icon: '⚠️' },
  { value: 'contenido inapropiado', label: 'Contenido inapropiado', icon: '🚫' },
  { value: 'otro', label: 'Otro motivo', icon: '❓' },
] as const

export function ReportModal({
  open, onOpenChange, listingTitle, onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  listingTitle: string
  onSubmit: (reason: string, details: string) => Promise<void>
}) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return
    setSubmitting(true)
    try {
      await onSubmit(reason, details)
      setReason('')
      setDetails('')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-[#0a3d2e]/15" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#0a3d2e] flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
              <Flag className="h-4 w-4 text-red-600" />
            </div>
            Denunciar anuncio
          </DialogTitle>
          <DialogDescription className="text-[#0a3d2e]/70">
            Reporta &quot;{listingTitle}&quot; si crees que viola las normas de MarketPoás. Nuestro equipo revisará tu denuncia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-[#0a3d2e] mb-2 block">Motivo de la denuncia *</Label>
            <div className="grid grid-cols-1 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    reason === r.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-[#0a3d2e]/12 bg-white hover:border-[#0a3d2e]/25'
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span className="text-sm font-medium text-[#0a3d2e]">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="reportDetails" className="text-sm font-medium text-[#0a3d2e]">
              Detalles (opcional)
            </Label>
            <Textarea
              id="reportDetails"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Cuéntanos más sobre el problema..."
              rows={3}
              maxLength={500}
              className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-[#0a3d2e]/15 text-[#0a3d2e]">
              Cancelar
            </Button>
            <Button type="submit" disabled={!reason || submitting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1.5">
              <Flag className="h-4 w-4" />
              {submitting ? 'Enviando...' : 'Enviar denuncia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
