import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/offers - Listar ofertas recibidas por el usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ offers: [] })
    }
    const userId = (session.user as any).id
    const offers = await db.offer.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        listing: { select: { id: true, title: true, imageUrl: true, price: true, status: true } },
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({ offers: [] })
  }
}

// POST /api/offers - Crear oferta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const userId = (session.user as any).id
    const body = await request.json()
    const { listingId, amount, message } = body
    if (!listingId || !amount) {
      return NextResponse.json({ error: 'listingId y amount requeridos' }, { status: 400 })
    }
    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    if (!listing.userId) return NextResponse.json({ error: 'Anuncio sin dueño' }, { status: 400 })
    if (listing.userId === userId) return NextResponse.json({ error: 'No puedes ofertar en tu propio anuncio' }, { status: 400 })

    const offer = await db.offer.create({
      data: {
        listingId,
        fromUserId: userId,
        toUserId: listing.userId,
        amount: Number(amount),
        message: message?.trim() || null,
      },
    })
    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json({ error: 'Error al crear oferta' }, { status: 500 })
  }
}
