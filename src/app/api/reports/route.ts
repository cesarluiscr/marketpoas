import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const REASONS = ['spam', 'fraude', 'estafa', 'contenido inapropiado', 'otro'] as const

// POST /api/reports - Denunciar un anuncio
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { listingId, reason, details } = body

    if (!listingId) {
      return NextResponse.json({ error: 'listingId requerido' }, { status: 400 })
    }
    if (!reason || !REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Razón inválida' }, { status: 400 })
    }

    // Verificar que el listing existe
    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
    }

    // Evitar múltiples denuncias del mismo usuario al mismo anuncio
    const userId = session?.user ? (session.user as any).id : null
    if (userId) {
      const existing = await db.report.findFirst({
        where: { listingId, fromUserId: userId, status: 'pendiente' },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Ya denunciaste este anuncio. Gracias por ayudar a mantener MarketPoás seguro.' },
          { status: 409 }
        )
      }
    }

    const report = await db.report.create({
      data: {
        listingId,
        fromUserId: userId,
        reason,
        details: details?.trim() || null,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Error al crear denuncia' }, { status: 500 })
  }
}
