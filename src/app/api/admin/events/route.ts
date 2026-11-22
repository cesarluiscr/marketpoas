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

// POST /api/admin/events - Crear evento del cantón
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const {
    title, description, date, endDate, location, address,
    organizer, category, free,
  } = body

  if (!title?.trim() || !date) {
    return NextResponse.json({ error: 'Título y fecha requeridos' }, { status: 400 })
  }
  if (!['feria', 'tope', 'fiesta_civica', 'cultural', 'deportivo', 'religioso'].includes(category)) {
    return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 })
  }

  const event = await db.event.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location: location || null,
      address: address?.trim() || null,
      organizer: organizer?.trim() || 'Municipalidad de Poás',
      category,
      free: Boolean(free ?? true),
    },
  })

  return NextResponse.json({ event }, { status: 201 })
}

// DELETE /api/admin/events?id=xxx - Eliminar evento
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await db.event.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
