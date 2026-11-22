'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { TrendingDown } from 'lucide-react'
import { formatCRCFull } from '@/lib/market'

export function OfferModal({
  open, onOpenChange, listingPrice, onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  listingPrice: number
  onSubmit: (amount: number, message: string) => Promise<void>
}) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    setSubmitting(true)
    try {
      await onSubmit(Number(amount), message)
      setAmount('')
      setMessage('')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-[#0a3d2e]/15" aria-describedby={undefined}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#d4a017]/15 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-[#d4a017]" />
            </div>
            <div>
              <div className="font-bold text-[#0a3d2e]">Hacer oferta</div>
              <div className="text-xs text-[#0a3d2e]/60">Precio actual: {formatCRCFull(listingPrice)}</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Tu oferta (colones)</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(Math.round(listingPrice * 0.8))}
                required
                autoFocus
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Mensaje (opcional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ej: Lo recogería hoy mismo a este precio."
                rows={2}
                maxLength={200}
                className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl border-[#0a3d2e]/15 text-[#0a3d2e]">
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl">
                {submitting ? 'Enviando...' : 'Enviar oferta'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
