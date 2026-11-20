import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/listings/[id] - Obtener un anuncio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await db.listing.findUnique({ where: { id } })

    if (!listing) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Error al obtener anuncio' },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] - Eliminar anuncio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.listing.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Error al eliminar anuncio' },
      { status: 500 }
    )
  }
}
