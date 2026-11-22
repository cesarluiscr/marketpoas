'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { User as UserIcon, Phone, Shield } from 'lucide-react'

type Mode = 'login' | 'register' | 'admin'

export default function LoginModal({
  open, onOpenChange, initialMode = 'login',
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialMode?: Mode
}) {
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>(initialMode)

  // Campos login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  // Campos registro
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regSubmitting, setRegSubmitting] = useState(false)

  // Campos admin
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminSubmitting, setAdminSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) {
      toast({ title: 'Email requerido', variant: 'destructive' })
      return
    }
    setLoginSubmitting(true)
    try {
      const res = await signIn('credentials', {
        email: loginEmail.trim(),
        redirect: false,
      })
      if (res?.error) {
        toast({
          title: 'No se pudo iniciar sesión',
          description: 'Ese email no está registrado. Crea una cuenta en la pestaña "Registrarse".',
          variant: 'destructive',
        })
      } else {
        toast({ title: '¡Bienvenido a MarketPoás!', description: 'Sesión iniciada' })
        onOpenChange(false)
        setLoginEmail('')
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setLoginSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || regName.trim().length < 2) {
      toast({ title: 'Nombre requerido', description: 'Mínimo 2 caracteres', variant: 'destructive' })
      return
    }
    if (!regEmail.trim()) {
      toast({ title: 'Email requerido', variant: 'destructive' })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(regEmail.trim())) {
      toast({ title: 'Email inválido', variant: 'destructive' })
      return
    }

    setRegSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          name: regName.trim(),
          phone: regPhone.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'No se pudo registrar', description: data.error, variant: 'destructive' })
        return
      }
      // Auto-login después del registro
      const signInRes = await signIn('credentials', {
        email: regEmail.trim(),
        redirect: false,
      })
      if (signInRes?.error) {
        toast({ title: 'Cuenta creada', description: 'Inicia sesión con tu email' })
        setMode('login')
        setLoginEmail(regEmail)
      } else {
        toast({ title: '¡Cuenta creada!', description: 'Bienvenido a MarketPoás 🌋' })
        onOpenChange(false)
        setRegName('')
        setRegEmail('')
        setRegPhone('')
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setRegSubmitting(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminEmail.trim() || !adminPassword.trim()) {
      toast({ title: 'Email y contraseña requeridos', variant: 'destructive' })
      return
    }
    setAdminSubmitting(true)
    try {
      const res = await signIn('admin', {
        email: adminEmail.trim(),
        password: adminPassword,
        redirect: false,
      })
      if (res?.error) {
        toast({
          title: 'Acceso denegado',
          description: 'Email o contraseña incorrectos, o no tienes permisos de administrador.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: '¡Bienvenido, Administrador!',
          description: 'Sesión de administrador iniciada',
        })
        onOpenChange(false)
        setAdminEmail('')
        setAdminPassword('')
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setAdminSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-[#0a3d2e]/15" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#0a3d2e] flex items-center gap-2 text-xl">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] flex items-center justify-center">
              {mode === 'admin' ? (
                <Shield className="h-5 w-5 text-white" />
              ) : (
                <UserIcon className="h-5 w-5 text-white" />
              )}
            </div>
            {mode === 'login' ? 'Entrar a MarketPoás' : mode === 'register' ? 'Crear cuenta' : 'Acceso administrador'}
          </DialogTitle>
          <DialogDescription className="text-[#0a3d2e]/70">
            {mode === 'login'
              ? 'Inicia sesión para publicar anuncios y chatear con otros vecinos de Poás.'
              : mode === 'register'
              ? 'Crea tu cuenta para publicar anuncios y chatear con otros vecinos del cantón.'
              : 'Acceso exclusivo para administradores del cantón de Poás.'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs: 3 modos */}
        <div className="flex bg-[#0a3d2e]/5 rounded-xl p-1 gap-1 mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'login' ? 'bg-white text-[#0a3d2e] shadow-sm' : 'text-[#0a3d2e]/60 hover:text-[#0a3d2e]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'register' ? 'bg-white text-[#0a3d2e] shadow-sm' : 'text-[#0a3d2e]/60 hover:text-[#0a3d2e]'
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
              mode === 'admin' ? 'bg-[#0a3d2e] text-white shadow-sm' : 'text-[#0a3d2e]/60 hover:text-[#0a3d2e]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>

        {/* Formulario LOGIN vecino */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label htmlFor="loginEmail" className="text-sm font-medium text-[#0a3d2e]">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                autoFocus
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
              <p className="text-[11px] text-[#0a3d2e]/50 mt-1">
                ¿No tienes cuenta? Toca «Registrarse» arriba.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={loginSubmitting}
                className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl shadow-volcano"
              >
                {loginSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Formulario REGISTRO */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <Label htmlFor="regName" className="text-sm font-medium text-[#0a3d2e]">Nombre completo *</Label>
              <Input
                id="regName"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ej: María González"
                required
                autoFocus
                maxLength={60}
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <div>
              <Label htmlFor="regEmail" className="text-sm font-medium text-[#0a3d2e]">Email *</Label>
              <Input
                id="regEmail"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <div>
              <Label htmlFor="regPhone" className="text-sm font-medium text-[#0a3d2e] flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Teléfono (opcional)
              </Label>
              <Input
                id="regPhone"
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="8888-8888"
                maxLength={20}
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
              <p className="text-[11px] text-[#0a3d2e]/50 mt-1">
                Se usará como contacto cuando publiques anuncios.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={regSubmitting}
                className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl shadow-volcano"
              >
                {regSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Formulario ADMIN */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <Label htmlFor="adminEmail" className="text-sm font-medium text-[#0a3d2e] flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Email del administrador
              </Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@marketpoas.cr"
                required
                autoFocus
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <div>
              <Label htmlFor="adminPassword" className="text-sm font-medium text-[#0a3d2e]">Contraseña</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
              <p className="text-[11px] text-[#0a3d2e]/50 mt-1">
                Acceso exclusivo para la administración del cantón.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={adminSubmitting}
                className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl shadow-volcano gap-1.5"
              >
                <Shield className="h-4 w-4" />
                {adminSubmitting ? 'Verificando...' : 'Entrar como admin'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Switch entre modos */}
        <div className="text-center text-xs text-[#0a3d2e]/60 pt-2 space-y-1">
          {mode === 'login' && (
            <>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => setMode('register')} className="font-semibold text-[#1a6b4a] hover:underline">
                Regístrate aquí
              </button>
            </>
          )}
          {mode === 'register' && (
            <>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => setMode('login')} className="font-semibold text-[#1a6b4a] hover:underline">
                Inicia sesión
              </button>
            </>
          )}
          {mode !== 'admin' && (
            <div>
              <button type="button" onClick={() => setMode('admin')} className="font-semibold text-[#0a3d2e]/70 hover:underline">
                ¿Eres administrador? Entra aquí
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
