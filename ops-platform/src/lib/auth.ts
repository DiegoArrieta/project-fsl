import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'
import authConfig from '@/lib/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email as string },
          })

          if (!usuario || !usuario.activo) {
            return null
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password as string,
            usuario.passwordHash
          )

          if (!passwordMatch) {
            return null
          }

          await prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoAcceso: new Date() },
          })

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
})
