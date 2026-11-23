'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Shield, CheckCircle2, XCircle, Flag, Megaphone, Calendar,
  Store, Users, Trash2, BadgeCheck, AlertTriangle, BarChart3,
  TrendingUp, Clock, MessageCircle, Star, KeyRound, Eye, EyeOff,
} from 'lucide-react'
import { LOCATIONS } from '@/lib/market'

type Section = 'overview' | 'kyc' | 'reports' | 'bulletins' | 'events' | 'businesses' | 'users'

type KYCPending = {
  id: string
  email: string
  name: string | null
  kycIdImage: string
  kycSelfieImage: string
  kycSubmittedAt: string
}

type Report = {
  id: string
  reason: string
  details: string | null
  status: string
  createdAt: string
  listing: { id: string; title: string; status: string } | null
}

type User = {
  id: string
  email: string | null
  name: string | null
  role: string
  kycStatus: string
  createdAt: string
  _count: { listings: number }
}

type Bulletin = {
  id: string
  title: string
  body: string
  type: string
  priority: string
  author: string
  createdAt: string
  publishUntil: string | null
}

type EventItem = {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  address: string | null
  organizer: string | null
  category: string
  free: boolean
}

type Business = {
  id: string
  name: string
  description: string | null
  category: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  location: string | null
  verified: boolean
}

type Stats = {
  totalUsers: number
  verifiedUsers: number
  pendingKyc: number
  totalListings: number
  activeListings: number
  totalBusinesses: number
  verifiedBusinesses: number
  totalEvents: number
  totalBulletins: number
  pendingReports: number
  reviewedReports: number
  totalOffers: number
  pendingOffers: number
  totalQuestions: number
  unansweredQuestions: number
  totalReviews: number
}

