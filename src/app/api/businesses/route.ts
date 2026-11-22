import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/businesses - Listar comercios locales
export async function GET() {
  try {
    const businesses = await db.business.findMany({
      orderBy: [
        { verified: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    return NextResponse.json({ businesses })
  } catch {
    return NextResponse.json({ businesses: [] })
  }
}
