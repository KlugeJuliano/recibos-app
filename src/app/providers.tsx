'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

type ProvidersProps = {
  children: React.ReactNode;
  session?: Session | null;
};

/**
 * Client component that wraps the application with the NextAuth SessionProvider
 * to make authentication state available throughout the application.
 */
export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}

