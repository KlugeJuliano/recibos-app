import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { usuarios } from "./lib/mokdata";
import { Users } from "./types";

// Define types for session and user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      lojaId: string;
    }
  }
}

// Extend JWT type to include our custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    lojaId?: string;
  }
}

// Create a properly typed auth configuration for NextAuth.js
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          console.log("Missing credentials");
          return null;
        }

        // Log login attempt (for debugging)
        console.log(`Login attempt for: ${credentials.email}`);

        // Find user in mock data
        const user = usuarios.find(user => 
          user.email === credentials.email && 
          user.password === credentials.password
        );

        if (user) {
          console.log(`User found: ${user.email}`);
          // Return user data without the password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            lojaId: user.lojaId
          };
        }

        console.log(`User not found: ${credentials.email}`);
        return null;
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      try {
        // Add user data to the token when first created
        if (user) {
          token.id = user.id;
          token.name = user.name ?? undefined;
          token.email = user.email ?? undefined;
          // Make sure we capture role and lojaId for authorization
          if ('role' in user) token.role = user.role as string;
          if ('lojaId' in user) token.lojaId = user.lojaId as string;
          console.log('JWT token created with user data:', { id: token.id, email: token.email });
        }
        return token;
      } catch (error) {
        console.error('Error in JWT callback:', error);
        return token;
      }
    },
    session: ({ session, token }) => {
      try {
        // Add token data to the session
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name as string;
          session.user.email = token.email as string;
          session.user.role = token.role as string;
          session.user.lojaId = token.lojaId as string;
          console.log('Session created with user data:', { 
            id: session.user.id, 
            email: session.user.email,
            role: session.user.role,
            lojaId: session.user.lojaId
          });
        }
        return session;
      } catch (error) {
        console.error('Error in Session callback:', error);
        return session;
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

// Create and export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Helper for getting session in server components
export async function auth() {
  return getServerSession(authOptions);
}

