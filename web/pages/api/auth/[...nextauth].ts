import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Helper to read env safely
function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v;
}

const allowedEmails: Set<string> = new Set(
  (getEnv('ADMIN_EMAILS', '') || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnv('GOOGLE_CLIENT_ID', '') || 'missing',
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET', '') || 'missing'
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow pre-approved admin emails
      if (!user?.email) return false;
      return allowedEmails.has(user.email.toLowerCase());
    },
    async session({ session, token }) {
      if (session.user?.email && allowedEmails.has(session.user.email.toLowerCase())) {
        (session as any).isAdmin = true;
      } else {
        (session as any).isAdmin = false;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/admin/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export default handler;