export default function AdminTab() {
  const { toast } = useToast()
  const [section, setSection] = useState<Section>('overview')

  // Estados de cada sección
  const [stats, setStats] = useState<Stats | null>(null)
  const [kycPendientes, setKycPendientes] = useState<KYCPending[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])

  // Formularios
  const [bulletinForm, setBulletinForm] = useState({ title: '', body: '', type: 'aviso', priority: 'normal', publishUntilDays: '7' })
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: 'San Pedro', address: '', organizer: 'Municipalidad de Poás', category: 'feria', free: true })
  const [businessForm, setBusinessForm] = useState({ name: '', description: '', category: 'comercio', address: '', phone: '', whatsapp: '', location: 'San Pedro' })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const [st, kyc, rep, usr, blts, evts, biz] = await Promise.all([
      fetch('/api/admin/stats').then((r) => r.ok ? r.json() : null),
      fetch('/api/admin/kyc').then((r) => r.ok ? r.json() : { pendientes: [] }),
      fetch('/api/admin/reports').then((r) => r.ok ? r.json() : { reports: [] }),
      fetch('/api/admin/users').then((r) => r.ok ? r.json() : { users: [] }),
      fetch('/api/admin/bulletins').then((r) => r.ok ? r.json() : { bulletins: [] }),
      fetch('/api/admin/events').then((r) => r.ok ? r.json() : { events: [] }),
      fetch('/api/admin/businesses').then((r) => r.ok ? r.json() : { businesses: [] }),
    ])
    setStats(st)
    setKycPendientes(kyc.pendientes || [])
    setReports(rep.reports || [])
    setUsers(usr.users || [])
    setBulletins(blts.bulletins || [])
    setEvents(evts.events || [])
    setBusinesses(biz.businesses || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleKycAction = async (userId: string, action: 'verificado' | 'rechazado') => {
    const rejectReason = action === 'rechazado' ? prompt('Motivo del rechazo (opcional):') || undefined : undefined
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, rejectReason }),
      })
      if (res.ok) {
        toast({ title: action === 'verificado' ? 'KYC aprobado ✅' : 'KYC rechazado' })
        fetchAll()
      }
    } catch {}
  }

  const handleReportAction = async (reportId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      })
      if (res.ok) {
        toast({ title: status === 'revisado' ? 'Denuncia revisada' : 'Denuncia descartada' })
        fetchAll()
      }
    } catch {}
  }

  const handleBulletinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulletinForm),
      })
      if (res.ok) {
        toast({ title: 'Aviso publicado en el tablón' })
        setBulletinForm({ title: '', body: '', type: 'aviso', priority: 'normal', publishUntilDays: '7' })
        fetchAll()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      })
      if (res.ok) {
        toast({ title: 'Evento creado' })
        setEventForm({ title: '', description: '', date: '', location: 'San Pedro', address: '', organizer: 'Municipalidad de Poás', category: 'feria', free: true })
        fetchAll()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessForm),
      })
      if (res.ok) {
        toast({ title: 'Comercio agregado y verificado ✅' })
        setBusinessForm({ name: '', description: '', category: 'comercio', address: '', phone: '', whatsapp: '', location: 'San Pedro' })
        fetchAll()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUserRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (res.ok) {
        toast({ title: `Usuario ahora es ${role === 'admin' ? 'admin' : 'vecino'}` })
        fetchAll()
      }
    } catch {}
  }

  // Restablecer contraseña de un usuario
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [resetPass, setResetPass] = useState('')
  const [resetPass2, setResetPass2] = useState('')
  const [showResetPass, setShowResetPass] = useState(false)
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const openResetPassword = (u: User) => {
    setResetUser(u)
    setResetPass('')
    setResetPass2('')
    setShowResetPass(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetUser) return
    if (!resetPass || resetPass.length < 6) {
      toast({ title: 'Contraseña muy corta', description: 'Mínimo 6 caracteres', variant: 'destructive' })
      return
    }
    if (resetPass !== resetPass2) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }
    setResetSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetUser.id, newPassword: resetPass }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'No se pudo restablecer', description: data.error, variant: 'destructive' })
        return
      }
      toast({
        title: 'Contraseña restablecida',
        description: `Comunícale a ${resetUser.name || resetUser.email} su nueva contraseña para que entre y la cambie.`,
      })
      setResetUser(null)
    } catch {
      toast({ title: 'Error de red', variant: 'destructive' })
    } finally {
      setResetSubmitting(false)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`¿Eliminar ${type}?`)) return
    try {
      const res = await fetch(`/api/admin/${type}?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Eliminado' })
        fetchAll()
      }
    } catch {}
  }

  const handleBusinessVerify = async (id: string, verified: boolean) => {
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: id, verified }),
      })
      if (res.ok) {
        toast({ title: verified ? 'Comercio verificado ✓' : 'Verificación quitada' })
        fetchAll()
      }
    } catch {}
  }

  const sections = [
    { id: 'overview' as Section, label: 'Resumen', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'kyc' as Section, label: 'KYC', icon: <BadgeCheck className="h-3.5 w-3.5" />, badge: kycPendientes.length },
    { id: 'reports' as Section, label: 'Denuncias', icon: <Flag className="h-3.5 w-3.5" />, badge: reports.filter(r => r.status === 'pendiente').length },
    { id: 'bulletins' as Section, label: 'Tablón', icon: <Megaphone className="h-3.5 w-3.5" />, badge: bulletins.length },
    { id: 'events' as Section, label: 'Eventos', icon: <Calendar className="h-3.5 w-3.5" />, badge: events.length },
    { id: 'businesses' as Section, label: 'Comercios', icon: <Store className="h-3.5 w-3.5" />, badge: businesses.length },
    { id: 'users' as Section, label: 'Usuarios', icon: <Users className="h-3.5 w-3.5" />, badge: users.length },
  ]

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#0a3d2e] flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#0a3d2e]" />
          Panel de administrador
        </h2>
        <p className="text-sm text-[#0a3d2e]/60">Gestión del cantón de Poás</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 bg-[#0a3d2e]/5 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              section === s.id ? 'bg-white text-[#0a3d2e] shadow-sm' : 'text-[#0a3d2e]/60 hover:text-[#0a3d2e]'
            }`}
          >
            {s.icon}
            {s.label}
            {s.badge !== undefined && s.badge > 0 && (
              <span className="bg-[#c2185b] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* RESUMEN (estadísticas) */}
          {section === 'overview' && stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={<Users className="h-5 w-5" />} value={stats.totalUsers} label="Usuarios" sublabel={`${stats.verifiedUsers} verificados`} color="forest" />
                <StatCard icon={<BadgeCheck className="h-5 w-5" />} value={stats.pendingKyc} label="KYC pendientes" color="gold" />
                <StatCard icon={<TrendingUp className="h-5 w-5" />} value={stats.activeListings} label="Anuncios activos" color="forest" />
                <StatCard icon={<Flag className="h-5 w-5" />} value={stats.pendingReports} label="Denuncias" color="strawberry" />
                <StatCard icon={<Store className="h-5 w-5" />} value={stats.totalBusinesses} label="Comercios" sublabel={`${stats.verifiedBusinesses} verificados`} color="forest" />
                <StatCard icon={<Calendar className="h-5 w-5" />} value={stats.totalEvents} label="Eventos" color="gold" />
                <StatCard icon={<Megaphone className="h-5 w-5" />} value={stats.totalBulletins} label="Avisos" color="strawberry" />
                <StatCard icon={<MessageCircle className="h-5 w-5" />} value={stats.unansweredQuestions} label="Preguntas sin responder" color="forest" />
              </div>
              <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
                <div className="text-sm font-semibold text-[#0a3d2e] mb-2">Resumen completo</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <StatLine label="Ofertas pendientes" value={stats.pendingOffers} total={stats.totalOffers} />
                  <StatLine label="Preguntas sin respuesta" value={stats.unansweredQuestions} total={stats.totalQuestions} />
                  <StatLine label="Denuncias revisadas" value={stats.reviewedReports} total={stats.pendingReports + stats.reviewedReports} />
                  <StatLine label="Reseñas totales" value={stats.totalReviews} />
                  <StatLine label="Usuarios verificados" value={stats.verifiedUsers} total={stats.totalUsers} />
                  <StatLine label="Comercios verificados" value={stats.verifiedBusinesses} total={stats.totalBusinesses} />
                </div>
              </Card>
            </div>
          )}

          {/* KYC */}
          {section === 'kyc' && (
            <div className="space-y-3">
              {kycPendientes.length === 0 ? (
                <div className="text-center py-12 text-[#0a3d2e]/60">
                  <BadgeCheck className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  No hay KYCs pendientes de revisión.
                </div>
              ) : (
                kycPendientes.map((k) => (
                  <Card key={k.id} className="p-4 border-[#0a3d2e]/10 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-[#0a3d2e]">{k.name || k.email}</div>
                        <div className="text-xs text-[#0a3d2e]/60">{k.email}</div>
                        <div className="text-[10px] text-[#0a3d2e]/50 mt-1">
                          Enviado: {new Date(k.kycSubmittedAt!).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleKycAction(k.id, 'verificado')}
                          className="bg-[#1a6b4a] hover:bg-[#0a3d2e] text-white rounded-lg h-9 text-xs gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleKycAction(k.id, 'rechazado')}
                          className="border-red-500/30 text-red-600 hover:bg-red-50 rounded-lg h-9 text-xs gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Rechazar
                        </Button>
                      </div>
                    </div>
                    {/* Fotos grandes */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-[10px] font-semibold text-[#0a3d2e]/60 uppercase tracking-wide mb-1.5">Cédula</div>
                        <a href={k.kycIdImage} target="_blank" rel="noopener noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={k.kycIdImage}
                            alt="Cédula"
                            className="w-full h-40 object-cover rounded-xl border border-[#0a3d2e]/15 hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-[#0a3d2e]/60 uppercase tracking-wide mb-1.5">Selfie con cédula</div>
                        <a href={k.kycSelfieImage} target="_blank" rel="noopener noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={k.kycSelfieImage}
                            alt="Selfie"
                            className="w-full h-40 object-cover rounded-xl border border-[#0a3d2e]/15 hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* DENUNCIAS */}
          {section === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-[#0a3d2e]/60">
                  <Flag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  No hay denuncias registradas.
                </div>
              ) : (
                reports.map((r) => (
                  <Card key={r.id} className="p-4 border-[#0a3d2e]/10 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-red-100 text-red-700 border-0 text-[10px] px-2 py-0.5 rounded-full">
                            {r.reason}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                            r.status === 'pendiente' ? 'border-amber-500/30 text-amber-700 bg-amber-50'
                            : 'border-[#0a3d2e]/15 text-[#0a3d2e]/60'
                          }`}>
                            {r.status}
                          </Badge>
                        </div>
                        <div className="font-semibold text-sm text-[#0a3d2e]">{r.listing?.title || '(Anuncio eliminado)'}</div>
                        {r.details && <p className="text-xs text-[#0a3d2e]/70 mt-1">&quot;{r.details}&quot;</p>}
                        <div className="text-[10px] text-[#0a3d2e]/50 mt-1">
                          {new Date(r.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      {r.status === 'pendiente' && (
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleReportAction(r.id, 'revisado')}
                            className="bg-[#1a6b4a] hover:bg-[#0a3d2e] text-white rounded-lg h-8 text-xs gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Marcar revisado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(r.id, 'descartado')}
                            className="border-[#0a3d2e]/15 text-[#0a3d2e] rounded-lg h-8 text-xs"
                          >
                            Descartar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TABLÓN - crear + lista */}
          {section === 'bulletins' && (
            <div className="space-y-3">
              <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
                <form onSubmit={handleBulletinSubmit} className="space-y-3">
                  <div className="text-sm font-semibold text-[#0a3d2e] flex items-center gap-1.5">
                    <Megaphone className="h-4 w-4 text-[#1a6b4a]" />
                    Publicar aviso en el tablón municipal
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Título *</Label>
                    <Input
                      value={bulletinForm.title}
                      onChange={(e) => setBulletinForm({ ...bulletinForm, title: e.target.value })}
                      placeholder="Ej: Cierre de ruta por mantenimiento"
                      required
                      className="mt-1 rounded-xl border-[#0a3d2e]/15 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Mensaje *</Label>
                    <Textarea
                      value={bulletinForm.body}
                      onChange={(e) => setBulletinForm({ ...bulletinForm, body: e.target.value })}
                      placeholder="Escribe el aviso completo..."
                      rows={3}
                      required
                      className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Tipo</Label>
                      <Select value={bulletinForm.type} onValueChange={(v) => setBulletinForm({ ...bulletinForm, type: v })}>
                        <SelectTrigger className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aviso">Aviso</SelectItem>
                          <SelectItem value="alerta">Alerta</SelectItem>
                          <SelectItem value="cierre_via">Cierre de vía</SelectItem>
                          <SelectItem value="actividad">Actividad</SelectItem>
                          <SelectItem value="ayuda">Ayuda social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Prioridad</Label>
                      <Select value={bulletinForm.priority} onValueChange={(v) => setBulletinForm({ ...bulletinForm, priority: v })}>
                        <SelectTrigger className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Días visible</Label>
                      <Input
                        type="number"
                        value={bulletinForm.publishUntilDays}
                        onChange={(e) => setBulletinForm({ ...bulletinForm, publishUntilDays: e.target.value })}
                        min="1"
                        max="365"
                        className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl gap-1.5">
                    <Megaphone className="h-4 w-4" />
                    {submitting ? 'Publicando...' : 'Publicar aviso'}
                  </Button>
                </form>
              </Card>

              {/* Lista de avisos existentes */}
              {bulletins.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#0a3d2e] mt-3">Avisos publicados ({bulletins.length})</div>
                  {bulletins.map((b) => (
                    <Card key={b.id} className="p-3 border-[#0a3d2e]/10 rounded-2xl flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full capitalize">{b.type}</Badge>
                          {b.priority !== 'normal' && (
                            <Badge className={`text-[10px] px-2 py-0.5 rounded-full border-0 ${b.priority === 'urgente' ? 'bg-red-600 text-white' : 'bg-[#d4a017] text-white'}`}>
                              {b.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="font-semibold text-sm text-[#0a3d2e]">{b.title}</div>
                        <div className="text-xs text-[#0a3d2e]/70 line-clamp-1 mt-0.5">{b.body}</div>
                        <div className="text-[10px] text-[#0a3d2e]/50 mt-1">
                          {new Date(b.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {b.publishUntil && ` · vence ${new Date(b.publishUntil).toLocaleDateString('es-CR')}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete('bulletins', b.id)}
                        className="text-red-600 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENTOS - crear + lista */}
          {section === 'events' && (
            <div className="space-y-3">
              <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
                <form onSubmit={handleEventSubmit} className="space-y-3">
                  <div className="text-sm font-semibold text-[#0a3d2e] flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#1a6b4a]" />
                    Crear evento del cantón
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Nombre del evento *</Label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Ej: Feria del Agricultor Poás"
                      required
                      className="mt-1 rounded-xl border-[#0a3d2e]/15 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Descripción</Label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Describe el evento..."
                      rows={2}
                      className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Fecha y hora *</Label>
                      <Input
                        type="datetime-local"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                        className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Categoría</Label>
                      <Select value={eventForm.category} onValueChange={(v) => setEventForm({ ...eventForm, category: v })}>
                        <SelectTrigger className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feria">Feria</SelectItem>
                          <SelectItem value="tope">Tope</SelectItem>
                          <SelectItem value="fiesta_civica">Fiestas cívicas</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="deportivo">Deportivo</SelectItem>
                          <SelectItem value="religioso">Religioso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Distrito</Label>
                      <Select value={eventForm.location} onValueChange={(v) => setEventForm({ ...eventForm, location: v })}>
                        <SelectTrigger className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Organiza</Label>
                      <Input
                        value={eventForm.organizer}
                        onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                        className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Dirección</Label>
                    <Input
                      value={eventForm.address}
                      onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                      placeholder="Ej: Plaza de Deportes de San Pedro"
                      className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {submitting ? 'Creando...' : 'Crear evento'}
                  </Button>
                </form>
              </Card>

              {events.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#0a3d2e] mt-3">Eventos ({events.length})</div>
                  {events.map((e) => (
                    <Card key={e.id} className="p-3 border-[#0a3d2e]/10 rounded-2xl flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#0a3d2e]/10 text-[#0a3d2e] border-0 text-[10px] px-2 py-0.5 rounded-full capitalize">{e.category}</Badge>
                          {e.free && <Badge className="bg-[#1a6b4a] text-white border-0 text-[10px] px-2 py-0.5 rounded-full">Gratis</Badge>}
                        </div>
                        <div className="font-semibold text-sm text-[#0a3d2e]">{e.title}</div>
                        <div className="text-[10px] text-[#0a3d2e]/60 mt-0.5">
                          {new Date(e.date).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          {e.address && ` · ${e.address}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete('events', e.id)}
                        className="text-red-600 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMERCIOS - crear + lista */}
          {section === 'businesses' && (
            <div className="space-y-3">
              <Card className="p-4 border-[#0a3d2e]/10 rounded-2xl">
                <form onSubmit={handleBusinessSubmit} className="space-y-3">
                  <div className="text-sm font-semibold text-[#0a3d2e] flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-[#1a6b4a]" />
                    Agregar comercio local
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Nombre del comercio *</Label>
                    <Input
                      value={businessForm.name}
                      onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                      placeholder="Ej: Pulpería La Esquina"
                      required
                      className="mt-1 rounded-xl border-[#0a3d2e]/15 h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Descripción</Label>
                    <Textarea
                      value={businessForm.description}
                      onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                      placeholder="¿Qué vende o qué servicios ofrece?"
                      rows={2}
                      className="mt-1 resize-none rounded-xl border-[#0a3d2e]/15 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Tipo</Label>
                      <Select value={businessForm.category} onValueChange={(v) => setBusinessForm({ ...businessForm, category: v })}>
                        <SelectTrigger className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comercio">Comercio</SelectItem>
                          <SelectItem value="restaurante">Restaurante</SelectItem>
                          <SelectItem value="servicios">Servicios</SelectItem>
                          <SelectItem value="feria">Finca/Feria</SelectItem>
                          <SelectItem value="taller">Taller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Distrito</Label>
                      <Select value={businessForm.location} onValueChange={(v) => setBusinessForm({ ...businessForm, location: v })}>
                        <SelectTrigger className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[#0a3d2e]">Dirección</Label>
                    <Input
                      value={businessForm.address}
                      onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                      placeholder="Ej: 200m este del parque"
                      className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">Teléfono</Label>
                      <Input
                        value={businessForm.phone}
                        onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                        placeholder="2448-1234"
                        className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#0a3d2e]">WhatsApp</Label>
                      <Input
                        value={businessForm.whatsapp}
                        onChange={(e) => setBusinessForm({ ...businessForm, whatsapp: e.target.value })}
                        placeholder="50688881234"
                        className="mt-1 rounded-lg border-[#0a3d2e]/15 h-9 text-xs"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl gap-1.5">
                    <Store className="h-4 w-4" />
                    {submitting ? 'Agregando...' : 'Agregar y verificar comercio'}
                  </Button>
                </form>
              </Card>

              {businesses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[#0a3d2e] mt-3">Comercios ({businesses.length})</div>
                  {businesses.map((b) => (
                    <Card key={b.id} className="p-3 border-[#0a3d2e]/10 rounded-2xl flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-sm text-[#0a3d2e]">{b.name}</div>
                          {b.verified && <BadgeCheck className="h-4 w-4 text-[#1a6b4a] shrink-0" />}
                        </div>
                        <Badge className="bg-[#0a3d2e]/10 text-[#0a3d2e] border-0 text-[10px] px-2 py-0.5 rounded-full capitalize">{b.category}</Badge>
                        {b.address && <div className="text-[10px] text-[#0a3d2e]/60 mt-1">{b.address}</div>}
                        {b.location && <div className="text-[10px] text-[#0a3d2e]/40">{b.location}</div>}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBusinessVerify(b.id, !b.verified)}
                          className={`h-7 text-xs rounded-lg ${b.verified ? 'border-amber-500/30 text-amber-700 hover:bg-amber-50' : 'border-[#1a6b4a]/30 text-[#1a6b4a] hover:bg-[#1a6b4a]/5'}`}
                        >
                          {b.verified ? 'Quitar ✓' : 'Verificar ✓'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete('businesses', b.id)}
                          className="text-red-600 hover:bg-red-50 h-7 w-full text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USUARIOS */}
          {section === 'users' && (
            <div className="space-y-2">
              {users.length === 0 ? (
                <div className="text-center py-12 text-[#0a3d2e]/60">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  No hay usuarios registrados todavía.
                </div>
              ) : (
                users.map((u) => (
                  <Card key={u.id} className="p-3 border-[#0a3d2e]/10 rounded-2xl flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a6b4a] to-[#0a3d2e] text-white flex items-center justify-center font-semibold shrink-0">
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#0a3d2e] truncate">{u.name || u.email}</div>
                      <div className="text-xs text-[#0a3d2e]/60 truncate">{u.email}</div>
                      <div className="flex items-center gap-1 text-[10px] text-[#0a3d2e]/50 mt-0.5">
                        <Badge className={`text-[9px] px-1.5 py-0 rounded-full border-0 ${
                          u.role === 'admin' ? 'bg-[#0a3d2e] text-white' : 'bg-[#0a3d2e]/10 text-[#0a3d2e]/70'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : 'Vecino'}
                        </Badge>
                        {u.kycStatus === 'verificado' && (
                          <Badge className="bg-[#1a6b4a] text-white border-0 text-[9px] px-1.5 py-0 rounded-full">✓ Verificado</Badge>
                        )}
                        {u.kycStatus === 'pendiente' && (
                          <Badge className="bg-amber-500 text-white border-0 text-[9px] px-1.5 py-0 rounded-full">Pendiente</Badge>
                        )}
                        <span className="text-[#0a3d2e]/40">{u._count.listings} anuncios</span>
                      </div>
                    </div>
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleUserRoleChange(u.id, v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-24 rounded-lg border-[#0a3d2e]/15 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vecino">Vecino</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetPassword(u)}
                      title="Restablecer contraseña"
                      className="h-8 w-8 p-0 rounded-lg border-[#0a3d2e]/15 text-[#0a3d2e]/70 hover:text-[#0a3d2e] hover:bg-[#0a3d2e]/5 shrink-0"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Diálogo: restablecer contraseña de un usuario */}
      <Dialog open={!!resetUser} onOpenChange={(v) => !v && setResetUser(null)}>
        <DialogContent className="max-w-sm rounded-3xl border-[#0a3d2e]/15" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#0a3d2e] flex items-center gap-2 text-xl">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              Restablecer contraseña
            </DialogTitle>
            <DialogDescription className="text-[#0a3d2e]/70">
              Define una contraseña temporal para <strong>{resetUser?.name || resetUser?.email}</strong>. Comunícasela por teléfono o WhatsApp para que entre y la cambie en «Mi cuenta».
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div>
              <Label htmlFor="resetPass" className="text-sm font-medium text-[#0a3d2e]">Nueva contraseña temporal</Label>
              <div className="relative mt-1">
                <Input
                  id="resetPass"
                  type={showResetPass ? 'text' : 'password'}
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPass(!showResetPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a3d2e]/50 hover:text-[#0a3d2e]"
                  tabIndex={-1}
                  aria-label={showResetPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showResetPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="resetPass2" className="text-sm font-medium text-[#0a3d2e]">Confirmar contraseña</Label>
              <Input
                id="resetPass2"
                type="password"
                value={resetPass2}
                onChange={(e) => setResetPass2(e.target.value)}
                placeholder="Repite la contraseña"
                required
                minLength={6}
                className="mt-1 rounded-xl border-[#0a3d2e]/15 focus-visible:ring-[#1a6b4a]"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={resetSubmitting}
                className="w-full bg-gradient-to-br from-[#0a3d2e] to-[#1a6b4a] hover:from-[#062920] hover:to-[#0a3d2e] text-white rounded-xl shadow-volcano"
              >
                {resetSubmitting ? 'Restableciendo...' : 'Restablecer contraseña'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function StatCard({ icon, value, label, sublabel, color }: { icon: React.ReactNode; value: number; label: string; sublabel?: string; color: 'forest' | 'gold' | 'strawberry' }) {
  const colors = {
    forest: 'bg-[#1a6b4a]/15 text-[#1a6b4a]',
    gold: 'bg-[#d4a017]/15 text-[#d4a017]',
    strawberry: 'bg-[#c2185b]/15 text-[#c2185b]',
  }
  return (
    <div className="bg-[#fdf9ee] rounded-2xl p-4 border border-[#0a3d2e]/8 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl ${colors[color]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-[#0a3d2e]">{value}</div>
        <div className="text-[10px] text-[#0a3d2e]/60 uppercase tracking-wide truncate">{label}</div>
        {sublabel && <div className="text-[10px] text-[#0a3d2e]/50 truncate">{sublabel}</div>}
      </div>
    </div>
  )
}

function StatLine({ label, value, total }: { label: string; value: number; total?: number }) {
  return (
    <div className="bg-[#fdf9ee] rounded-lg p-2 border border-[#0a3d2e]/8">
      <div className="text-[10px] text-[#0a3d2e]/60 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-bold text-[#0a3d2e]">
        {value}{total !== undefined && <span className="text-[10px] text-[#0a3d2e]/50 font-normal"> / {total}</span>}
      </div>
    </div>
  )
}
