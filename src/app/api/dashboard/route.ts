import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/dashboard - Estadísticas del cantón
export async function GET() {
  try {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [total, totalActive, ventas, compras, thisMonth, activeUsers] = await Promise.all([
      db.listing.count(),
      db.listing.count({ where: { status: 'activo' } }),
      db.listing.count({ where: { status: 'activo', type: 'venta' } }),
      db.listing.count({ where: { status: 'activo', type: 'compra' } }),
      db.listing.count({ where: { status: 'activo', createdAt: { gte: monthAgo } } }),
      db.user.count(),
    ])

    // Categorías más populares (sin groupBy)
    const allActive = await db.listing.findMany({
      where: { status: 'activo' },
      select: { category: true, location: true, price: true },
    })

    // Top categorías
    const catCounts = new Map<string, number>()
    const catPrices = new Map<string, { total: number; count: number }>()
    for (const l of allActive) {
      catCounts.set(l.category, (catCounts.get(l.category) ?? 0) + 1)
      const cur = catPrices.get(l.category) ?? { total: 0, count: 0 }
      catPrices.set(l.category, { total: cur.total + l.price, count: cur.count + 1 })
    }
    const topCategories = Array.from(catCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const topThreeCats = topCategories.slice(0, 3).map((c) => c.category)
    const priceByCategory = topThreeCats.map((category) => {
      const data = catPrices.get(category)!
      return {
        category,
        avgPrice: Math.round(data.total / data.count),
        count: data.count,
      }
    })

    // Top distritos
    const distCounts = new Map<string, number>()
    for (const l of allActive) {
      distCounts.set(l.location, (distCounts.get(l.location) ?? 0) + 1)
    }
    const topDistricts = Array.from(distCounts.entries())
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      total,
      totalActive,
      ventas,
      compras,
      thisMonth,
      activeUsers,
      topCategories,
      priceByCategory,
      topDistricts,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({
      total: 0, totalActive: 0, ventas: 0, compras: 0, thisMonth: 0, activeUsers: 0,
      topCategories: [], priceByCategory: [], topDistricts: [],
    })
  }
}
