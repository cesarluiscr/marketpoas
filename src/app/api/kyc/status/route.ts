import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/kyc/status - Verificar estado KYC del usuario logueado
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ status: 'no_verificado' })
    const userId = (session.user as any).id

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, kycRejectReason: true, kycSubmittedAt: true, kycReviewedAt: true },
    })
    if (!user) return NextResponse.json({ status: 'no_verificado' })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ status: 'no_verificado' })
  }
}
