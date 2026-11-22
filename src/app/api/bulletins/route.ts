import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/bulletins - Listar avisos del tablón de la municipalidad
export async function GET() {
  try {
    const now = new Date()
    const bulletins = await db.bulletin.findMany({
      where: {
        OR: [
          { publishUntil: null },
          { publishUntil: { gte: now } },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 30,
    })
    return NextResponse.json({ bulletins })
  } catch {
    return NextResponse.json({ bulletins: [] })
  }
}
