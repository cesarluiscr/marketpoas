import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/favorites/count?listingId=xxx - Contar cuántos usuarios favoritaron un listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    if (!listingId) return NextResponse.json({ count: 0 })

    const count = await db.favorite.count({ where: { listingId } })
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
