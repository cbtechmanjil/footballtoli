import NextAuth, { DefaultSession } from 'next-auth';

    user: {
      id: string;
      role: 'admin' | 'player';
      playerId?: number;
    } & DefaultSession['user']
  }

  interface User {
    id: string;
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
