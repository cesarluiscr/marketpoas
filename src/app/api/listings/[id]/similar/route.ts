import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/listings/[id]/similar - Anuncios similares (misma categoría)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) return NextResponse.json({ listings: [] })

    const similar = await db.listing.findMany({
      where: {
        status: 'activo',
        category: listing.category,
        id: { not: id },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })

    return NextResponse.json({ listings: similar })
  } catch {
    return NextResponse.json({ listings: [] })
  }
}
