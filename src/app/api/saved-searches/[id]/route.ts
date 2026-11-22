import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/saved-searches/[id] - Eliminar búsqueda guardada
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    const search = await db.savedSearch.findUnique({ where: { id } })
    if (!search) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    if (search.userId !== userId) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

    await db.savedSearch.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
