import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/listings/[id] - Detalle con datos del vendedor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, image: true, phone: true },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Error al obtener anuncio' }, { status: 500 })
  }
}

// DELETE /api/listings/[id] - Solo el dueño puede borrar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    }
    if (listing.userId && listing.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 })
    }

    await db.listing.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

// PATCH /api/listings/[id] - Cambiar estado (activo / vendido / pausado)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    }
    if (listing.userId && listing.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body
    if (!['activo', 'vendido', 'pausado'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ listing: updated })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
