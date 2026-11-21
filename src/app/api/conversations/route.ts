import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/conversations - Listar conversaciones del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const userId = (session.user as any).id

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        listing: {
          select: { id: true, title: true, imageUrl: true, price: true, status: true },
        },
        fromUser: { select: { id: true, name: true, image: true } },
        toUser: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { body: true, createdAt: true, fromUserId: true, read: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Contar no leídos por conversación
    const result = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await db.message.count({
          where: {
            conversationId: c.id,
            toUserId: userId,
            read: false,
          },
        })
        return { ...c, unreadCount }
      })
    )

    return NextResponse.json({ conversations: result })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Error al obtener conversaciones' }, { status: 500 })
  }
}

// POST /api/conversations - Crear o recuperar conversación sobre un listing
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

    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    }

    // Determinar el "otro" usuario: dueño del listing si existe
    const otherUserId = listing.userId ?? null

    // Si no hay dueño, no se puede chatear (es un listing viejo sin usuario)
    if (!otherUserId) {
      return NextResponse.json({
        error: 'Este anuncio no tiene un usuario dueño asignado. Contacta por WhatsApp/telefono.',
      }, { status: 400 })
    }

    if (otherUserId === userId) {
      return NextResponse.json({ error: 'No puedes chatear con tu propio anuncio' }, { status: 400 })
    }

    // Buscar o crear conversación (única por listing + par de usuarios)
    let conv = await db.conversation.findUnique({
      where: {
        listingId_fromUserId_toUserId: {
          listingId,
          fromUserId: userId,
          toUserId: otherUserId,
        },
      },
    })

    if (!conv) {
      conv = await db.conversation.create({
        data: {
          listingId,
          fromUserId: userId,
          toUserId: otherUserId,
        },
      })
    }

    return NextResponse.json({ conversation: conv }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Error al crear conversación' }, { status: 500 })
  }
}
