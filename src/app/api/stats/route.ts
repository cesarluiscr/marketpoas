import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/stats - Contadores rápidos para la home
export async function GET() {
  try {
    const total = await db.listing.count({ where: { status: 'activo' } })
    const venta = await db.listing.count({ where: { status: 'activo', type: 'venta' } })
    const compra = await db.listing.count({ where: { status: 'activo', type: 'compra' } })

    return NextResponse.json({ total, venta, compra })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ total: 0, venta: 0, compra: 0 })
  }
}
