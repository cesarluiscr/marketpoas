import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Estadísticas para el panel admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true },
    })
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    const [
      totalUsers,
      verifiedUsers,
      pendingKyc,
      totalListings,
      activeListings,
      totalBusinesses,
      verifiedBusinesses,
      totalEvents,
      totalBulletins,
      pendingReports,
      reviewedReports,
      totalOffers,
      pendingOffers,
      totalQuestions,
      unansweredQuestions,
      totalReviews,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { kycStatus: 'verificado' } }),
      db.user.count({ where: { kycStatus: 'pendiente' } }),
      db.listing.count(),
      db.listing.count({ where: { status: 'activo' } }),
      db.business.count(),
      db.business.count({ where: { verified: true } }),
      db.event.count(),
      db.bulletin.count(),
      db.report.count({ where: { status: 'pendiente' } }),
      db.report.count({ where: { status: 'revisado' } }),
      db.offer.count(),
      db.offer.count({ where: { status: 'pendiente' } }),
      db.question.count(),
      db.question.count({ where: { answeredAt: null } }),
      db.review.count(),
    ])

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      pendingKyc,
      totalListings,
      activeListings,
      totalBusinesses,
      verifiedBusinesses,
      totalEvents,
      totalBulletins,
      pendingReports,
      reviewedReports,
      totalOffers,
      pendingOffers,
      totalQuestions,
      unansweredQuestions,
      totalReviews,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
