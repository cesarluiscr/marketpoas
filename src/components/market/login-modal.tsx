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
import { User as UserIcon, Phone, Shield, Eye, EyeOff, KeyRound, LifeBuoy } from 'lucide-react'

type Mode = 'login' | 'register' | 'admin' | 'recover'

// Campo de contraseña con botón para mostrar/ocultar
function PasswordInput({
  id, value, onChange, placeholder, show, onToggle, autoFocus = false,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  show: boolean
  onToggle: () => void
  autoFocus?: boolean
}) {
  return (
    <div className="relative mt-1">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoFocus={autoFocus}
        minLength={6}
        className="rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a] pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a3d2e]/50 hover:text-[#0a3d2e]"
        tabIndex={-1}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

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
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  // Campos registro
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPassword2, setRegPassword2] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegPassword2, setShowRegPassword2] = useState(false)
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
    if (!loginPassword) {
      toast({ title: 'Contraseña requerida', variant: 'destructive' })
      return
    }
    if (loginPassword.length < 6) {
      toast({ title: 'Contraseña muy corta', description: 'Mínimo 6 caracteres', variant: 'destructive' })
      return
    }
    setLoginSubmitting(true)
    try {
      const res = await signIn('credentials', {
        email: loginEmail.trim(),
        password: loginPassword,
        redirect: false,
      })
      if (res?.error) {
        toast({
          title: 'No se pudo iniciar sesión',
          description: 'Email o contraseña incorrectos. Si no tienes cuenta, crea una en la pestaña "Registrarse".',
          variant: 'destructive',
        })
      } else {
        toast({ title: '¡Bienvenido a MarketPoás!', description: 'Sesión iniciada' })
        onOpenChange(false)
        setLoginEmail('')
        setLoginPassword('')
        setShowLoginPassword(false)
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
    if (!regPassword) {
      toast({ title: 'Contraseña requerida', description: 'Crea una contraseña para proteger tu cuenta', variant: 'destructive' })
      return
    }
    if (regPassword.length < 6) {
      toast({ title: 'Contraseña muy corta', description: 'Debe tener mínimo 6 caracteres', variant: 'destructive' })
      return
    }
    if (regPassword !== regPassword2) {
      toast({ title: 'Las contraseñas no coinciden', description: 'Verifica ambas contraseñas e inténtalo de nuevo', variant: 'destructive' })
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
          password: regPassword,
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
        password: regPassword,
        redirect: false,
      })
      if (signInRes?.error) {
        toast({ title: 'Cuenta creada', description: 'Inicia sesión con tu email y contraseña' })
        setMode('login')
        setLoginEmail(regEmail)
      } else {
        toast({ title: '¡Cuenta creada!', description: 'Bienvenido a MarketPoás 🌋' })
        onOpenChange(false)
        setRegName('')
        setRegEmail('')
        setRegPhone('')
        setRegPassword('')
        setRegPassword2('')
        setShowRegPassword(false)
        setShowRegPassword2(false)
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
              ) : mode === 'recover' ? (
                <LifeBuoy className="h-5 w-5 text-white" />
              ) : (
                <UserIcon className="h-5 w-5 text-white" />
              )}
            </div>
            {mode === 'login' ? 'Entrar a MarketPoás' : mode === 'register' ? 'Crear cuenta' : mode === 'recover' ? 'Recuperar contraseña' : 'Acceso administrador'}
          </DialogTitle>
          <DialogDescription className="text-[#0a3d2e]/70">
            {mode === 'login'
              ? 'Inicia sesión para publicar anuncios y chatear con otros vecinos de Poás.'
              : mode === 'register'
              ? 'Crea tu cuenta para publicar anuncios y chatear con otros vecinos del cantón.'
              : mode === 'recover'
              ? 'Recupera el acceso a tu cuenta si olvidaste tu contraseña.'
              : 'Acceso exclusivo para administradores del cantón de Poás.'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs: 3 modos */}
        {mode !== 'recover' && (
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
        )}

        {/* Vista RECUPERAR contraseña */}
        {mode === 'recover' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <KeyRound className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-[#0a3d2e]/80 space-y-2">
                  <p className="font-semibold text-[#0a3d2e]">¿Olvidaste tu contraseña?</p>
                  <p>1. Contacta al administrador de MarketPoás por teléfono o WhatsApp.</p>
                  <p>2. El administrador le asignará una contraseña temporal a tu cuenta desde su panel.</p>
                  <p>3. Entra con esa contraseña temporal y cámbiala en <strong>«Mi cuenta → Cambiar contraseña»</strong>.</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a3d2e]/5 rounded-2xl p-3 text-xs text-[#0a3d2e]/70">
              Consejo: crea una contraseña fácil de recordar para ti, pero difícil de adivinar para otros. Usa letras, números y símbolos.
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setMode('login')}
                className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl shadow-volcano"
              >
                Volver a iniciar sesión
              </Button>
            </DialogFooter>
          </div>
        )}

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
            </div>
            <div>
              <Label htmlFor="loginPassword" className="text-sm font-medium text-[#0a3d2e]">Contraseña</Label>
              <PasswordInput
                id="loginPassword"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="Tu contraseña"
                show={showLoginPassword}
                onToggle={() => setShowLoginPassword(!showLoginPassword)}
              />
              <p className="text-[11px] text-[#0a3d2e]/50 mt-1 flex items-center justify-between">
                <span>¿No tienes cuenta? Toca «Registrarse» arriba.</span>
                <button
                  type="button"
                  onClick={() => setMode('recover')}
                  className="font-semibold text-[#1a6b4a] hover:underline shrink-0"
                >
                  ¿Olvidaste tu contraseña?
                </button>
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
              <Label htmlFor="regPassword" className="text-sm font-medium text-[#0a3d2e]">Crear contraseña *</Label>
              <PasswordInput
                id="regPassword"
                value={regPassword}
                onChange={setRegPassword}
                placeholder="Mínimo 6 caracteres"
                show={showRegPassword}
                onToggle={() => setShowRegPassword(!showRegPassword)}
              />
              <p className="text-[11px] text-[#0a3d2e]/50 mt-1">
                Mínimo 6 caracteres. La usarás para entrar a tu cuenta.
              </p>
            </div>
            <div>
              <Label htmlFor="regPassword2" className="text-sm font-medium text-[#0a3d2e]">Confirmar contraseña *</Label>
              <PasswordInput
                id="regPassword2"
                value={regPassword2}
                onChange={setRegPassword2}
                placeholder="Repite la contraseña"
                show={showRegPassword2}
                onToggle={() => setShowRegPassword2(!showRegPassword2)}
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
          {(mode === 'login' || mode === 'register') && (
            <div>
              <button type="button" onClick={() => setMode('admin')} className="font-semibold text-[#0a3d2e]/70 hover:underline">
                ¿Eres administrador? Entra aquí
              </button>
            </div>
          )}
          {mode === 'recover' && (
            <div>
              <button type="button" onClick={() => setMode('login')} className="font-semibold text-[#1a6b4a] hover:underline">
                ← Volver a entrar
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
