import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/listings/[id]/renew - Renovar anuncio (mover al principio)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    if (listing.userId !== userId) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

    // Renovar: actualizar fecha de creación a ahora
    const updated = await db.listing.update({
      where: { id },
      data: { createdAt: new Date() },
    })
    return NextResponse.json({ listing: updated })
  } catch {
    return NextResponse.json({ error: 'Error al renovar' }, { status: 500 })
  }
}
