import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'

export const dynamic = 'force-dynamic'

// GET /api/auth/change-password - Indica si la cuenta ya tiene contraseña definida
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 401 })
  }
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { passwordHash: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ hasPassword: !!user.passwordHash })
}

// POST /api/auth/change-password - Cambiar la contraseña del usuario con sesión activa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña es requerida (mínimo 6 caracteres)' },
        { status: 400 }
      )
    }
    if (newPassword.length > 100) {
      return NextResponse.json({ error: 'La contraseña es demasiado larga (máximo 100 caracteres)' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: { id: true, passwordHash: true },
    })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    // Si la cuenta ya tiene contraseña, hay que confirmar la actual
    if (user.passwordHash) {
      if (!currentPassword || !verifyPassword(String(currentPassword), user.passwordHash)) {
        return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
      }
    }
    // Si es una cuenta antigua sin contraseña, se puede definir sin confirmar la actual

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Error al cambiar la contraseña' }, { status: 500 })
  }
}
