import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/me/unread - Contar mensajes no leídos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ unread: 0 })
    }
    const userId = (session.user as any).id
    const unread = await db.message.count({
      where: { toUserId: userId, read: false },
    })
    return NextResponse.json({ unread })
  } catch (error) {
    return NextResponse.json({ unread: 0 })
  }
}
