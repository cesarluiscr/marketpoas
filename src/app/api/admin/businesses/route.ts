import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true },
  })
  if (user?.role !== 'admin') return null
  return session
}

// GET /api/admin/businesses - Listar todos los comercios
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const businesses = await db.business.findMany({
    orderBy: [
      { verified: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json({ businesses })
}

// PATCH /api/admin/businesses - Validar/desvalidar un comercio
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { businessId, verified } = body
  if (!businessId) return NextResponse.json({ error: 'businessId requerido' }, { status: 400 })

  const updated = await db.business.update({
    where: { id: businessId },
    data: { verified: Boolean(verified) },
  })

  return NextResponse.json({ ok: true, business: updated })
}

// POST /api/admin/businesses - Crear nuevo comercio
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { name, description, category, address, phone, whatsapp, location } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const business = await db.business.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      category: category || 'comercio',
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      whatsapp: whatsapp?.trim() || null,
      location: location || null,
      verified: true,
    },
  })

  return NextResponse.json({ business }, { status: 201 })
}

// DELETE /api/admin/businesses?id=xxx - Eliminar comercio
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await db.business.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
