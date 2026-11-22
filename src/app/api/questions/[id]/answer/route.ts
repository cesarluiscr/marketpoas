import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/questions/[id]/answer - Responder una pregunta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    const q = await db.question.findUnique({ where: { id } })
    if (!q) return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 })
    if (q.toUserId !== userId) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

    const body = await request.json()
    const { answer } = body
    if (!answer?.trim()) return NextResponse.json({ error: 'Respuesta requerida' }, { status: 400 })

    const updated = await db.question.update({
      where: { id },
      data: { answer: answer.trim(), answeredAt: new Date() },
    })
    return NextResponse.json({ question: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Error al responder' }, { status: 500 })
  }
}
