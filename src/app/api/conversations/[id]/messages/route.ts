import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/conversations/[id]/messages - Listar mensajes de una conversación
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const userId = (session.user as any).id

    const conv = await db.conversation.findUnique({
      where: { id },
      include: {
        listing: {
          select: { id: true, title: true, imageUrl: true, price: true, type: true, status: true },
        },
        fromUser: { select: { id: true, name: true, image: true } },
        toUser: { select: { id: true, name: true, image: true } },
      },
    })
    if (!conv) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }
    if (conv.fromUserId !== userId && conv.toUserId !== userId) {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
    }

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    // Marcar mensajes recibidos como leídos
    await db.message.updateMany({
      where: { conversationId: id, toUserId: userId, read: false },
      data: { read: true },
    })

    return NextResponse.json({ conversation: conv, messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

// POST /api/conversations/[id]/messages - Enviar mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const userId = (session.user as any).id
    const body = await request.json()
    const { body: msgBody } = body

    if (!msgBody || msgBody.trim().length === 0) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
    }
    if (msgBody.length > 1000) {
      return NextResponse.json({ error: 'Mensaje muy largo (máx 1000)' }, { status: 400 })
    }

    const conv = await db.conversation.findUnique({ where: { id } })
    if (!conv) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }
    if (conv.fromUserId !== userId && conv.toUserId !== userId) {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
    }

    const toUserId = conv.fromUserId === userId ? conv.toUserId : conv.fromUserId

    const message = await db.message.create({
      data: {
        conversationId: id,
        fromUserId: userId,
        toUserId,
        body: msgBody.trim(),
      },
    })

    // Actualizar última actividad
    await db.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    })

    // Emitir por socket.io si el chat-service lo permite (HTTP interno)
    try {
      await fetch(`http://localhost:3003/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_message',
          room: conv.id,
          payload: message,
        }),
      })
    } catch {}

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}
