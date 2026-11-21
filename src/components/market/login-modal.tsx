'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { User as UserIcon } from 'lucide-react'

export default function LoginModal({
  open, onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast({ title: 'Email requerido', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        name: name.trim(),
        redirect: false,
      })
      if (res?.error) {
        toast({ title: 'No se pudo iniciar sesión', description: res.error, variant: 'destructive' })
      } else {
        toast({ title: '¡Bienvenido a MarketPoás!', description: 'Sesión iniciada' })
        onOpenChange(false)
        setEmail('')
        setName('')
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-[#0a3d2e]/15" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#0a3d2e] flex items-center gap-2 text-xl">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            Entrar a MarketPoás
          </DialogTitle>
          <DialogDescription className="text-[#0a3d2e]/70">
            Inicia sesión para publicar anuncios y chatear con otros vecinos de Poás.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="loginEmail" className="text-sm font-medium text-[#0a3d2e]">Email</Label>
            <Input id="loginEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" />
          </div>
          <div>
            <Label htmlFor="loginName" className="text-sm font-medium text-[#0a3d2e]">Tu nombre</Label>
            <Input id="loginName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]" />
            <p className="text-[11px] text-[#0a3d2e]/50 mt-1">Demo: cualquier email funciona, no se envía código.</p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl shadow-volcano">
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
