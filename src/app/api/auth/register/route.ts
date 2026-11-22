import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/auth/register - Registrar nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone } = body

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nombre requerido (mínimo 2 caracteres)' }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()

    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailNorm)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Verificar si ya existe
    const existing = await db.user.findUnique({ where: { email: emailNorm } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email. Inicia sesión en su lugar.' },
        { status: 409 }
      )
    }

    // Crear usuario
    const user = await db.user.create({
      data: {
        email: emailNorm,
        name: name.trim(),
        phone: phone?.trim() || null,
      },
    })

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }
}

// GET /api/auth/register?email=xxx - Verificar si un email ya está registrado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) {
      return NextResponse.json({ available: false })
    }
    const emailNorm = email.toLowerCase().trim()
    const existing = await db.user.findUnique({ where: { email: emailNorm } })
    return NextResponse.json({ available: !existing })
  } catch {
    return NextResponse.json({ available: false })
  }
}
