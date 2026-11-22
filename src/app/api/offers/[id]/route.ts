import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH /api/offers/[id] - Aceptar o rechazar oferta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    const offer = await db.offer.findUnique({ where: { id } })
    if (!offer) return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 })
    if (offer.toUserId !== userId) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

    const body = await request.json()
    const { status } = body
    if (!['aceptada', 'rechazada'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const updated = await db.offer.update({ where: { id }, data: { status } })
    return NextResponse.json({ offer: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
