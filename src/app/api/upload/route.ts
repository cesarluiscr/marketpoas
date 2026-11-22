import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/upload - Subir imagen (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    // Validar tipo
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo no permitido. Solo JPG, PNG, WEBP.' }, { status: 400 })
    }

    // Validar tamaño (5MB máx)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Máximo 5MB' }, { status: 400 })
    }

    // Generar nombre único
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const name = crypto.randomUUID() + '.' + ext
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    // Escribir archivo
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadDir, name), buffer)

    return NextResponse.json({
      url: `/uploads/${name}`,
      ok: true,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 })
  }
}
