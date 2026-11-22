import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/me/theme - Guardar preferencia de tema
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { theme } = body
    if (!['light', 'dark'].includes(theme)) {
      return NextResponse.json({ error: 'Tema inválido' }, { status: 400 })
    }

    if (session?.user) {
      const userId = (session.user as any).id
      await db.user.update({
        where: { id: userId },
        data: { theme },
      })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al guardar tema' }, { status: 500 })
  }
}
