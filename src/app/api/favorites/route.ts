import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/favorites - Agregar o quitar favorito (toggle)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const userId = (session.user as any).id
    const body = await request.json()
    const { listingId } = body
    if (!listingId) {
      return NextResponse.json({ error: 'listingId requerido' }, { status: 400 })
    }

    const existing = await db.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    }

    await db.favorite.create({ data: { userId, listingId } })
    return NextResponse.json({ favorited: true }, { status: 201 })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// GET /api/favorites?listingId=xxx - Verificar si un anuncio es favorito
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ favorited: false })
    }
    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    if (!listingId) return NextResponse.json({ favorited: false })

    const fav = await db.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })
    return NextResponse.json({ favorited: !!fav })
  } catch {
    return NextResponse.json({ favorited: false })
  }
}
