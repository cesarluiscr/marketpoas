import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/me - Información del usuario logueado (incluye rol actual)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ user: null })

    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true, email: true, name: true, role: true,
        kycStatus: true, phone: true, image: true,
      },
    })

    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
