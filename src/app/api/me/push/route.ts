import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/me/push - Suscribirse a notificaciones push
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    const body = await request.json()
    const { subscription } = body
    if (!subscription) return NextResponse.json({ error: 'Suscripción requerida' }, { status: 400 })

    await db.user.update({
      where: { id: userId },
      data: { pushSubscription: JSON.stringify(subscription) },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Push subscription error:', error)
    return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 })
  }
}

// DELETE /api/me/push - Cancelar suscripción
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    await db.user.update({
      where: { id: userId },
      data: { pushSubscription: null },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al cancelar' }, { status: 500 })
  }
}
