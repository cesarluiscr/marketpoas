import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/events - Listar eventos del cantón (próximos)
export async function GET() {
  try {
    const now = new Date()
    const events = await db.event.findMany({
      where: {
        OR: [
          { date: { gte: now } },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { date: 'asc' },
      take: 30,
    })
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ events: [] })
  }
}
