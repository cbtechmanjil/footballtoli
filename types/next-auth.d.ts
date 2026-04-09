import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'player';
      playerId?: number | null;
    } & DefaultSession['user']
  }

  interface User {
    id?: string;
    role: 'admin' | 'player';
    playerId?: number | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'player';
    playerId?: number | null;
  }
}
