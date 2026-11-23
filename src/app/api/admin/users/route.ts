import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

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

// GET /api/admin/users - Listar todos los usuarios
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const users = await db.user.findMany({
    select: {
      id: true, email: true, name: true, role: true,
      kycStatus: true, createdAt: true,
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}

// PATCH /api/admin/users - Cambiar rol de un usuario
export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { userId, role } = body
  if (!userId || !['vecino', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { role },
  })

  return NextResponse.json({ ok: true, user: { id: updated.id, role: updated.role } })
}

// PUT /api/admin/users - Restablecer la contraseña de un usuario (recuperación de cuenta)
export async function PUT(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { userId, newPassword } = body

  if (!userId) {
    return NextResponse.json({ error: 'Falta el usuario' }, { status: 400 })
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json({ error: 'La nueva contraseña es requerida (mínimo 6 caracteres)' }, { status: 400 })
  }
  if (newPassword.length > 100) {
    return NextResponse.json({ error: 'La contraseña es demasiado larga (máximo 100 caracteres)' }, { status: 400 })
  }

  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: hashPassword(newPassword) },
  })

  return NextResponse.json({ ok: true })
}
