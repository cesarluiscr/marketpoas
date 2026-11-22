import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/saved-searches - Listar búsquedas guardadas
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ searches: [] })
    const userId = (session.user as any).id
    const searches = await db.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ searches })
  } catch {
    return NextResponse.json({ searches: [] })
  }
}

// POST /api/saved-searches - Guardar una búsqueda
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id
    const body = await request.json()
    const { name, search, type, category, location, minPrice, maxPrice } = body
    if (!name?.trim()) return NextResponse.json({ error: 'name requerido' }, { status: 400 })

    const saved = await db.savedSearch.create({
      data: {
        userId,
        name: name.trim(),
        search: search?.trim() || null,
        type: type || null,
        category: category || null,
        location: location || null,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
      },
    })
    return NextResponse.json({ search: saved }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar búsqueda' }, { status: 500 })
  }
}
