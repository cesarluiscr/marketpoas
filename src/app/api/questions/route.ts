import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/questions?listingId=xxx - Listar preguntas de un anuncio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    if (!listingId) return NextResponse.json({ questions: [] })

    const questions = await db.question.findMany({
      where: { listingId },
      include: {
        fromUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ questions })
  } catch {
    return NextResponse.json({ questions: [] })
  }
}

// POST /api/questions - Hacer pregunta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id
    const body = await request.json()
    const { listingId, body: questionBody } = body
    if (!listingId || !questionBody?.trim()) {
      return NextResponse.json({ error: 'listingId y body requeridos' }, { status: 400 })
    }
    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    if (!listing.userId) return NextResponse.json({ error: 'Anuncio sin dueño' }, { status: 400 })
    if (listing.userId === userId) return NextResponse.json({ error: 'No puedes preguntar en tu propio anuncio' }, { status: 400 })

    const q = await db.question.create({
      data: {
        listingId,
        fromUserId: userId,
        toUserId: listing.userId,
        body: questionBody.trim(),
      },
      include: { fromUser: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ question: q }, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Error al crear pregunta' }, { status: 500 })
  }
}
