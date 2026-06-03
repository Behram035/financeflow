import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { SignInSchema } from '@/lib/validation/schemas';

console.log('[Auth] Initializing NextAuth...');

let handlers: any;
let auth: any;
let signIn: any;
let signOut: any;

// Initialize NextAuth
try {
  const config = NextAuth({
    providers: [
      Credentials({
        id: 'credentials',
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: any) {
          try {
            await connectDB();

            const validatedCredentials = SignInSchema.parse(credentials);

            const user = await User.findOne({
              email: validatedCredentials.email,
            }).select('+password');

            if (!user) {
              throw new Error('Invalid credentials');
            }

            const passwordMatch = await user.comparePassword(validatedCredentials.password);

            if (!passwordMatch) {
              throw new Error('Invalid credentials');
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } catch (error) {
            console.error('[Auth] Authorize error:', error);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },

      async session({ session, token }: any) {
        if (session?.user) {
          session.user.id = token.sub || '';
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
    session: {
      strategy: 'jwt' as const,
      maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('[Auth] NextAuth config object:', Object.keys(config));
  console.log('[Auth] handlers:', config.handlers);

  handlers = config.handlers;
  auth = config.auth;
  signIn = config.signIn;
  signOut = config.signOut;

  console.log('[Auth] Successfully initialized NextAuth');
} catch (error) {
  console.error('[Auth] Error initializing NextAuth:', error);
}

export { handlers, auth, signIn, signOut };

