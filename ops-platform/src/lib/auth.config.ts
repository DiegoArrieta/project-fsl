import type { NextAuthConfig } from 'next-auth'

/**
 * Config compartida y compatible con Edge (middleware).
 * No importar Prisma, bcrypt ni módulos Node-only aquí.
 * El proveedor Credentials vive en `auth.ts` (Node).
 */
export default {
  /** VPS / proxy reverso: evita fallos de sesión en API routes (401 → selects vacíos). */
  trustHost: true,
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
  providers: [],
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'JIGR0MWyI7szzR+RFO43Bl3zLTsnWx2tfKPRaldPekE=',
} satisfies NextAuthConfig
