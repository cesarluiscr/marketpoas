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
        const name = credentials.name?.trim() || email.split('@')[0]

        // Buscar o crear usuario
        let user = await db.user.findUnique({ where: { email } })
        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name,
            },
          })
        } else if (name && name !== user.name && user.name === email.split('@')[0]) {
          // Actualizar nombre si lo acaba de ingresar
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
