import crypto from 'crypto'

const SALT = 'marketpoas-salt-2026'

// Hash de contraseña (mismo esquema usado por el acceso admin desde el inicio)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(SALT + password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!hash) return false
  return hashPassword(password) === hash
}
