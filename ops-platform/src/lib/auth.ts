import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Buscar usuario por email
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email as string },
          })

          if (!usuario || !usuario.activo) {
            return null
          }

          // Verificar contraseña con bcrypt (salt rounds: 10)
          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            usuario.passwordHash
          )

          if (!passwordMatch) {
            return null
          }

          // Actualizar último acceso
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoAcceso: new Date() },
          })

          // Retornar usuario para la sesión
          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nombre,
          }
        } catch (error) {
          console.error('Error en autenticación:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'JIGR0MWyI7szzR+RFO43Bl3zLTsnWx2tfKPRaldPekE=',
})
