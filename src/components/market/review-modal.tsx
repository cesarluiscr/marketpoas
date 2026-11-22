'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { Star } from 'lucide-react'

export function ReviewModal({
  open, onOpenChange, sellerName, onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  sellerName: string
  onSubmit: (rating: number, comment: string) => Promise<void>
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(rating, comment)
      setComment('')
      setRating(5)
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
              <Star className="h-5 w-5 text-[#d4a017]" />
            </div>
            <div>
              <div className="font-bold text-[#0a3d2e]">Calificar a {sellerName}</div>
              <div className="text-xs text-[#0a3d2e]/60">Tu reseña ayuda a otros vecinos</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Calificación</Label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="p-1"
                    aria-label={`${i + 1} estrellas`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${i < rating ? 'fill-[#d4a017] text-[#d4a017]' : 'text-[#0a3d2e]/20'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#0a3d2e]">Comentario (opcional)</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Cómo fue tu experiencia?"
                rows={3}
                maxLength={300}
                className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl border-[#0a3d2e]/15 text-[#0a3d2e]">
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl">
                {submitting ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
