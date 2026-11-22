import { db } from '@/lib/db'
import crypto from 'crypto'

const ADMIN_EMAIL = 'admin@marketpoas.cr'
const ADMIN_PASSWORD = 'MARKETPOAS2026'
const ADMIN_NAME = 'Administrador MarketPoás'

function hashPassword(password: string): string {
  // Hash simple con SHA-256 + salt
  const salt = 'marketpoas-salt-2026'
  return crypto.createHash('sha256').update(salt + password).digest('hex')
}

async function main() {
  console.log('Creando usuario administrador...')

  // Verificar si ya existe
  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    // Actualizar rol si ya existe
    await db.user.update({
      where: { id: existing.id },
      data: {
        role: 'admin',
        passwordHash: hashPassword(ADMIN_PASSWORD),
        name: ADMIN_NAME,
      },
    })
    console.log(`✓ Admin actualizado: ${ADMIN_EMAIL}`)
  } else {
    // Crear nuevo admin
    await db.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
        passwordHash: hashPassword(ADMIN_PASSWORD),
        kycStatus: 'verificado',
      },
    })
    console.log(`✓ Admin creado: ${ADMIN_EMAIL}`)
  }

  console.log('')
  console.log('Credenciales del administrador:')
  console.log('  Email:     ' + ADMIN_EMAIL)
  console.log('  Contraseña: ' + ADMIN_PASSWORD)
  console.log('')
  console.log('Para entrar como admin:')
  console.log('1. Toca "Entrar" en la app')
  console.log('2. En la pestaña "Administrador"')
  console.log('3. Ingresa estas credenciales')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
