import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/favorites/list - Listar anuncios favoritos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ listings: [] })
    }
    const userId = (session.user as any).id
    const favs = await db.favorite.findMany({
      where: { userId },
      include: { listing: true },
      orderBy: { createdAt: 'desc' },
    })
    const listings = favs
      .filter((f) => f.listing && f.listing.status === 'activo')
      .map((f) => f.listing)
    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ listings: [] })
  }
}
