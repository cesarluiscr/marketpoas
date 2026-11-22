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
import { useToast } from '@/hooks/use-toast'
import {
  Shield, CheckCircle2, XCircle, Flag, Megaphone, Calendar,
  Store, Users, Trash2, BadgeCheck, AlertTriangle,
} from 'lucide-react'
import { LOCATIONS } from '@/lib/market'

type Section = 'kyc' | 'reports' | 'bulletins' | 'events' | 'businesses' | 'users'

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
  listing: { id: string; title: string; status: string }
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

export default function AdminTab() {
  const { toast } = useToast()
  const [section, setSection] = useState<Section>('kyc')

  // Estados de cada sección
  const [kycPendientes, setKycPendientes] = useState<KYCPending[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Formularios
  const [bulletinForm, setBulletinForm] = useState({ title: '', body: '', type: 'aviso', priority: 'normal', publishUntilDays: '7' })
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: 'San Pedro', address: '', organizer: 'Municipalidad de Poás', category: 'feria', free: true })
  const [businessForm, setBusinessForm] = useState({ name: '', description: '', category: 'comercio', address: '', phone: '', whatsapp: '', location: 'San Pedro' })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const [kyc, rep, usr] = await Promise.all([
      fetch('/api/admin/kyc').then((r) => r.ok ? r.json() : { pendientes: [] }),
      fetch('/api/admin/reports').then((r) => r.ok ? r.json() : { reports: [] }),
      fetch('/api/admin/users').then((r) => r.ok ? r.json() : { users: [] }),
    ])
    setKycPendientes(kyc.pendientes || [])
    setReports(rep.reports || [])
    setUsers(usr.users || [])
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

  const sections = [
    { id: 'kyc' as Section, label: 'KYC', icon: <BadgeCheck className="h-3.5 w-3.5" />, badge: kycPendientes.length },
    { id: 'reports' as Section, label: 'Denuncias', icon: <Flag className="h-3.5 w-3.5" />, badge: reports.filter(r => r.status === 'pendiente').length },
    { id: 'bulletins' as Section, label: 'Tablón', icon: <Megaphone className="h-3.5 w-3.5" /> },
    { id: 'events' as Section, label: 'Eventos', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'businesses' as Section, label: 'Comercios', icon: <Store className="h-3.5 w-3.5" /> },
    { id: 'users' as Section, label: 'Usuarios', icon: <Users className="h-3.5 w-3.5" /> },
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
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-[#0a3d2e]">{k.name || k.email}</div>
                        <div className="text-xs text-[#0a3d2e]/60">{k.email}</div>
                        <div className="text-[10px] text-[#0a3d2e]/50 mt-1">
                          Enviado: {new Date(k.kycSubmittedAt!).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a href={k.kycIdImage} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 text-xs border-[#0a3d2e]/15 text-[#0a3d2e] rounded-lg">
                              Ver cédula
                            </Button>
                          </a>
                          <a href={k.kycSelfieImage} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 text-xs border-[#0a3d2e]/15 text-[#0a3d2e] rounded-lg">
                              Ver selfie
                            </Button>
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
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
                        <div className="font-semibold text-sm text-[#0a3d2e]">{r.listing.title}</div>
                        {r.details && <p className="text-xs text-[#0a3d2e]/70 mt-1">"{r.details}"</p>}
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

          {/* TABLÓN - Crear aviso */}
          {section === 'bulletins' && (
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
          )}

          {/* EVENTOS - Crear evento */}
          {section === 'events' && (
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
          )}

          {/* COMERCIOS - Agregar */}
          {section === 'businesses' && (
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
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
