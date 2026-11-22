import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/notifications - Listar notificaciones del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 })
    const userId = (session.user as any).id

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const unread = await db.notification.count({
      where: { userId, read: false },
    })

    return NextResponse.json({ notifications, unread })
  } catch {
    return NextResponse.json({ notifications: [], unread: 0 })
  }
}

// PATCH /api/notifications - Marcar todas como leídas
export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = (session.user as any).id

    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
