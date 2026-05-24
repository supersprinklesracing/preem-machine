import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    token?: string;
    customClaims?: Record<string, unknown>;
  }

  interface Session {
    token?: string;
    customClaims?: Record<string, unknown>;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    token?: string;
    customClaims?: Record<string, unknown>;
  }
}
