import NextAuth, { type DefaultSession } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      roles?: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    error?: string;
  }
}

async function refreshAccessToken(token: {
  refreshToken?: string;
  expiresAt?: number;
}): Promise<{
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}> {
  try {
    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID ?? "web",
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? "web-secret",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken ?? "",
    });

    const issuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8081/realms/exameo";
    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const refreshed = await response.json();
    if (!response.ok) {
      throw new Error(refreshed.error ?? "RefreshAccessTokenError");
    }

    return {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 0),
    };
  } catch {
    return { error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "web",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "web-secret",
      issuer: process.env.KEYCLOAK_ISSUER ?? "http://localhost:8081/realms/exameo",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      if (profile && typeof (profile as { realm_access?: { roles?: string[] } }).realm_access === "object") {
        token.roles = (profile as { realm_access?: { roles?: string[] } }).realm_access?.roles ?? [];
      }

      const stillValid = token.expiresAt && Date.now() / 1000 < token.expiresAt - 30;
      if (stillValid) {
        return token;
      }

      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token);
        return { ...token, ...refreshed };
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.roles = token.roles ?? [];
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
