import { NextRequest, NextResponse } from 'next/server'
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

// POST /api/admin/bulletins - Crear aviso del tablón
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { title, body: bulletinBody, type, priority, publishUntilDays } = body
  if (!title?.trim() || !bulletinBody?.trim()) {
    return NextResponse.json({ error: 'Título y cuerpo requeridos' }, { status: 400 })
  }
  if (!['aviso', 'alerta', 'cierre_via', 'actividad', 'ayuda'].includes(type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const publishUntil = publishUntilDays
    ? new Date(Date.now() + Number(publishUntilDays) * 24 * 60 * 60 * 1000)
    : null

  const bulletin = await db.bulletin.create({
    data: {
      title: title.trim(),
      body: bulletinBody.trim(),
      type,
      priority: priority || 'normal',
      author: 'Municipalidad de Poás',
      publishUntil,
    },
  })

  return NextResponse.json({ bulletin }, { status: 201 })
}

// DELETE /api/admin/bulletins?id=xxx - Eliminar aviso
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await db.bulletin.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
