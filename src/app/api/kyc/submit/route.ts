import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/kyc/submit - Enviar verificación de identidad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    const userId = (session.user as any).id

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    if (user.kycStatus === 'verificado') {
      return NextResponse.json({ error: 'Ya estás verificado ✅' }, { status: 400 })
    }
    if (user.kycStatus === 'pendiente') {
      return NextResponse.json({ error: 'Tu verificación está en revisión' }, { status: 400 })
    }

    const formData = await request.formData()
    const idImage = formData.get('idImage') as File | null
    const selfieImage = formData.get('selfieImage') as File | null

    if (!idImage || !selfieImage) {
      return NextResponse.json({ error: 'Foto de cédula y selfie son requeridas' }, { status: 400 })
    }

    // Validar tipo y tamaño
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    for (const file of [idImage, selfieImage]) {
      if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: 'Solo JPG, PNG o WEBP' }, { status: 400 })
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Máximo 5MB por foto' }, { status: 400 })
      }
    }

    // Guardar imágenes en /public/uploads/kyc/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc')
    await fs.mkdir(uploadDir, { recursive: true })

    const saveFile = async (file: File, prefix: string) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const name = `${prefix}-${userId}-${crypto.randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(path.join(uploadDir, name), buffer)
      return `/uploads/kyc/${name}`
    }

    const idImagePath = await saveFile(idImage, 'id')
    const selfieImagePath = await saveFile(selfieImage, 'selfie')

    // Actualizar usuario
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'pendiente',
        kycIdImage: idImagePath,
        kycSelfieImage: selfieImagePath,
        kycSubmittedAt: new Date(),
        kycReviewedAt: null,
        kycRejectReason: null,
      },
    })

    return NextResponse.json({
      ok: true,
      status: 'pendiente',
      message: 'Verificación enviada. Te avisaremos cuando se apruebe (usualmente 24-48h).',
    })
  } catch (error) {
    console.error('KYC submit error:', error)
    return NextResponse.json({ error: 'Error al enviar verificación' }, { status: 500 })
  }
}
