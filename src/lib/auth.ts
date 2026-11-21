import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [
    CredentialsProvider({
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
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        ;(session.user as any).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
