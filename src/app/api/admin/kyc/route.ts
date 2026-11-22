import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Helper para verificar admin
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true },
  })
  if (user?.role !== 'admin') return null
  return session
}

// GET /api/admin/kyc - Listar KYCs pendientes
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const pendientes = await db.user.findMany({
    where: { kycStatus: 'pendiente' },
    select: {
      id: true, email: true, name: true,
      kycIdImage: true, kycSelfieImage: true, kycSubmittedAt: true,
    },
    orderBy: { kycSubmittedAt: 'asc' },
  })

  return NextResponse.json({ pendientes })
}

// PATCH /api/admin/kyc - Aprobar o rechazar KYC
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { userId, action, rejectReason } = body
  if (!userId || !['verificado', 'rechazado'].includes(action)) {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      kycStatus: action,
      kycReviewedAt: new Date(),
      kycRejectReason: action === 'rechazado' ? (rejectReason || 'Rechazado por el administrador') : null,
    },
  })

  return NextResponse.json({ ok: true, user: { id: updated.id, kycStatus: updated.kycStatus } })
}
