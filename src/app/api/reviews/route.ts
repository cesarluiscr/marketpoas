import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/reviews?userId=xxx - Ver reseñas de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ reviews: [], average: 0 })

    const reviews = await db.review.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    const average = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0
    return NextResponse.json({ reviews, average })
  } catch {
    return NextResponse.json({ reviews: [], average: 0 })
  }
}

// POST /api/reviews - Crear reseña
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id
    const body = await request.json()
    const { toUserId, rating, comment } = body
    if (!toUserId || !rating) return NextResponse.json({ error: 'toUserId y rating requeridos' }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating debe ser 1-5' }, { status: 400 })
    if (toUserId === userId) return NextResponse.json({ error: 'No puedes reseñarte a ti mismo' }, { status: 400 })

    // Upsert: si ya existe la reseña, la actualiza
    const review = await db.review.upsert({
      where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
      update: { rating: Number(rating), comment: comment?.trim() || null },
      create: { fromUserId: userId, toUserId, rating: Number(rating), comment: comment?.trim() || null },
    })
    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Error al crear reseña' }, { status: 500 })
  }
}
