import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/me/listings - Listar los anuncios del usuario logueado
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const userId = (session.user as any).id
    const listings = await db.listing.findMany({
      where: {
        OR: [
          { userId },
          // Si publicó sin sesión, también mostramos los que coinciden por contacto
          { userId: null, contactPhone: session.user.name ?? '' },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching my listings:', error)
    return NextResponse.json({ error: 'Error al obtener tus anuncios' }, { status: 500 })
  }
}
