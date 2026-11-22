import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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

// GET /api/admin/reports - Listar todas las denuncias
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const reports = await db.report.findMany({
    include: {
      listing: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ reports })
}

// PATCH /api/admin/reports - Actualizar estado de denuncia
export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { reportId, status } = body
  if (!reportId || !['revisado', 'descartado'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const updated = await db.report.update({
    where: { id: reportId },
    data: { status },
  })

  return NextResponse.json({ ok: true, report: updated })
}
