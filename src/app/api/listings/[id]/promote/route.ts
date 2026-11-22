import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/listings/[id]/promote - Promocionar anuncio (gratis, 7 días)
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

    const until = new Date()
    until.setDate(until.getDate() + 7) // 7 días

    const updated = await db.listing.update({
      where: { id },
      data: { promoted: true, promotedUntil: until },
    })
    return NextResponse.json({ listing: updated })
  } catch {
    return NextResponse.json({ error: 'Error al promocionar' }, { status: 500 })
  }
}
