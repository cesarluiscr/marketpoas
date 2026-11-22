import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import crypto from 'crypto'

function hashPassword(password: string): string {
  const salt = 'marketpoas-salt-2026'
  return crypto.createHash('sha256').update(salt + password).digest('hex')
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tu@correo.com' },
        name: { label: 'Nombre', type: 'text', placeholder: 'Tu nombre' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const email = credentials.email.toLowerCase().trim()
        const name = credentials.name?.trim()

        // Buscar usuario existente (el registro es aparte ahora)
        let user = await db.user.findUnique({ where: { email } })

        if (!user) {
          // No existe: no se puede loguear. Debe registrarse primero.
          return null
        }

        // Si se proporcionó nombre y el usuario no tiene, actualizar
        if (name && name !== user.name && (!user.name || user.name === email.split('@')[0])) {
          user = await db.user.update({ where: { id: user.id }, data: { name } })
        }

        return {
          id: user.id,
          email: user.email ?? '',
          name: user.name ?? '',
          image: user.image ?? '',
          role: user.role,
        }
      },
    }),
    CredentialsProvider({
      id: 'admin',
      name: 'Administrador',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@marketpoas.cr' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()
        const password = credentials.password

        const user = await db.user.findUnique({ where: { email } })
        if (!user) return null
        if (user.role !== 'admin') return null
        if (!user.passwordHash) return null

        const hash = hashPassword(password)
        if (hash !== user.passwordHash) return null

        return {
          id: user.id,
          email: user.email ?? '',
          name: user.name ?? '',
          image: user.image ?? '',
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        ;(token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = (token as any).role
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
